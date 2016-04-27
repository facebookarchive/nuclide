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

var _ServerComponent = require('./ServerComponent');

var _ServerComponent2 = _interopRequireDefault(_ServerComponent);

var _ClientComponent = require('./ClientComponent');

var _ClientComponent2 = _interopRequireDefault(_ClientComponent);

var _config = require('./config');

exports['default'] = { ServerComponent: _ServerComponent2['default'], ClientComponent: _ClientComponent2['default'], loadServicesConfig: _config.loadServicesConfig };
module.exports = exports['default'];