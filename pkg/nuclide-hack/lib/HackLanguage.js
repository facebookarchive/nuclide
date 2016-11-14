'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFileInHackProject = exports.hackLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let connectionToHackService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const hackService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(HACK_SERVICE_NAME, connection);
    const config = (0, (_config || _load_config()).getConfig)();
    const useIdeConnection = config.useIdeConnection;
    // TODO:     || (await passesGK('nuclide_hack_use_persistent_connection'));
    const fileNotifier = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);
    const languageService = yield hackService.initialize(config.hhClientPath, useIdeConnection, config.logLevel, fileNotifier);

    return languageService;
  });

  return function connectionToHackService(_x) {
    return _ref.apply(this, arguments);
  };
})();

let isFileInHackProject = exports.isFileInHackProject = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (fileUri) {
    const fileSystemService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(fileUri);
    const foundDir = yield fileSystemService.findNearestFile('.hhconfig', (_nuclideUri || _load_nuclideUri()).default.getPath(fileUri));
    return foundDir != null;
  });

  return function isFileInHackProject(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

exports.resetHackLanguageService = resetHackLanguageService;
exports.getHackLanguageForUri = getHackLanguageForUri;

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

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HACK_SERVICE_NAME = 'HackService';

const diagnosticsConfig = (0, (_config || _load_config()).getConfig)().useIdeConnection ? {
  version: '0.2.0',
  analyticsEventName: 'hack.observe-diagnostics'
} : {
  version: '0.1.0',
  shouldRunOnTheFly: false,
  analyticsEventName: 'hack.run-diagnostics'
};

const atomConfig = {
  name: 'Hack',
  grammars: (_nuclideHackCommon || _load_nuclideHackCommon()).HACK_GRAMMARS,
  highlights: {
    version: '0.0.0',
    priority: 1,
    analyticsEventName: 'hack.codehighlight'
  },
  outlines: {
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
    analyticsEventName: 'hack.formatCode'
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
    excludeLowerPriority: false,
    analyticsEventName: 'hack.getAutocompleteSuggestions'
  },
  diagnostics: diagnosticsConfig
};

// This needs to be initialized eagerly for Hack Symbol search and the HHVM Toolbar.
let hackLanguageService = exports.hackLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToHackService, atomConfig);

function resetHackLanguageService() {
  hackLanguageService.dispose();
  // Reset to an unactivated LanguageService when the Hack package is deactivated.
  // TODO: Sort out the dependencies between the HHVM toolbar, quick-open and Hack.
  exports.hackLanguageService = hackLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToHackService, atomConfig);
}

function getHackLanguageForUri(uri) {
  return hackLanguageService.getLanguageServiceForUri(uri);
}