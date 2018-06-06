'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createLanguageService = createLanguageService;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _rpcTypes;

function _load_rpcTypes() {
  return _rpcTypes = require('../../nuclide-logging/lib/rpc-types');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function createOCamlLanguageService(connection) {
  const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getVSCodeLanguageServiceByConnection)(connection);
  const [fileNotifier, host] = await Promise.all([(0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection), (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);

  const logLevel = (0, (_rpcTypes || _load_rpcTypes()).parseLogLevel)((_featureConfig || _load_featureConfig()).default.get('nuclide-ocaml.logLevel'), 'DEBUG');

  let ocpindent = (_featureConfig || _load_featureConfig()).default.get('nuclide-ocaml.pathToOcpIndent');
  if (typeof ocpindent !== 'string' || ocpindent === '') {
    ocpindent = null;
  }

  const lspService = await service.createMultiLspLanguageService('ocaml', 'ocaml-language-server', ['--stdio'], {
    logCategory: 'OcamlService',
    logLevel,
    fileNotifier,
    host,
    projectFileNames: ['esy', 'esy.json', 'package.json', '.merlin'],
    projectFileSearchStrategy: 'priority',
    useOriginalEnvironment: true,
    fileExtensions: ['.ml', '.mli', '.re', '.rei'],
    additionalLogFilesRetentionPeriod: 5 * 60 * 1000, // 5 minutes

    // ocaml-language-server will use defaults for any settings that aren't
    // given, so we only need to list non-defaults here.
    initializationOptions: {
      codelens: {
        // This doesn't actually change the encoding (Nuclide/Atom can handle
        // unicode just fine), but instead just disables some single-character
        // substitutions that make displayed code lenses not valid OCaml.
        unicode: false
      },
      format: {
        width: 80
      },
      path: ocpindent == null ? undefined : {
        ocpindent
      }
    }
  });
  return lspService || new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService();
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */

function createLanguageService() {
  const atomConfig = {
    name: 'OCaml',
    grammars: ['source.ocaml', 'source.reason'],
    outline: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'ocaml.outline',
      updateOnEdit: false
    },
    definition: {
      version: '0.1.0',
      priority: 20,
      definitionEventName: 'ocaml.getDefinition'
    },
    typeHint: {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'ocaml.typeHint'
    },
    codeFormat: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'ocaml.formatCode',
      canFormatRanges: true,
      canFormatAtPosition: false
    },
    findReferences: {
      version: '0.1.0',
      analyticsEventName: 'ocaml.findReferences'
    },
    autocomplete: {
      inclusionPriority: 1,
      // OCaml completions are more relevant than snippets.
      suggestionPriority: 3,
      disableForSelector: null,
      excludeLowerPriority: false,
      analytics: {
        eventName: 'nuclide-ocaml',
        shouldLogInsertedSuggestion: false
      },
      autocompleteCacherConfig: null,
      supportsResolve: true
    },
    diagnostics: {
      version: '0.2.0',
      analyticsEventName: 'ocaml.observeDiagnostics'
    }
  };

  return new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(createOCamlLanguageService, atomConfig);
}