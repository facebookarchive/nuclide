'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.childProcessTree = childProcessTree;
exports.childProcessSummary = childProcessSummary;
exports.queryPs = queryPs;
exports.durationInSeconds = durationInSeconds;

var _os = _interopRequireDefault(require('os'));

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Represents parsed information about a process from 'ps'.


// Summary of process metadata for all sub-processes with the
// same command. Typically this uses the 'ps' formatting flag 'comm'
// to include just the executable path, and not the command arguments.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function childProcessTree(ps) {
  const ioMap = mapIoStats();
  const viewPs = (0, (_collection || _load_collection()).mapFilter)(ps, (k, v) => v.command !== 'ps -eo pid,ppid,pcpu,time,rss,vsz,command');
  return postOrder(process.pid, mapChildren(viewPs), (pid, children) => {
    const process = viewPs.get(pid);
    if (process == null) {
      return null;
    }
    return {
      pid,
      command: process.command,
      cpuPercentage: process.pcpu,
      children: children.filter(Boolean),
      ioBytesStats: ioMap.get(pid)
    };
  });
}

function childProcessSummary(ps) {
  const subPs = postOrder(process.pid, mapChildren(ps), (pid, children) => {
    const pidPs = ps.get(pid);
    if (pidPs == null) {
      return [];
    }
    return [pidPs].concat(...children);
  });
  return aggregate(subPs);
}

function queryPs(cmd) {
  if (_os.default.platform() !== 'darwin' && _os.default.platform() !== 'linux') {
    return _rxjsBundlesRxMinJs.Observable.of(new Map());
  }
  return (0, (_process || _load_process()).runCommand)('ps', ['-eo', `pid,ppid,pcpu,time,rss,vsz,${cmd}`], {
    dontLogInNuclide: true
  }).map(output => {
    return new Map((0, (_nullthrows || _load_nullthrows()).default)(output).split('\n')
    // only lines with pid (filter out header and final empty line)
    .filter(line => / *[0-9]/.test(line)).map(line => line.trim().split(/ +/)).map(([pid, ppid, pcpu, time, rss, vsz, ...command]) => [Number(pid), {
      pid: Number(pid),
      ppid: Number(ppid),
      pcpu: Number(pcpu),
      time: durationInSeconds(time),
      rss: Number(rss),
      vsz: Number(vsz),
      command: command.join(' ')
    }]));
  });
}

function postOrder(pid, childMap, callback) {
  return callback(pid, (childMap.get(pid) || []).map(cpid => postOrder(cpid, childMap, callback)));
}

function mapChildren(psMap) {
  const map = new Map();
  for (const [pid, ps] of psMap.entries()) {
    const array = map.get(ps.ppid) || [];
    array.push(pid);
    map.set(ps.ppid, array);
  }
  return map;
}

function aggregate(ps) {
  const map = new Map();

  for (const subProcess of ps) {
    const command = subProcess.command;
    const existing = map.get(command);
    if (existing != null) {
      existing.count++;
      existing.pcpu += subProcess.pcpu;
      existing.time += subProcess.time;
      existing.rss += subProcess.rss;
      existing.vsz += subProcess.vsz;
    } else {
      map.set(command, {
        command,
        count: 1,
        pcpu: subProcess.pcpu,
        time: subProcess.time,
        rss: subProcess.rss,
        vsz: subProcess.vsz
      });
    }
  }
  return [...map.values()].sort((a, b) => a.command.localeCompare(b.command));
}

function mapIoStats() {
  return new Map(getActiveHandles().filter(h => h.constructor.name.toLowerCase() === 'childprocess').map(handle => [handle.pid, {
    stdin: handle.stdin && handle.stdin.bytesWritten,
    stdout: handle.stdout && handle.stdout.bytesRead,
    stderr: handle.stderr && handle.stderr.bytesRead
  }]));
}

function getActiveHandles() {
  // $FlowFixMe: Private method.
  return process._getActiveHandles();
}

// Takes a string of the form HHH:MM:SS.ssss of hours, minutes,
// seconds, and fractions thereof, and returns seconds.  All parts
// are optional except seconds.
function durationInSeconds(duration) {
  return duration.split(':').reduce((acc, value) => 60 * acc + Number(value), 0);
}