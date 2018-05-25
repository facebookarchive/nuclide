'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLsp = initializeLsp;

var _nuclideVscodeLanguageServiceRpc;

function _load_nuclideVscodeLanguageServiceRpc() {
  return _nuclideVscodeLanguageServiceRpc = require('../../nuclide-vscode-language-service-rpc');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

/* LanguageService related type imports */
async function initializeLsp(command, args, spawnOptions, projectFileNames, fileExtensions, logLevel, fileNotifier, host) {
  return (0, (_nuclideVscodeLanguageServiceRpc || _load_nuclideVscodeLanguageServiceRpc()).createMultiLspLanguageService)('graphql', process.execPath, [require.resolve(command), ...args], {
    logCategory: (_config || _load_config()).GRAPHQL_LOGGER_CATEGORY,
    logLevel,
    fileNotifier,
    host,
    spawnOptions,
    projectFileNames,
    fileExtensions,
    additionalLogFilesRetentionPeriod: 5 * 60 * 1000 // 5 minutes
  });
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */