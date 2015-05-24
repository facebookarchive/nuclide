'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

// Since nuclide-logging depends on getUnixname, we should use
// console.error in this file instead of nuclide-logging.

var {asyncExecute, getConfigValueAsync} = require('nuclide-commons');
var path = require('path');
var atomMeta = require(path.join(atom.getLoadSettings().resourcePath, 'package.json'));
var unixname;
var buildNumber = null;
var smokeBuildNumber = null;
var osVersion;
var clangVersion;
var flowVersion;

function getUnixname(): Promise<string> {
  if (!unixname) {
    unixname = asyncExecute('whoami', [], {}).then((result) => {
      return result.stdout.trim();
    }, (result) => {
      console.error(result.stderr);
      return '';
    });
  }
  return unixname;
}

function getBuildNumber(): string {
  if (buildNumber === null) {
    buildNumber = atomMeta.buildNumber ? atomMeta.buildNumber : 0;
  }
  return buildNumber.toString();
}

function getSmokeBuildNumber(): string {
  if (smokeBuildNumber === null) {
    smokeBuildNumber = atomMeta.smokeBuildNumber ? atomMeta.smokeBuildNumber : 0;
  }
  return smokeBuildNumber.toString();
}

function getOSVersion(): Promise<string> {
  if (!osVersion) {
    osVersion = asyncExecute('sw_vers', ['-productVersion'], {}).then((result) => {
      return result.stdout.trim();
    }, (result) => {
      console.error(result.stderr);
      return '';
    });
  }
  return osVersion;
}

function getClangVersion(): Promise<string> {
  if (!clangVersion) {
    clangVersion = asyncExecute('clang', ['-v'], {}).then((result) => {
      // Clang return this info in stderr.
      return result.stderr;
    }, (result) => {
      console.error(result.stderr);
      return '';
    });
  }
  return clangVersion;
}

async function getFlowVersion(): Promise<string> {
  if (!flowVersion) {
    try {
      var pathToFlow = await getConfigValueAsync('nuclide-flow.pathToFlow')();
      var result = await asyncExecute(pathToFlow, ['--version'], {});
      flowVersion = result.stdout.trim();
    } catch (e) {
      console.error(e);
      flowVersion = '';
    }
  }
  return flowVersion;
}

async function getAllSystemInfo(): Promise<any> {
  var [
    userID,
    osVersion,
    clangVersion,
    flowVersion
  ] = await Promise.all([
    getUnixname(),
    getOSVersion(),
    getClangVersion(),
    getFlowVersion(),
  ]);
  return {
    version: atom.getVersion(),
    buildNumber: getBuildNumber(),
    smokeBuildNumber: getSmokeBuildNumber(),
    userID: userID,
    unixname: userID,
    osVersion: osVersion,
    clangVersion: clangVersion,
    flowVersion: flowVersion,
  };
}

async function addSystemInfoPropertiesTo(data: mixed): void {
  var allSystemInfo = await getAllSystemInfo();
  for (var info :string in allSystemInfo) {
    // we know that this has only its own properties
    data[info] = allSystemInfo[info];
  }
}

module.exports = {
  getUnixname,
  getBuildNumber,
  getSmokeBuildNumber,
  getOSVersion,
  getClangVersion,
  getFlowVersion,
  getAllSystemInfo,
  addSystemInfoPropertiesTo,
};
