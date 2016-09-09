

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _HhvmLaunchAttachProvider2;

function _HhvmLaunchAttachProvider() {
  return _HhvmLaunchAttachProvider2 = require('./HhvmLaunchAttachProvider');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function getLaunchAttachProvider(connection) {
  if ((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isRemote(connection)) {
    return new (_HhvmLaunchAttachProvider2 || _HhvmLaunchAttachProvider()).HhvmLaunchAttachProvider('PHP', connection);
  }
  return null;
}

module.exports = {
  name: 'hhvm',
  getLaunchAttachProvider: getLaunchAttachProvider
};