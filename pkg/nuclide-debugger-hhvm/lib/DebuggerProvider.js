function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _HhvmLaunchAttachProvider = require('./HhvmLaunchAttachProvider');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

function getLaunchAttachProvider(connection) {
  if (_nuclideRemoteUri2['default'].isRemote(connection)) {
    return new _HhvmLaunchAttachProvider.HhvmLaunchAttachProvider('PHP', connection);
  }
  return null;
}

module.exports = {
  name: 'hhvm',
  getLaunchAttachProvider: getLaunchAttachProvider
};