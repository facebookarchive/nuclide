Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRpc2;

function _nuclideRpc() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

exports.default = (0, (_nuclideRpc2 || _nuclideRpc()).loadServicesConfig)((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(__dirname, '..'));
module.exports = exports.default;