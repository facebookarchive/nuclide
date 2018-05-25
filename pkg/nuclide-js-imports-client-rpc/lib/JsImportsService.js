'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLsp = initializeLsp;

var _nuclideVscodeLanguageServiceRpc;

function _load_nuclideVscodeLanguageServiceRpc() {
  return _nuclideVscodeLanguageServiceRpc = require('../../nuclide-vscode-language-service-rpc');
}

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

async function initializeLsp(projectFileNames, fileExtensions, logLevel, fileNotifier, host, initializationOptions) {
  return (0, (_nuclideVscodeLanguageServiceRpc || _load_nuclideVscodeLanguageServiceRpc()).createMultiLspLanguageService)('jsimports', process.execPath, [require.resolve('../../nuclide-js-imports-server/src/index-entry.js')], {
    fileNotifier,
    host,
    logCategory: 'jsimports',
    logLevel,
    projectFileNames,
    fileExtensions,
    initializationOptions,
    spawnOptions: { env: Object.assign({}, process.env, { ELECTRON_RUN_AS_NODE: '1' }) }
  });
}