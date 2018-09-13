/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @noflow
 * @format
 */
'use strict';

/* eslint nuclide-internal/no-commonjs: 0 */

module.exports = {
  atomExecutable: '/Applications/Atom.app/Contents/MacOS/Atom',
  consoleFilter: consoleOutput => {
    if (!consoleOutput) {
      return consoleOutput;
    }
    return consoleOutput.filter(consoleBuffer => {
      const {origin, message} = consoleBuffer;
      return !(
        origin.match(/track-nuclide-ready/) ||
        message.match(/Starting local RPC process with/) ||
        message.match('let notifier =') ||
        message.match('nvm is not compatible with the npm config "prefix"') ||
        message.match('nvm use --delete-prefix') ||
        message.match('Successfully loaded Chrome extension')
      );
    });
  },
};
