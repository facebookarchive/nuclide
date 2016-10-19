Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var connectionToHackService = _asyncToGenerator(function* (connection) {
  var hackService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(HACK_SERVICE_NAME, connection);
  var config = (0, (_config || _load_config()).getConfig)();
  var useIdeConnection = config.useIdeConnection;
  // TODO:     || (await passesGK('nuclide_hack_use_persistent_connection'));
  var fileNotifier = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);
  var languageService = yield hackService.initialize(config.hhClientPath, useIdeConnection, config.logLevel, fileNotifier);

  return languageService;
});

exports.resetHackLanguageService = resetHackLanguageService;
exports.getHackLanguageForUri = getHackLanguageForUri;
exports.isFileInHackProject = isFileInHackProject;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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

var HACK_SERVICE_NAME = 'HackService';

var diagnosticsConfig = (0, (_config || _load_config()).getConfig)().useIdeConnection ? {
  version: '0.2.0',
  analyticsEventName: 'hack.observe-diagnostics'
} : {
  version: '0.1.0',
  shouldRunOnTheFly: false,
  analyticsEventName: 'hack.run-diagnostics'
};

var atomConfig = {
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
var hackLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToHackService, atomConfig);

exports.hackLanguageService = hackLanguageService;

function resetHackLanguageService() {
  hackLanguageService.dispose();
  // Reset to an unactivated LanguageService when the Hack package is deactivated.
  // TODO: Sort out the dependencies between the HHVM toolbar, quick-open and Hack.
  exports.hackLanguageService = exports.hackLanguageService = hackLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToHackService, atomConfig);
}

function getHackLanguageForUri(uri) {
  return hackLanguageService.getLanguageServiceForUri(uri);
}

function isFileInHackProject(fileUri) {
  return hackLanguageService.isFileInProject(fileUri);
}