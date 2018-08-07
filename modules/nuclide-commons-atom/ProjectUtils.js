"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLabelFromPath = getLabelFromPath;
exports.getLocalPathsForProjectRepo = getLocalPathsForProjectRepo;
exports.getRemotePathsForProjectRepo = getRemotePathsForProjectRepo;
exports.setLocalPathsForProjectRepo = setLocalPathsForProjectRepo;
exports.setRemotePathsForProjectRepo = setRemotePathsForProjectRepo;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("./feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
function getLabelFromPath(path) {
  const basename = _nuclideUri().default.basename(path);

  const parts = basename.split('.');
  return humanizeProjectName(parts[0] || basename);
}

function formatProjectNameWord(word) {
  switch (word) {
    case 'www':
      return 'WWW';

    case 'ios':
      return 'iOS';

    default:
      return word[0].toUpperCase() + word.slice(1);
  }
}

function humanizeProjectName(name) {
  const hasCapitalLetters = /[A-Z]/.test(name);

  const id = x => x;

  return name.split(/[-_]+/).map(hasCapitalLetters ? id : formatProjectNameWord).join(' ');
}
/**
 * Gets the array of paths which can be tried on the local machine to find
 * the location of `repo`. For example, if repo := fbsource, then we are getting
 * the paths to fbsource on the user's local machine.
 */


function getLocalPathsForProjectRepo(repo) {
  return getPathsForProjectRepoFromLocation(repo, 'localPaths');
}
/**
 * Gets the array of paths which can be tried on a remote machine to find
 * the location of `repo`. For example, if repo := fbsource, then we are getting
 * the paths to fbsource on the user's remote machine.
 */


function getRemotePathsForProjectRepo(repo) {
  return getPathsForProjectRepoFromLocation(repo, 'remotePaths');
}

function getPathsForProjectRepoFromLocation(repo, featureConfigLocation) {
  if (repo == null) {
    return [];
  }

  const localPaths = _featureConfig().default.get(`fb-atomprojects.${featureConfigLocation}`);

  if (!Array.isArray(localPaths)) {
    throw new Error("Invariant violation: \"Array.isArray(localPaths)\"");
  }

  const repoPaths = localPaths // $FlowIgnore
  .filter(obj => obj.repo === repo) // $FlowIgnore
  .map(obj => obj.path);

  if (repoPaths.length === 0) {
    repoPaths.push(`~/${repo}`);
  }

  return repoPaths;
}
/**
 * Sets an array of paths which can be tried on the local machine to find
 * the location of <repo>. For example, if repo := fbsource, then we are setting
 * the paths to fbsource on the user's local machine.
 */


function setLocalPathsForProjectRepo(paths) {
  _featureConfig().default.set('fb-atomprojects.localPaths', paths);
}
/**
 * Sets an array of paths which can be tried on a remote machine to find
 * the location of <repo>. For example, if repo := fbsource, then we are setting
 * the paths to fbsource on the user's remote machine.
 */


function setRemotePathsForProjectRepo(paths) {
  _featureConfig().default.set('fb-atomprojects.remotePaths', paths);
}