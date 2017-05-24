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

import type {BusySignalService} from '../../nuclide-busy-signal';
import type {LinterProvider} from 'atom-ide-ui';
import typeof * as PythonService
  from '../../nuclide-python-rpc/lib/PythonService';
import type {ServerConnection} from '../../nuclide-remote-connection';
import type {
  AtomLanguageServiceConfig,
} from '../../nuclide-language-service/lib/AtomLanguageService';
import type {
  LanguageService,
} from '../../nuclide-language-service/lib/LanguageService';

import {GRAMMARS, GRAMMAR_SET} from './constants';
import {getLintOnFly} from './config';
import LintHelpers from './LintHelpers';
import {getServiceByConnection} from '../../nuclide-remote-connection';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {AtomLanguageService} from '../../nuclide-language-service';
import {
  getShowGlobalVariables,
  getAutocompleteArguments,
  getIncludeOptionalArguments,
} from './config';

const PYTHON_SERVICE_NAME = 'PythonService';

let busySignalService: ?BusySignalService = null;

async function connectionToPythonService(
  connection: ?ServerConnection,
): Promise<LanguageService> {
  const pythonService: PythonService = getServiceByConnection(
    PYTHON_SERVICE_NAME,
    connection,
  );
  const fileNotifier = await getNotifierByConnection(connection);
  const languageService = await pythonService.initialize(fileNotifier, {
    showGlobalVariables: getShowGlobalVariables(),
    autocompleteArguments: getAutocompleteArguments(),
    includeOptionalArguments: getIncludeOptionalArguments(),
  });

  return languageService;
}

const atomConfig: AtomLanguageServiceConfig = {
  name: 'Python',
  grammars: GRAMMARS,
  outline: {
    version: '0.0.0',
    priority: 1,
    analyticsEventName: 'python.outline',
  },
  codeFormat: {
    version: '0.0.0',
    priority: 1,
    analyticsEventName: 'python.formatCode',
    canFormatRanges: false,
    canFormatAtPosition: false,
  },
  findReferences: {
    version: '0.0.0',
    analyticsEventName: 'python.get-references',
  },
  autocomplete: {
    version: '2.0.0',
    inclusionPriority: 5,
    suggestionPriority: 5, // Higher than the snippets provider.
    disableForSelector: '.source.python .comment, .source.python .string',
    excludeLowerPriority: false,
    analyticsEventName: 'nuclide-python:getAutocompleteSuggestions',
    autocompleteCacherConfig: null,
    onDidInsertSuggestionAnalyticsEventName: 'nuclide-python.autocomplete-chosen',
  },
  definition: {
    version: '0.0.0',
    priority: 20,
    definitionEventName: 'python.get-definition',
    definitionByIdEventName: 'python.get-definition-by-id',
  },
};

let pythonLanguageService: ?AtomLanguageService<LanguageService> = null;

export function activate() {
  if (pythonLanguageService == null) {
    pythonLanguageService = new AtomLanguageService(
      connectionToPythonService,
      atomConfig,
    );
    pythonLanguageService.activate();
  }
}

export function provideLint(): LinterProvider {
  return {
    grammarScopes: Array.from(GRAMMAR_SET),
    scope: 'file',
    lintOnFly: getLintOnFly(),
    name: 'nuclide-python',
    lint(editor) {
      if (busySignalService == null) {
        return LintHelpers.lint(editor);
      }
      return busySignalService.reportBusyWhile(
        `Python: Waiting for flake8 lint results for \`${editor.getTitle()}\``,
        () => LintHelpers.lint(editor),
      );
    },
  };
}

export function consumeBusySignal(service: BusySignalService): IDisposable {
  busySignalService = service;
  return {
    dispose: () => {
      busySignalService = null;
    },
  };
}

export function deactivate() {
  if (pythonLanguageService != null) {
    pythonLanguageService.dispose();
    pythonLanguageService = null;
  }
  if (busySignalService != null) {
    busySignalService.dispose();
  }
}
