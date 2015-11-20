'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var SAMPLE_FILE = '/tmp/nuclide-benchmarker-open-edit-save.js';
var FILE_SIZE = 10000;
var TIMEOUT = 30 * 1000;

var REPETITIONS = 3;

var {timedAsync, timedSync} = require('../benchmarker-utils');

var isNotTheme = pkg => pkg.getType !== 'theme';

module.exports = {
  description: 'times how long it takes to activate packages for Atom & Nuclide',
  columns: [
    'mode',
    'claimedWindowLoadTime',
    'realLoadTime',
    'realPromiseLoadTime',
    'realActivateTime',
    'realPromiseActivateTime',
    'loadedCount',
    'activeCount',
    'summedClaimedLoadTime',
    'maxClaimedLoadTime',
    'summedClaimedActivateTime',
    'maxClaimedActivateTime',
    'slowestClaimedLoad',
    'slowestClaimedActivate',
  ],
  timeout: TIMEOUT,
  iterations: 2,
  repetitions: REPETITIONS,
  run: async (iteration: number): Object => {

    var claimedWindowLoadTime = atom.getWindowLoadTime();

    atom.packages.deactivatePackages();
    atom.packages.unloadPackages();

    var mode = iteration == 0 ? 'atom' : 'nuclide';
    switch (mode) {
      case 'atom':
        atom.packages.packageDirPaths=[];
        break;
      case 'nuclide':
        atom.packages.packageDirPaths=["/Users/jpearce/.atom/packages"];
        break;
    }

    var {time: realLoadTime, promiseTime: realPromiseLoadTime} = await timedAsync(
      // $FlowFixMe: Not sure for what versions of Atom this worked
      atom.packages.loadPackages()
    );
    var loadedPackages = atom.packages.getLoadedPackages().filter(isNotTheme);
    var loadedCount = loadedPackages.length;

    var {time: realActivateTime, promiseTime: realPromiseActivateTime} = await timedAsync(
      atom.packages.activate()
    );
    var activePackages = atom.packages.getActivePackages().filter(isNotTheme);
    var activeCount = activePackages.length;

    var summedClaimedLoadTime = 0;
    var maxClaimedLoadTime = 0;
    var slowestClaimedLoad = '';
    loadedPackages.forEach(pkg => {
      summedClaimedLoadTime += pkg.loadTime;
      maxClaimedLoadTime = Math.max(maxClaimedLoadTime, pkg.loadTime);
      if (maxClaimedLoadTime === pkg.loadTime) {
        slowestClaimedLoad = pkg.name;
      }
    });
    var summedClaimedActivateTime = 0;
    var maxClaimedActivateTime = 0;
    var slowestClaimedActivate = '';
    activePackages.forEach(pkg => {
      summedClaimedActivateTime += pkg.activateTime;
      maxClaimedActivateTime = Math.max(maxClaimedActivateTime, pkg.activateTime);
      if (maxClaimedActivateTime === pkg.activateTime) {
        slowestClaimedActivate = pkg.name;
      }
    });

    var result = {
      mode,
      claimedWindowLoadTime,
      realLoadTime,
      realPromiseLoadTime,
      realActivateTime,
      realPromiseActivateTime,
      loadedCount,
      activeCount,
      summedClaimedLoadTime,
      maxClaimedLoadTime,
      summedClaimedActivateTime,
      maxClaimedActivateTime,
      slowestClaimedLoad,
      slowestClaimedActivate,
    };

    console.log(JSON.stringify(result));
    return result;

  },
};
