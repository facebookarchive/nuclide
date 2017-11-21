'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNewProtocolChannelEnabled = isNewProtocolChannelEnabled;
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

const NewChannelCompatibleEngines = new Set(['hhvm', 'lldb', 'java', 'vscode-adapter', 'mobilejs']);

function isNewProtocolChannelEnabled(engineName) {
  return NewChannelCompatibleEngines.has(engineName);
}