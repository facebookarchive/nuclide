"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLsp = initializeLsp;

function _nuclideVscodeLanguageServiceRpc() {
  const data = require("../../nuclide-vscode-language-service-rpc");

  _nuclideVscodeLanguageServiceRpc = function () {
    return data;
  };

  return data;
}

function _hackConfig() {
  const data = require("./hack-config");

  _hackConfig = function () {
    return data;
  };

  return data;
}

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
async function initializeLsp(command, args, projectFileNames, fileExtensions, logLevel, fileNotifier, host, initializationOptions) {
  const cmd = command === '' ? await _hackConfig().DEFAULT_HACK_COMMAND : command;

  if (cmd === '') {
    return null;
  }

  return (0, _nuclideVscodeLanguageServiceRpc().createMultiLspLanguageService)('hack', cmd, args, {
    logCategory: _hackConfig().HACK_LOGGER_CATEGORY,
    logLevel,
    fileNotifier,
    host,
    initializationOptions,
    projectFileNames,
    fileExtensions,
    additionalLogFilesRetentionPeriod: 5 * 60 * 1000 // 5 minutes

  });
}