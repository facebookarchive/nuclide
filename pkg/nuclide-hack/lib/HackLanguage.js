'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFileInHackProject = exports.getHackLanguageForUri = exports.hackLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let connectionToHackService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const hackService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(HACK_SERVICE_NAME, connection);
    const config = (0, (_config || _load_config()).getConfig)();
    const fileNotifier = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);
    const languageService = yield hackService.initialize(config.hhClientPath, config.logLevel, fileNotifier);

    return languageService;
  });

  return function connectionToHackService(_x) {
    return _ref.apply(this, arguments);
  };
})();

let createLanguageService = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    const atomConfig = {
      name: 'Hack',
      grammars: (_nuclideHackCommon || _load_nuclideHackCommon()).HACK_GRAMMARS,
      highlight: {
        version: '0.0.0',
        priority: 1,
        analyticsEventName: 'hack.codehighlight'
      },
      outline: {
        version: '0.0.0',
        priority: 1,
        analyticsEventName: 'hack.outline'
      },
      coverage: {
        version: '0.0.0',
        priority: 10,
        analyticsEventName: 'hack:run-type-coverage'
      },
      definition: {
        version: '0.0.0',
        priority: 20,
        definitionEventName: 'hack.get-definition',
        definitionByIdEventName: 'hack.get-definition-by-id'
      },
      typeHint: {
        version: '0.0.0',
        priority: 1,
        analyticsEventName: 'hack.typeHint'
      },
      codeFormat: {
        version: '0.0.0',
        priority: 1,
        analyticsEventName: 'hack.formatCode',
        formatEntireFile: false
      },
      findReferences: {
        version: '0.0.0',
        analyticsEventName: 'hack:findReferences'
      },
      evaluationExpression: {
        version: '0.0.0',
        analyticsEventName: 'hack.evaluationExpression'
      },
      autocomplete: {
        version: '2.0.0',
        inclusionPriority: 1,
        // The context-sensitive hack autocompletions are more relevant than snippets.
        suggestionPriority: 3,
        disableForSelector: null,
        excludeLowerPriority: false,
        analyticsEventName: 'hack.getAutocompleteSuggestions',
        autocompleteCacherConfig: {
          updateResults: updateAutocompleteResults,
          gatekeeper: 'nuclide_hack_fast_autocomplete'
        },
        onDidInsertSuggestionAnalyticsEventName: 'hack.autocomplete-chosen'
      },
      diagnostics: {
        version: '0.2.0',
        analyticsEventName: 'hack.observe-diagnostics'
      }
    };

    return new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToHackService, atomConfig, null, (_config || _load_config()).logger);
  });

  return function createLanguageService() {
    return _ref2.apply(this, arguments);
  };
})();

// This needs to be initialized eagerly for Hack Symbol search and the HHVM Toolbar.


let getHackLanguageForUri = exports.getHackLanguageForUri = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (uri) {
    return (yield hackLanguageService).getLanguageServiceForUri(uri);
  });

  return function getHackLanguageForUri(_x2) {
    return _ref3.apply(this, arguments);
  };
})();

let isFileInHackProject = exports.isFileInHackProject = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (fileUri) {
    const fileSystemService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(fileUri);
    const foundDir = yield fileSystemService.findNearestFile('.hhconfig', (_nuclideUri || _load_nuclideUri()).default.getPath(fileUri));
    return foundDir != null;
  });

  return function isFileInHackProject(_x3) {
    return _ref4.apply(this, arguments);
  };
})();

exports.resetHackLanguageService = resetHackLanguageService;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
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

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const HACK_SERVICE_NAME = 'HackService';

let hackLanguageService = exports.hackLanguageService = createLanguageService();

function resetHackLanguageService() {
  hackLanguageService.then(value => value.dispose());
  // Reset to an unactivated LanguageService when the Hack package is deactivated.
  // TODO: Sort out the dependencies between the HHVM toolbar, quick-open and Hack.
  exports.hackLanguageService = hackLanguageService = createLanguageService();
}

function updateAutocompleteResults(request, firstResult) {
  if (firstResult == null) {
    return null;
  }
  const replacementPrefix = (0, (_autocomplete || _load_autocomplete()).findHackPrefix)(request.editor.getBuffer(), request.bufferPosition);
  const updatedCompletions = updateReplacementPrefix(request, firstResult, replacementPrefix);
  return (0, (_autocomplete || _load_autocomplete()).sortAndFilterCompletions)(updatedCompletions, replacementPrefix);
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