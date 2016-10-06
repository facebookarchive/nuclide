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

exports.default = getChildProcessesTree;

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

function getChildProcessesTree() {
  if ((_os2 || _os()).default.platform() !== 'darwin') {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(null);
  }

  return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).runCommand)('ps', ['axo', 'ppid,pid,pcpu,command']).map(parsePSOutput).map(function (ps) {
    return buildTree(ps, process.pid);
  });
}

function getActiveHandles() {
  // $FlowFixMe: Private method.
  return process._getActiveHandles();
}

function parsePSOutput(output) {
  var cpids = {};
  var cpus = {};
  var commands = {};
  var ioBytesStats = {};
  var lines = output.split('\n');
  lines.forEach(function (line) {
    var _line$trim$split = line.trim().split(/ +/);

    var _line$trim$split2 = _toArray(_line$trim$split);

    var ppid = _line$trim$split2[0];
    var pid = _line$trim$split2[1];
    var cpu = _line$trim$split2[2];

    var spawnargs = _line$trim$split2.slice(3);

    if (spawnargs.join(' ') === 'ps axo ppid,pid,pcpu,command') {
      return;
    }
    cpids[ppid] = cpids[ppid] || [];
    cpids[ppid].push(Number(pid));
    cpus[pid] = Number(cpu);
    commands[pid] = spawnargs.join(' ');
  });
  getActiveHandles().forEach(function (handle) {
    var type = handle.constructor.name.toLowerCase();
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
    children: (ps.cpids[pid] || []).map(function (cpid) {
      return buildTree(ps, cpid);
    }),
    ioBytesStats: ps.ioBytesStats[pid]
  };
}
module.exports = exports.default;