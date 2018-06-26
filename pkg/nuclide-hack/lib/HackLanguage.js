'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hackLanguageService = undefined;
exports.resetHackLanguageService = resetHackLanguageService;
exports.getHackLanguageForUri = getHackLanguageForUri;
exports.isFileInHackProject = isFileInHackProject;

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _constants;

function _load_constants() {
  return _constants = require('../../nuclide-hack-common/lib/constants');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
}

var _nuclideHackCommon;

function _load_nuclideHackCommon() {
  return _nuclideHackCommon = require('../../nuclide-hack-common');
}

var _autocomplete;

function _load_autocomplete() {
  return _autocomplete = require('../../nuclide-hack-common/lib/autocomplete');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HACK_SERVICE_NAME = 'HackService'; /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          *  strict-local
                                          * @format
                                          */

async function getUseFfpAutocomplete() {
  return (0, (_passesGK || _load_passesGK()).default)('nuclide_hack_use_ffp_autocomplete');
}

async function getUseEnhancedHover() {
  return (0, (_passesGK || _load_passesGK()).default)('nuclide_hack_use_enhanced_hover');
}

async function getUseTextEditAutocomplete() {
  return (0, (_passesGK || _load_passesGK()).default)('nuclide_hack_use_textedit_autocomplete');
}

async function getUseSignatureHelp() {
  return (0, (_passesGK || _load_passesGK()).default)('nuclide_hack_signature_help');
}

async function connectionToHackService(connection) {
  const hackService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(HACK_SERVICE_NAME, connection);
  const config = (0, (_config || _load_config()).getConfig)();
  const fileNotifier = await (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);

  if (config.legacyHackIde) {
    return hackService.initialize(config.hhClientPath, config.logLevel, fileNotifier);
  } else {
    const host = await (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)();
    const autocompleteArg = (await getUseFfpAutocomplete()) ? ['--ffp-autocomplete'] : [];
    const enhancedHoverArg = (await getUseEnhancedHover()) ? ['--enhanced-hover'] : [];
    const lspService = await hackService.initializeLsp(config.hhClientPath, // command
    ['lsp', '--from', 'nuclide', ...autocompleteArg, ...enhancedHoverArg], // arguments
    [(_constants || _load_constants()).HACK_CONFIG_FILE_NAME], // project file
    (_constants || _load_constants()).HACK_FILE_EXTENSIONS, // which file-notifications should be sent to LSP
    config.logLevel, fileNotifier, host, {
      useTextEditAutocomplete: await getUseTextEditAutocomplete()
    });
    return lspService || new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService();
  }
}

async function createLanguageService() {
  const usingLsp = !(0, (_config || _load_config()).getConfig)().legacyHackIde;
  const atomConfig = {
    name: 'Hack',
    grammars: (_nuclideHackCommon || _load_nuclideHackCommon()).HACK_GRAMMARS,
    highlight: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'hack.codehighlight'
    },
    outline: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'hack.outline'
    },
    coverage: {
      version: '0.0.0',
      priority: 10,
      analyticsEventName: 'hack:run-type-coverage',
      icon: 'nuclicon-hack'
    },
    definition: {
      version: '0.1.0',
      priority: 20,
      definitionEventName: 'hack.get-definition'
    },
    typeHint: {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'hack.typeHint'
    },
    codeFormat: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'hack.formatCode',
      canFormatRanges: true,
      canFormatAtPosition: usingLsp
    },
    findReferences: {
      version: '0.1.0',
      analyticsEventName: 'hack:findReferences'
    },
    rename: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'hack:rename'
    },
    autocomplete: {
      inclusionPriority: 1,
      // The context-sensitive hack autocompletions are more relevant than snippets.
      suggestionPriority: 3,
      disableForSelector: null,
      excludeLowerPriority: false,
      analytics: {
        eventName: 'nuclide-hack',
        shouldLogInsertedSuggestion: true
      },
      autocompleteCacherConfig: usingLsp ? {
        updateResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteResults,
        updateFirstResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteFirstResults
      } : {
        updateResults: hackUpdateAutocompleteResults
      },
      supportsResolve: true
    },
    diagnostics: {
      version: '0.2.0',
      analyticsEventName: 'hack.observe-diagnostics'
    },
    signatureHelp: (await getUseSignatureHelp()) ? {
      version: '0.1.0',
      priority: 1,
      triggerCharacters: new Set(['(', ',']),
      showDocBlock: false,
      analyticsEventName: 'hack.signatureHelp'
    } : undefined
  };

  return new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToHackService, atomConfig, null, (_config || _load_config()).logger);
}

// This needs to be initialized eagerly for Hack Symbol search and the HHVM Toolbar.
let hackLanguageService = exports.hackLanguageService = createLanguageService();

function resetHackLanguageService() {
  hackLanguageService.then(value => value.dispose());
  // Reset to an unactivated LanguageService when the Hack package is deactivated.
  // TODO: Sort out the dependencies between the HHVM toolbar, quick-open and Hack.
  exports.hackLanguageService = hackLanguageService = createLanguageService();
}

async function getHackLanguageForUri(uri) {
  return (await hackLanguageService).getLanguageServiceForUri(uri);
}

async function isFileInHackProject(fileUri) {
  const fileSystemService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(fileUri);
  const foundDir = await fileSystemService.findNearestAncestorNamed('.hhconfig', fileUri);
  return foundDir != null;
}

function hackUpdateAutocompleteResults(_originalRequest, request, firstResult) {
  if (firstResult.isIncomplete) {
    return null;
  }
  const replacementPrefix = (0, (_autocomplete || _load_autocomplete()).findHackPrefix)(request.editor.getBuffer(), request.bufferPosition);
  const updatedCompletions = updateReplacementPrefix(request, firstResult.items, replacementPrefix);
  return Object.assign({}, firstResult, {
    items: (0, (_autocomplete || _load_autocomplete()).sortAndFilterCompletions)(updatedCompletions, replacementPrefix)
  });
}

function updateReplacementPrefix(request, firstResult, prefixCandidate) {
  const { editor, bufferPosition } = request;
  const contents = editor.getText();
  const offset = editor.getBuffer().characterIndexForPosition(bufferPosition);
  return firstResult.map(completion => {
    const name = completion.displayText;

    if (!(name != null)) {
      throw new Error('Invariant violation: "name != null"');
    }

    const resultPrefix = (0, (_autocomplete || _load_autocomplete()).getResultPrefix)(contents, offset, name);
    const replacementPrefix = (0, (_autocomplete || _load_autocomplete()).getReplacementPrefix)(resultPrefix, prefixCandidate);
    return Object.assign({}, completion, {
      replacementPrefix
    });
  });
}