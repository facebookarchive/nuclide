

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _NodeLaunchAttachProvider2;

function _NodeLaunchAttachProvider() {
  return _NodeLaunchAttachProvider2 = require('./NodeLaunchAttachProvider');
}

function getLaunchAttachProvider(connection) {
  return new (_NodeLaunchAttachProvider2 || _NodeLaunchAttachProvider()).NodeLaunchAttachProvider('JavaScript', connection);
}

module.exports = {
  name: 'Node',
  getLaunchAttachProvider: getLaunchAttachProvider
};