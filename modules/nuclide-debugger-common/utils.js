"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeProjectPathsAllFromSourcePathsService = observeProjectPathsAllFromSourcePathsService;

function _projects() {
  const data = require("../nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

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
function observeProjectPathsAllFromSourcePathsService(callback) {
  let _sourcePathsService;

  atom.packages.serviceHub.consume('debugger.sourcePaths', '0.0.0', provider => {
    _sourcePathsService = provider;
  }).dispose();
  return _sourcePathsService != null ? _sourcePathsService.observeSuggestedAndroidProjectPaths(callback) : (0, _projects().observeProjectPathsAll)(projectPaths => {
    callback(projectPaths.map(projectPath => {
      return {
        projectPath,
        suggested: true,
        hostLabel: projectPath
      };
    }));
  });
}