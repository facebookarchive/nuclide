'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This should be long enough that it does not interfere with Atom load time,
// but short enough so that users who have just installed the nuclide-installer
// for the first time do not get impatient waiting to see Nuclide packages start
// to appear under Installed Packages in Settings.
var TIME_TO_WAIT_BEFORE_CHECKING_FOR_UPDATES_IN_MS = 5 * 1000;

module.exports = {
  activate(state: ?Object): void {
    // Add a delay before checking for package updates so that this
    // is not on the critical path for Atom startup.
    setTimeout(async () => {
      var pathToConfig;
      try {
        pathToConfig = require.resolve('./config.json');
      } catch (e) {
        // The config.json file will not be present in development.
        return;
      }

      var config = require(pathToConfig);
      var {installPackagesInConfig} = require('nuclide-installer-base');
      installPackagesInConfig(config);
    }, TIME_TO_WAIT_BEFORE_CHECKING_FOR_UPDATES_IN_MS);
  },
};
