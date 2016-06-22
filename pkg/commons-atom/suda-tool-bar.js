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

exports.farEndPriority = farEndPriority;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _semver2;

function _semver() {
  return _semver2 = _interopRequireDefault(require('semver'));
}

function isVersionOrLater(packageName, version) {
  var pkg = atom.packages.getLoadedPackage(packageName);
  if (pkg == null || pkg.metadata == null || pkg.metadata.version == null) {
    return false;
  }
  return (_semver2 || _semver()).default.gte(pkg.metadata.version, version);
}

function farEndPriority(priority) {
  if (isVersionOrLater('tool-bar', '0.3.0')) {
    // New versions of the toolbar use negative priority to push icons to the far end.
    return -priority;
  } else {
    // Old ones just use large positive priority.
    return 2000 - priority;
  }
}