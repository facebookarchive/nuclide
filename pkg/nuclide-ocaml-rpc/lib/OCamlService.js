'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLsp = exports.getUseLspConnection = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

let getUseLspConnection = exports.getUseLspConnection = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return (0, (_passesGK || _load_passesGK()).default)('nuclide_ocaml_lsp');
  });

  return function getUseLspConnection() {
    return _ref.apply(this, arguments);
  };
})();

let initializeLsp = exports.initializeLsp = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (command, args, projectFileName, fileExtensions, logLevel, fileNotifier, host) {
    if (!(fileNotifier instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
      throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
    }

    logger.setLevel(logLevel);
    return (0, (_nuclideVscodeLanguageService || _load_nuclideVscodeLanguageService()).createMultiLspLanguageService)(logger, fileNotifier, host, 'ocaml', command, args, projectFileName, fileExtensions, {
      codelens: {
        unicode: true
      },
      debounce: {
        linter: 500
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
        languages: ['ocaml']
      }
    });
  });

  return function initializeLsp(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
    return _ref2.apply(this, arguments);
  };
})();

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _nuclideVscodeLanguageService;

function _load_nuclideVscodeLanguageService() {
  return _nuclideVscodeLanguageService = require('../../nuclide-vscode-language-service');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('OCamlService');