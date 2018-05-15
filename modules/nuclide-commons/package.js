'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.


















getPackageMinorVersion = getPackageMinorVersion;var _fs = _interopRequireDefault(require('fs'));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // Use a regex and not the "semver" module so the result here is the same
// as from python code.
const SEMVERISH_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([a-z0-9.-]+))?$/; /**
                                                                  * Copyright (c) 2017-present, Facebook, Inc.
                                                                  * All rights reserved.
                                                                  *
                                                                  * This source code is licensed under the BSD-style license found in the
                                                                  * LICENSE file in the root directory of this source tree. An additional grant
                                                                  * of patent rights can be found in the PATENTS file in the same directory.
                                                                  *
                                                                  *  strict
                                                                  * @format
                                                                  */function getPackageMinorVersion(packageJsonPath) {const pkgJson = JSON.parse(_fs.default.readFileSync(packageJsonPath, 'utf8'));const match = SEMVERISH_RE.exec(pkgJson.version);if (!match) {throw new Error('Invariant violation: "match"');} // const majorVersion = match[1];
  const minorVersion = match[2]; // const patchVersion = match[3];
  // const prereleaseVersion = match[4];
  return minorVersion;}