'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNewProtocolChannelEnabled = isNewProtocolChannelEnabled;

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NewChannelCompatibleEngines = new Set(['hhvm', 'lldb', 'java', 'vscode-adapter']); /**
                                                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                                                          * All rights reserved.
                                                                                          *
                                                                                          * This source code is licensed under the license found in the LICENSE file in
                                                                                          * the root directory of this source tree.
                                                                                          *
                                                                                          * 
                                                                                          * @format
                                                                                          */

function isNewProtocolChannelEnabled(engineName) {
  if (atom.config.get('nuclide.nuclide-debugger.forceNewChannel')) {
    return Promise.resolve(true);
  }
  return NewChannelCompatibleEngines.has(engineName) ? (0, (_passesGK || _load_passesGK()).default)('nuclide_new_debugger_protocol_channel', 10 * 1000) : Promise.resolve(false);
}