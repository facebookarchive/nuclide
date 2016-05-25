Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var providerInstance = undefined;
function getProviderInstance() {
  if (providerInstance == null) {
    var _require = require('./RecentFilesProvider');

    var RecentFilesProvider = _require.RecentFilesProvider;

    providerInstance = _extends({}, RecentFilesProvider);
  }
  return providerInstance;
}

exports.default = {

  registerProvider: function registerProvider() {
    return getProviderInstance();
  },

  consumeRecentFilesService: function consumeRecentFilesService(service) {
    var instance = getProviderInstance();
    (0, (_assert2 || _assert()).default)(instance.setRecentFilesService != null);
    instance.setRecentFilesService(service);
  }

};
module.exports = exports.default;