'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLsp = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let initializeLsp = exports.initializeLsp = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (command, args, projectFileName, fileExtensions, logLevel, fileNotifier, host) {
    if (!(fileNotifier instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
      throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
    }

    (_config || _load_config()).logger.setLevel(logLevel);

    return (0, (_nuclideVscodeLanguageService || _load_nuclideVscodeLanguageService()).createMultiLspLanguageService)((_config || _load_config()).logger, fileNotifier, host, 'graphql', require.resolve(command), args, projectFileName, fileExtensions, {});
  });

  return function initializeLsp(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
    return _ref.apply(this, arguments);
  };
})();

/* LanguageService related type imports */
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

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _nuclideVscodeLanguageService;

function _load_nuclideVscodeLanguageService() {
  return _nuclideVscodeLanguageService = require('../../nuclide-vscode-language-service');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }