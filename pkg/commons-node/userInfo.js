'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Similar to https://nodejs.org/dist/latest-v6.x/docs/api/os.html#os_os_userinfo_options
 * Provides the same type structure as `os.userInfo` but with only the info that
 * we use. If we need more, consider https://github.com/sindresorhus/user-info
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  return {
    uid: -1,
    gid: -1,
    username: getUsername(),
    homedir: _os.default.homedir(),
    shell: null
  };
};

var _os = _interopRequireDefault(require('os'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// https://github.com/sindresorhus/username/blob/21344db/index.js
function getUsername() {
  return process.env.SUDO_USER || process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME || '';
}
module.exports = exports['default'];