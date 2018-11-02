"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetHackLanguageService = resetHackLanguageService;
exports.getHackLanguageForUri = getHackLanguageForUri;
exports.isFileInHackProject = isFileInHackProject;
exports.hackLanguageService = void 0;

function _passesGK() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageServiceRpc() {
  const data = require("../../nuclide-language-service-rpc");

  _nuclideLanguageServiceRpc = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../../nuclide-hack-common/lib/constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFiles() {
  const data = require("../../nuclide-open-files");

  _nuclideOpenFiles = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageService() {
  const data = require("../../nuclide-language-service");

  _nuclideLanguageService = function () {
    return data;
  };

  return data;
}

function _nuclideHackCommon() {
  const data = require("../../nuclide-hack-common");

  _nuclideHackCommon = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const HACK_SERVICE_NAME = 'HackService';

async function connectionToHackService(connection) {
  const hackService = (0, _nuclideRemoteConnection().getServiceByConnection)(HACK_SERVICE_NAME, connection);
  const config = (0, _config().getConfig)();
  const fileNotifier = await (0, _nuclideOpenFiles().getNotifierByConnection)(connection);
  const host = await (0, _nuclideLanguageService().getHostServices)();
  const lspService = await hackService.initializeLsp(config.hhClientPath, // command
  ['lsp', '--from', 'nuclide', '--enhanced-hover'], // arguments
  [_constants().HACK_CONFIG_FILE_NAME], // project file
  _constants().HACK_FILE_EXTENSIONS, // which file-notifications should be sent to LSP
  config.logLevel, fileNotifier, host, {
    useTextEditAutocomplete: true
  });
  return lspService || new (_nuclideLanguageServiceRpc().NullLanguageService)();
}

async function createLanguageService() {
  const isStatusEnabled = await (0, _passesGK().default)('nuclide_hack_status');
  const atomConfig = {
    name: 'Hack',
    grammars: _nuclideHackCommon().HACK_GRAMMARS,
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
      canFormatAtPosition: true
    },
    findReferences: {
      version: '0.1.0',
      analyticsEventName: 'hack:findReferences'
    },
    rename: {
      version: '0.0.0',
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
      autocompleteCacherConfig: {
        updateResults: _nuclideLanguageService().updateAutocompleteResults,
        updateFirstResults: _nuclideLanguageService().updateAutocompleteFirstResults
      },
      supportsResolve: true
    },
    diagnostics: {
      version: '0.2.0',
      analyticsEventName: 'hack.observe-diagnostics'
    },
    status: isStatusEnabled ? {
      version: '0.1.0',
      priority: 1,
      observeEventName: 'hack.status.observe',
      clickEventName: 'hack.status.click',
      icon: 'nuclicon-hack',
      description: '__hh_server__ provides provides autocomplete, hyperclick, hover, errors and outline.'
    } : undefined
  };
  return new (_nuclideLanguageService().AtomLanguageService)(connectionToHackService, atomConfig, null, _config().logger);
} // This needs to be initialized eagerly for Hack Symbol search and the HHVM Toolbar.


let hackLanguageService = createLanguageService();
exports.hackLanguageService = hackLanguageService;

function resetHackLanguageService() {
  hackLanguageService.then(value => value.dispose()); // Reset to an unactivated LanguageService when the Hack package is deactivated.
  // TODO: Sort out the dependencies between the HHVM toolbar, quick-open and Hack.

  exports.hackLanguageService = hackLanguageService = createLanguageService();
}

async function getHackLanguageForUri(uri) {
  return (await hackLanguageService).getLanguageServiceForUri(uri);
}

async function isFileInHackProject(fileUri) {
  const fileSystemService = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(fileUri);
  const foundDir = await fileSystemService.findNearestAncestorNamed('.hhconfig', fileUri);
  return foundDir != null;
}