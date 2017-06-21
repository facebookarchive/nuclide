'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Processes = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _Adb;

function _load_Adb() {
  return _Adb = require('../bridges/Adb');
}

var _Sdb;

function _load_Sdb() {
  return _Sdb = require('../bridges/Sdb');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _os = _interopRequireDefault(require('os'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const VALID_PROCESS_REGEX = new RegExp(/\d+\s()/);

class Processes {

  constructor(db) {
    this._db = db;
  }

  getProcesses() {
    return this._db.runShortCommand('shell', 'ps').map(stdout => stdout.split(/\n/));
  }

  _getGlobalProcessStat() {
    return this._db.runShortCommand('shell', 'cat', '/proc/stat').map(stdout => stdout.split(/\n/)[0].trim());
  }

  _getProcStats() {
    return this._db.runShortCommand('shell', 'for file in /proc/[0-9]*/stat; do cat "$file" 2>/dev/null || true; done').map(stdout => {
      return stdout.split(/\n/).filter(line => VALID_PROCESS_REGEX.test(line));
    });
  }

  fetch() {
    return _rxjsBundlesRxMinJs.Observable.forkJoin(this.getProcesses().catch(() => _rxjsBundlesRxMinJs.Observable.of([])), this._db.getDebuggableProcesses().catch(() => _rxjsBundlesRxMinJs.Observable.of([])), this._getProcessAndMemoryUsage().catch(() => _rxjsBundlesRxMinJs.Observable.of(new Map()))).map(([processes, javaProcesses, cpuAndMemUsage]) => {
      const javaPids = new Set(javaProcesses.map(javaProc => Number(javaProc.pid)));
      return (0, (_collection || _load_collection()).arrayCompact)(processes.map(x => {
        const info = x.trim().split(/\s+/);
        const pid = parseInt(info[1], 10);
        if (!Number.isInteger(pid)) {
          return null;
        }
        const cpuAndMem = cpuAndMemUsage.get(pid);
        let cpu = null;
        let mem = null;
        if (cpuAndMem != null) {
          cpu = parseFloat(cpuAndMem[0]);
          mem = parseFloat(cpuAndMem[1]);
        }
        const isJava = javaPids.has(pid);
        return {
          user: info[0],
          pid,
          name: info[info.length - 1],
          cpuUsage: cpu,
          memUsage: mem,
          isJava };
      }));
    });
  }

  _getProcessAndMemoryUsage() {
    return _rxjsBundlesRxMinJs.Observable.interval(500).startWith(0).switchMap(() => {
      return _rxjsBundlesRxMinJs.Observable.forkJoin(this._getProcessesTime(), this._getGlobalCPUTime());
    }).take(2).toArray().map(times => {
      const [procTimePrev, cpuTimePrev] = times[0];
      const [procTime, cpuTime] = times[1];
      // pid => cpuUsage, memory usage
      const cpuAndMemUsage = new Map();
      const deltaCpu = cpuTime - cpuTimePrev;
      procTime.forEach((p1, pid) => {
        if (!procTimePrev.has(pid)) {
          return;
        }
        const p0 = procTimePrev.get(pid);
        if (p0 != null) {
          const deltaProc = p1[0] - p0[0];
          const memUsage = p1[1];
          cpuAndMemUsage.set(pid, [deltaProc / deltaCpu * 100, memUsage]);
        }
      });
      return cpuAndMemUsage;
    });
  }

  /**
   * Returns a map: pid => utime + stime
   */
  _getProcessesTime() {
    // We look for the all the /proc/PID/stat files failing silently if the process dies as the
    // command runs.
    return this._getProcStats().map(lines => {
      return new Map(lines.map(line => {
        const info = line.trim().split(/\s/);
        return [parseInt(info[0], 10), [parseInt(info[12], 10) + parseInt(info[13], 10), // stime + utime
        parseInt(info[23], 10)]];
      }));
    });
  }

  _getGlobalCPUTime() {
    return this._getGlobalProcessStat().map(stdout => {
      return stdout.split(/\s+/).slice(1, -2).reduce((acc, current) => {
        return acc + parseInt(current, 10);
      }, 0);
    });
  }

  getPidFromPackageName(packageName) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const pidLine = (yield _this._db.runShortCommand('shell', 'ps', '|', 'grep', '-i', packageName).toPromise()).split(_os.default.EOL)[0];
      if (pidLine == null) {
        throw new Error(`Can not find a running process with package name: ${packageName}`);
      }
      // First column is 'USER', second is 'PID'.
      return parseInt(pidLine.trim().split(/\s+/)[1], /* radix */10);
    })();
  }
}
exports.Processes = Processes;