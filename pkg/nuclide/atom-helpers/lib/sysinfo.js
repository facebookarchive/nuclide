'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Since nuclide-logging depends on getUnixname, we should use
// console.error in this file instead of nuclide-logging.
/*eslint-disable no-console */

var {asyncExecute, getConfigValueAsync} = require('nuclide-commons');
var path = require('path');
var atomMeta = require(path.join(atom.getLoadSettings().resourcePath, 'package.json'));

var unixname;
var buildNumber = null;
var smokeBuildNumber = null;
var osVersion;
var clangVersion;

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

var flowVersionPromise: ?Promise<string>;

function getFlowVersion(): Promise<string> {
  if (!flowVersionPromise) {
    flowVersionPromise = determineFlowVersion();
  }
  return flowVersionPromise;
}

async function determineFlowVersion(): Promise<string> {
  var flowVersion;
  try {
    var pathToFlow = await getConfigValueAsync('nuclide-flow.pathToFlow')();
    var result = await asyncExecute(pathToFlow, ['--version'], {});
    flowVersion = result.stdout.trim();
  } catch (e) {
    flowVersion = '';
  }
  return flowVersion;
}

type SystemInfo = {
  buildNumber: string;
  clangVersion: string;
  flowVersion: string;
  osVersion: string;
  smokeBuildNumber: string;
  unixname: string;
  userID: string;
  version: string;
};

var allSystemInfoPromise: ?Promise<SystemInfo>;

function getAllSystemInfo(): Promise<SystemInfo> {
  if (!allSystemInfoPromise) {
    allSystemInfoPromise = determineAllSystemInfo();
  }
  return allSystemInfoPromise;
}

async function determineAllSystemInfo(): Promise<SystemInfo> {
  var [
    userID,
    localOsVersion,
    localClangVersion,
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
    userID,
    unixname: userID,
    osVersion: localOsVersion,
    clangVersion: localClangVersion,
    flowVersion,
  };
}

async function addSystemInfoPropertiesTo(data: {[key: string]: mixed}): Promise<void> {
  var allSystemInfo = await getAllSystemInfo();
  for (var info in allSystemInfo) {
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
