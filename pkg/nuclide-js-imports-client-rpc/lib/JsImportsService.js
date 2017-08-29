'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLsp = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

let initializeLsp = exports.initializeLsp = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (projectFileNames, fileExtensions, logLevel, fileNotifier, host, initializationOptions) {
    return (0, (_nuclideVscodeLanguageServiceRpc || _load_nuclideVscodeLanguageServiceRpc()).createMultiLspLanguageService)('jsimports',
    // TODO(hansonw): Add a flag to properly fork the Node process.
    require.resolve('../../commons-node/fb-node-run.sh'), [require.resolve('../../nuclide-js-imports-server/src/index-entry.js')], {
      fileNotifier,
      host,
      logCategory: 'jsimports',
      logLevel,
      projectFileNames,
      fileExtensions,
      initializationOptions
    });
  });

  return function initializeLsp(_x, _x2, _x3, _x4, _x5, _x6) {
    return _ref.apply(this, arguments);
  };
})();

var _nuclideVscodeLanguageServiceRpc;

function _load_nuclideVscodeLanguageServiceRpc() {
  return _nuclideVscodeLanguageServiceRpc = require('../../nuclide-vscode-language-service-rpc');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }