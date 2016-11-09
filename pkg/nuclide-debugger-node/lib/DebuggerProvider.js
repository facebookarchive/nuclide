'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _NodeLaunchAttachProvider;

function _load_NodeLaunchAttachProvider() {
  return _NodeLaunchAttachProvider = require('./NodeLaunchAttachProvider');
}

function getLaunchAttachProvider(connection) {
  return new (_NodeLaunchAttachProvider || _load_NodeLaunchAttachProvider()).NodeLaunchAttachProvider('JavaScript', connection);
}

module.exports = {
  name: 'Node',
  getLaunchAttachProvider: getLaunchAttachProvider
};