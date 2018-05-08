/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import typeof * as HackService from '../../nuclide-hack-rpc/lib/HackService';
import type {LanguageService} from '../../nuclide-language-service/lib/LanguageService';
import type {ServerConnection} from '../../nuclide-remote-connection';
import type {AtomLanguageServiceConfig} from '../../nuclide-language-service/lib/AtomLanguageService';
import type {
  AutocompleteResult,
  Completion,
} from '../../nuclide-language-service/lib/LanguageService';

import invariant from 'assert';

import {NullLanguageService} from '../../nuclide-language-service-rpc';
import {getServiceByConnection} from '../../nuclide-remote-connection';
import {
  HACK_CONFIG_FILE_NAME,
  HACK_FILE_EXTENSIONS,
} from '../../nuclide-hack-common/lib/constants';
import {getConfig, logger} from './config';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {
  AtomLanguageService,
  getHostServices,
  updateAutocompleteResults,
  updateAutocompleteFirstResults,
} from '../../nuclide-language-service';
import {HACK_GRAMMARS} from '../../nuclide-hack-common';
import {
  sortAndFilterCompletions,
  getResultPrefix,
  getReplacementPrefix,
  findHackPrefix,
} from '../../nuclide-hack-common/lib/autocomplete';
import {getFileSystemServiceByNuclideUri} from '../../nuclide-remote-connection';
import passesGK from '../../commons-node/passesGK';

const HACK_SERVICE_NAME = 'HackService';

async function getUseFfpAutocomplete(): Promise<boolean> {
  return passesGK('nuclide_hack_use_ffp_autocomplete');
}

async function getUseEnhancedHover(): Promise<boolean> {
  return passesGK('nuclide_hack_use_enhanced_hover');
}

async function getUseTextEditAutocomplete(): Promise<boolean> {
  return passesGK('nuclide_hack_use_textedit_autocomplete');
}

async function getUseSignatureHelp(): Promise<boolean> {
  return passesGK('nuclide_hack_signature_help');
}

async function connectionToHackService(
  connection: ?ServerConnection,
): Promise<LanguageService> {
  const hackService: HackService = getServiceByConnection(
    HACK_SERVICE_NAME,
    connection,
  );
  const config = getConfig();
  const fileNotifier = await getNotifierByConnection(connection);

  if (config.legacyHackIde) {
    return hackService.initialize(
      config.hhClientPath,
      config.logLevel,
      fileNotifier,
    );
  } else {
    const host = await getHostServices();
    const autocompleteArg = (await getUseFfpAutocomplete())
      ? ['--ffp-autocomplete']
      : [];
    const enhancedHoverArg = (await getUseEnhancedHover())
      ? ['--enhanced-hover']
      : [];
    const lspService = await hackService.initializeLsp(
      config.hhClientPath, // command
      ['lsp', '--from', 'nuclide', ...autocompleteArg, ...enhancedHoverArg], // arguments
      [HACK_CONFIG_FILE_NAME], // project file
      HACK_FILE_EXTENSIONS, // which file-notifications should be sent to LSP
      config.logLevel,
      fileNotifier,
      host,
      {
        useTextEditAutocomplete: await getUseTextEditAutocomplete(),
      },
    );
    return lspService || new NullLanguageService();
  }
}

async function createLanguageService(): Promise<
  AtomLanguageService<LanguageService>,
> {
  const usingLsp = !getConfig().legacyHackIde;
  const atomConfig: AtomLanguageServiceConfig = {
    name: 'Hack',
    grammars: HACK_GRAMMARS,
    highlight: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'hack.codehighlight',
    },
    outline: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'hack.outline',
    },
    coverage: {
      version: '0.0.0',
      priority: 10,
      analyticsEventName: 'hack:run-type-coverage',
      icon: 'nuclicon-hack',
    },
    definition: {
      version: '0.1.0',
      priority: 20,
      definitionEventName: 'hack.get-definition',
    },
    typeHint: {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'hack.typeHint',
    },
    codeFormat: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'hack.formatCode',
      canFormatRanges: true,
      canFormatAtPosition: usingLsp,
    },
    findReferences: {
      version: '0.1.0',
      analyticsEventName: 'hack:findReferences',
    },
    autocomplete: {
      inclusionPriority: 1,
      // The context-sensitive hack autocompletions are more relevant than snippets.
      suggestionPriority: 3,
      disableForSelector: null,
      excludeLowerPriority: false,
      analytics: {
        eventName: 'nuclide-hack',
        shouldLogInsertedSuggestion: true,
      },
      autocompleteCacherConfig: usingLsp
        ? {
            updateResults: updateAutocompleteResults,
            updateFirstResults: updateAutocompleteFirstResults,
          }
        : {
            updateResults: hackUpdateAutocompleteResults,
          },
      supportsResolve: true,
    },
    diagnostics: {
      version: '0.2.0',
      analyticsEventName: 'hack.observe-diagnostics',
    },
    signatureHelp: (await getUseSignatureHelp())
      ? {
          version: '0.1.0',
          priority: 1,
          triggerCharacters: new Set(['(', ',']),
          analyticsEventName: 'hack.signatureHelp',
        }
      : undefined,
  };

  return new AtomLanguageService(
    connectionToHackService,
    atomConfig,
    null,
    logger,
  );
}

// This needs to be initialized eagerly for Hack Symbol search and the HHVM Toolbar.
export let hackLanguageService: Promise<
  AtomLanguageService<LanguageService>,
> = createLanguageService();

export function resetHackLanguageService(): void {
  hackLanguageService.then(value => value.dispose());
  // Reset to an unactivated LanguageService when the Hack package is deactivated.
  // TODO: Sort out the dependencies between the HHVM toolbar, quick-open and Hack.
  hackLanguageService = createLanguageService();
}

export async function getHackLanguageForUri(
  uri: ?NuclideUri,
): Promise<?LanguageService> {
  return (await hackLanguageService).getLanguageServiceForUri(uri);
}

export async function isFileInHackProject(
  fileUri: NuclideUri,
): Promise<boolean> {
  const fileSystemService = getFileSystemServiceByNuclideUri(fileUri);
  const foundDir = await fileSystemService.findNearestAncestorNamed(
    '.hhconfig',
    fileUri,
  );
  return foundDir != null;
}

function hackUpdateAutocompleteResults(
  _originalRequest: atom$AutocompleteRequest,
  request: atom$AutocompleteRequest,
  firstResult: AutocompleteResult,
): ?AutocompleteResult {
  if (firstResult.isIncomplete) {
    return null;
  }
  const replacementPrefix = findHackPrefix(
    request.editor.getBuffer(),
    request.bufferPosition,
  );
  const updatedCompletions = updateReplacementPrefix(
    request,
    firstResult.items,
    replacementPrefix,
  );
  return {
    ...firstResult,
    items: sortAndFilterCompletions(updatedCompletions, replacementPrefix),
  };
}

function updateReplacementPrefix(
  request: atom$AutocompleteRequest,
  firstResult: Array<Completion>,
  prefixCandidate: string,
): Array<Completion> {
  const {editor, bufferPosition} = request;
  const contents = editor.getText();
  const offset = editor.getBuffer().characterIndexForPosition(bufferPosition);
  return firstResult.map(completion => {
    const name = completion.displayText;
    invariant(name != null);
    const resultPrefix = getResultPrefix(contents, offset, name);
    const replacementPrefix = getReplacementPrefix(
      resultPrefix,
      prefixCandidate,
    );
    return {
      ...completion,
      replacementPrefix,
    };
  });
}
