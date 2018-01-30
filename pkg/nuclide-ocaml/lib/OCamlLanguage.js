'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let createOCamlLanguageService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getVSCodeLanguageServiceByConnection)(connection);
    const [fileNotifier, host] = yield Promise.all([(0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection), (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);

    const lspService = yield service.createMultiLspLanguageService('ocaml', 'ocaml-language-server', ['--stdio'], {
      logCategory: 'OcamlService',
      logLevel: 'INFO',
      fileNotifier,
      host,
      projectFileNames: ['esy', 'esy.json', 'package.json', '.merlin'],
      projectFileSearchStrategy: 'priority',
      useOriginalEnvironment: true,
      fileExtensions: ['.ml', '.mli', '.re', '.rei'],
      initializationOptions: {
        codelens: {
          unicode: true
        },
        debounce: {
          linter: 10 * 1000 // 10s
        },
        diagnostics: {
          merlinPerfLogging: true,
          tools: ['merlin']
        },
        path: {
          ocamlfind: 'ocamlfind',
          ocamlmerlin: 'ocamlmerlin',
          opam: 'opam',
          rebuild: 'rebuild',
          refmt: 'refmt',
          refmterr: 'refmterr',
          rtop: 'rtop'
        },
        server: {
          languages: ['ocaml', 'reason']
        }
      }
    });
    return lspService || new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService();
  });

  return function createOCamlLanguageService(_x) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

exports.createLanguageService = createLanguageService;

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
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

function createLanguageService() {
  const atomConfig = {
    name: 'OCaml',
    grammars: ['source.ocaml', 'source.reason'],
    outline: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'ocaml.outline'
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
      autocompleteCacherConfig: null
    },
    diagnostics: {
      version: '0.2.0',
      analyticsEventName: 'ocaml.observeDiagnostics'
    }
  };

  return new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(createOCamlLanguageService, atomConfig);
}