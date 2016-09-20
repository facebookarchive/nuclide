

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _LLDBLaunchAttachProvider2;

function _LLDBLaunchAttachProvider() {
  return _LLDBLaunchAttachProvider2 = require('./LLDBLaunchAttachProvider');
}

function getLaunchAttachProvider(connection) {
  return new (_LLDBLaunchAttachProvider2 || _LLDBLaunchAttachProvider()).LLDBLaunchAttachProvider('C++', connection);
}

module.exports = {
  name: 'lldb',
  getLaunchAttachProvider: getLaunchAttachProvider
};