'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getChildProcessesTree;

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _os = _interopRequireDefault(require('os'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function getChildProcessesTree() {
  if (_os.default.platform() !== 'darwin') {
    return _rxjsBundlesRxMinJs.Observable.of(null);
  }

  return (0, (_process || _load_process()).runCommand)('ps', ['axo', 'ppid,pid,pcpu,command']).map(parsePSOutput).map(ps => buildTree(ps, process.pid));
}

function getActiveHandles() {
  // $FlowFixMe: Private method.
  return process._getActiveHandles();
}

function parsePSOutput(output) {
  const cpids = {};
  const cpus = {};
  const commands = {};
  const ioBytesStats = {};
  const lines = output.split('\n');
  lines.forEach(line => {
    var _line$trim$split = line.trim().split(/ +/),
        _line$trim$split2 = _toArray(_line$trim$split);

    const ppid = _line$trim$split2[0],
          pid = _line$trim$split2[1],
          cpu = _line$trim$split2[2],
          spawnargs = _line$trim$split2.slice(3);

    if (spawnargs.join(' ') === 'ps axo ppid,pid,pcpu,command') {
      return;
    }
    cpids[ppid] = cpids[ppid] || [];
    cpids[ppid].push(Number(pid));
    cpus[pid] = Number(cpu);
    commands[pid] = spawnargs.join(' ');
  });
  getActiveHandles().forEach(handle => {
    const type = handle.constructor.name.toLowerCase();
    if (type === 'childprocess') {
      ioBytesStats[handle.pid] = {
        stdin: handle.stdin && handle.stdin.bytesWritten,
        stdout: handle.stdout && handle.stdout.bytesRead,
        stderr: handle.stderr && handle.stderr.bytesRead
      };
    }
  });
  return { cpids: cpids, cpus: cpus, commands: commands, ioBytesStats: ioBytesStats };
}

function buildTree(ps, pid) {
  return {
    pid: pid,
    command: ps.commands[pid],
    cpuPercentage: ps.cpus[pid],
    children: (ps.cpids[pid] || []).map(cpid => buildTree(ps, cpid)),
    ioBytesStats: ps.ioBytesStats[pid]
  };
}
module.exports = exports['default'];