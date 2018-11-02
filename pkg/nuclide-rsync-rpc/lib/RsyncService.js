"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startDaemon = startDaemon;
exports.getVersion = getVersion;
exports.syncFolder = syncFolder;

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _serverPort() {
  const data = require("../../../modules/nuclide-commons/serverPort");

  _serverPort = function () {
    return data;
  };

  return data;
}

function _compareVersions() {
  const data = _interopRequireDefault(require("../../commons-node/compareVersions"));

  _compareVersions = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

/**
 * Start an rsync daemon with a single module at the provided root.
 * NOTE: This function works by tailing rsync's log and wating for a log entry.
 * I tried setting the log file to /dev/stdout. This worked on OSX but not
 * linux. I tried a named pipe, but if the named pipe isn't drained, rsync will
 * block while writing an exit message to it's log and never quit.
 */
function startDaemon(root) {
  return _rxjsCompatUmdMin.Observable.combineLatest(_rxjsCompatUmdMin.Observable.defer(() => _fsPromise().default.tempdir()), _rxjsCompatUmdMin.Observable.defer(() => (0, _serverPort().getAvailableServerPort)())).switchMap(([tempDir, port]) => {
    const confFile = _nuclideUri().default.join(tempDir, 'rsync.conf');

    const lockFile = _nuclideUri().default.join(tempDir, 'rsync.lock');

    const pidFile = _nuclideUri().default.join(tempDir, 'rsync.pid');

    const logFile = _nuclideUri().default.join(tempDir, 'rsync.log');

    const conf = `
lock file = ${lockFile}
pid file = ${pidFile}
log file = ${logFile}
port = ${port}
use chroot = false

[files]
path = ${_nuclideUri().default.getPath(root)}
read only = no`;
    return _rxjsCompatUmdMin.Observable.concat(_rxjsCompatUmdMin.Observable.merge( // Create the config file.
    _rxjsCompatUmdMin.Observable.defer(() => _fsPromise().default.writeFile(confFile, conf)), // Create an empty log file.
    _rxjsCompatUmdMin.Observable.defer(() => _fsPromise().default.writeFile(logFile, ''))).ignoreElements(), _rxjsCompatUmdMin.Observable.merge( // Simultaneously start daemon and tail log.
    (0, _process().observeProcess)('rsync', ['--daemon', '--no-detach', '-v', '--config', confFile], {
      // We need to pipe in /dev/null due to stdin
      // https://lists.samba.org/archive/rsync/2007-May/017739.html
      stdio: ['ignore', 'pipe', 'pipe']
    }).ignoreElements(), (0, _process().observeProcess)('tail', ['-f', '-n', '+1', logFile]) // Get a stream of stdout lines.
    .concatMap(msg => msg.kind === 'stdout' ? _rxjsCompatUmdMin.Observable.of(msg.data) : _rxjsCompatUmdMin.Observable.empty()) // Match the pattern to the stdout lines.
    .concatMap(line => {
      const VERSION_PORT_PATTERN = /rsyncd version ([\d.]+) starting, listening on port (\d+)/g;
      const match = VERSION_PORT_PATTERN.exec(line);

      if (match) {
        return _rxjsCompatUmdMin.Observable.of({
          version: match[1],
          port: parseInt(match[2], 10)
        });
      }

      return _rxjsCompatUmdMin.Observable.empty();
    }).first().timeoutWith(4000, _rxjsCompatUmdMin.Observable.throw(new Error('Timed out while trying to retrieve rsync daemon port.')))));
  }).publish();
}

function getVersion() {
  return (0, _process().runCommand)('rsync', ['--version']).flatMap(stdout => _rxjsCompatUmdMin.Observable.from(stdout.split('\n'))).first().concatMap(line => {
    const VERSION_PATTERN = /rsync\s+version\s+([\d.]+)\s+protocol\s+version\s+(\d+)/g;
    const match = VERSION_PATTERN.exec(line);
    return match ? _rxjsCompatUmdMin.Observable.of({
      rsyncVersion: match[1],
      protocolVersion: parseInt(match[2], 10)
    }) : _rxjsCompatUmdMin.Observable.throw('Failed to parse Rsync version.');
  }).toPromise();
}

function syncFolder(from, to) {
  return _rxjsCompatUmdMin.Observable.defer(() => getVersion()).switchMap(version => {
    const args = ['-rtvuc', '--delete', '--progress', from, to];

    if ((0, _compareVersions().default)(version.rsyncVersion, '3.1.0') >= 0) {
      args.push('--info=progress2');
    }

    return (0, _observable().splitStream)((0, _process().observeProcessRaw)('rsync', args).concatMap(msg => msg.kind === 'stdout' ? _rxjsCompatUmdMin.Observable.of(msg.data) : _rxjsCompatUmdMin.Observable.empty()).map(data => data.replace(/\r/g, '\n'))).concatMap(line => {
      const PROGRESS_PATTERN = /(\d+)%/g;
      const match = PROGRESS_PATTERN.exec(line);
      return match ? _rxjsCompatUmdMin.Observable.of(parseInt(match[1], 10)) : _rxjsCompatUmdMin.Observable.empty();
    });
  }).publish();
}