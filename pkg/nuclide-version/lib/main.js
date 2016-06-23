Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getVersion = getVersion;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

// Use a regex and not the "semver" module so the result here is the same
// as from python code.
var SEMVERISH_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([a-z0-9.-]+))?$/;
var version = undefined;

/*
 * This is the versioning of Nuclide client-server protocol.
 * It is not a communication protocol per se. It is the sum of communication and
 * services API.
 *
 * First, no commit shall break the protocol in that client and server
 * from the same master shall always work with each other.
 * That means, no client new feature shall be enabled before the dependent
 * server serice is in place, while it is OK to add a new server service before
 * the client is ready.
 *
 * Rule number two. Every commit that breaks the backward compatibility shall
 * bump the version in package.json. This includes any client changes
 * (new feature or whatever) that do not work with the older servers.
 * It also includes server changes that break older clients.
 */

function getVersion() {
  if (!version) {
    // Don't use require() because it may be reading from the module cache.
    // Do use require.resolve so the paths can be codemoded in the future.
    var pkgFilename = require.resolve('../../../package.json');
    var pkgJson = JSON.parse((_fs2 || _fs()).default.readFileSync(pkgFilename));
    var match = SEMVERISH_RE.exec(pkgJson.version);
    (0, (_assert2 || _assert()).default)(match);
    // const majorVersion = match[1];
    var minorVersion = match[2];
    // const patchVersion = match[3];
    // const prereleaseVersion = match[4];
    version = minorVersion;
  }
  return version;
}