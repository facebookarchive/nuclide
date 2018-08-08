"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secondIfFirstIsNull = secondIfFirstIsNull;
exports.wordUnderPoint = wordUnderPoint;
exports.enableLibclangLogsConfig = enableLibclangLogsConfig;
exports.indexerThreadsConfig = indexerThreadsConfig;
exports.memoryLimitConfig = memoryLimitConfig;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _range() {
  const data = require("../../../modules/nuclide-commons-atom/range");

  _range = function () {
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
async function secondIfFirstIsNull(first, second) {
  return first != null ? first : second();
}

function wordUnderPoint(editor, point) {
  const match = (0, _range().wordAtPosition)(editor, point);

  if (match != null && match.wordMatch.length > 0) {
    return match.wordMatch[0];
  }

  return null;
}

function enableLibclangLogsConfig() {
  return _featureConfig().default.get('nuclide-cquery-lsp.enable-libclang-logs') === true;
}

function indexerThreadsConfig() {
  return _featureConfig().default.get('nuclide-cquery-lsp.indexer-threads' // $FlowIgnore: defined as integer in package.json
  );
}

function memoryLimitConfig() {
  return _featureConfig().default.get('nuclide-cquery-lsp.memory-limit' // $FlowIgnore: defined as number in package.json
  );
}