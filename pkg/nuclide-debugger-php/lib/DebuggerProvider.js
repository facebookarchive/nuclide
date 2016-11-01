'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _HhvmLaunchAttachProvider;

function _load_HhvmLaunchAttachProvider() {
  return _HhvmLaunchAttachProvider = require('./HhvmLaunchAttachProvider');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getLaunchAttachProvider(connection) {
  if ((_nuclideUri || _load_nuclideUri()).default.isRemote(connection)) {
    return new (_HhvmLaunchAttachProvider || _load_HhvmLaunchAttachProvider()).HhvmLaunchAttachProvider('PHP', connection);
  }
  return null;
}

module.exports = {
  name: 'hhvm',
  getLaunchAttachProvider: getLaunchAttachProvider
};