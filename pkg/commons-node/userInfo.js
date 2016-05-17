'use babel';
/* @flow */

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

import os from 'os';

export type UserInfo = {
  uid: number;
  gid: number;
  username: string;
  homedir: string;
  shell: ?string;
};

export default function(): UserInfo {
  return {
    uid: -1,
    gid: -1,
    username: getUsername(),
    homedir: os.homedir(),
    shell: null,
  };
}

// https://github.com/sindresorhus/username/blob/21344db/index.js
function getUsername() {
  return (
    process.env.SUDO_USER ||
    process.env.LOGNAME ||
    process.env.USER ||
    process.env.LNAME ||
    process.env.USERNAME ||
    ''
  );
}
