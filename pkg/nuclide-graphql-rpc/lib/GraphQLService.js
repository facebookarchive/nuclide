'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLsp = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/* LanguageService related type imports */
let initializeLsp = exports.initializeLsp = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (command, args, spawnOptions, projectFileNames, fileExtensions, logLevel, fileNotifier, host) {
    return (0, (_nuclideVscodeLanguageServiceRpc || _load_nuclideVscodeLanguageServiceRpc()).createMultiLspLanguageService)('graphql', process.execPath, [require.resolve(command), ...args], {
      logCategory: (_config || _load_config()).GRAPHQL_LOGGER_CATEGORY,
      logLevel,
      fileNotifier,
      host,
      spawnOptions,
      projectFileNames,
      fileExtensions
    });
  });

  return function initializeLsp(_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8) {
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

var _nuclideVscodeLanguageServiceRpc;

function _load_nuclideVscodeLanguageServiceRpc() {
  return _nuclideVscodeLanguageServiceRpc = require('../../nuclide-vscode-language-service-rpc');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }