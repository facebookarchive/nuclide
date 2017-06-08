'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdbTop = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _Adb;

function _load_Adb() {
  return _Adb = require('./Adb');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

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

/**
 * It tries to mimic what the top utility would report, but we have to do it manually because
 * different devices can have different versions of top.
 *
 * Reference for calculations: https://github.com/scaidermern/top-processes
 */

class AdbTop {

  constructor(adb, device) {
    this._adb = adb;
    this._device = device;
  }

  fetch() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const [processes, javaProcesses, cpuAndMemUsage] = yield Promise.all([_this._getProcessList().catch(function () {
        return [];
      }), _this._adb.getJavaProcesses(_this._device).catch(function () {
        return [];
      }), _this._getProcessAndMemoryUsage().catch(function () {
        return new Map();
      })]);
      const javaPids = new Set(javaProcesses.map(function (javaProc) {
        return Number(javaProc.pid);
      }));
      return (0, (_collection || _load_collection()).arrayCompact)(processes.map(function (x) {
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
          isJava
        };
      }));
    })();
  }

  _getProcessList() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this2._adb.runShortCommand(_this2._device, ['shell', 'ps']).toPromise()).split(/\n/);
    })();
  }

  _getProcessAndMemoryUsage() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const [procTimePrev, cpuTimePrev] = yield Promise.all([_this3._getProcessesTime(), _this3._getGlobalCPUTime()]);
      yield (0, (_promise || _load_promise()).sleep)(500);
      const [procTime, cpuTime] = yield Promise.all([_this3._getProcessesTime(), _this3._getGlobalCPUTime()]);

      // pid => cpuUsage, memory usage
      const cpuAndMemUsage = new Map();
      const deltaCpu = cpuTime - cpuTimePrev;
      procTime.forEach(function (p1, pid) {
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
    })();
  }

  /**
   * Returns a map: pid => utime + stime
   */
  _getProcessesTime() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const validProcessRegex = new RegExp(/\d+\s()/);
      // We look for the all the /proc/PID/stat files failing silently if the process dies as the
      // command runs.
      const procTime = (yield _this4._adb.runShortCommand(_this4._device, ['shell', 'for file in /proc/[0-9]*/stat; do cat "$file" 2>/dev/null || true; done']).toPromise()).split(/\n/).filter(function (x) {
        return validProcessRegex.test(x);
      });
      return new Map(procTime.map(function (x) {
        const info = x.trim().split(/\s/);
        return [parseInt(info[0], 10), [parseInt(info[12], 10) + parseInt(info[13], 10), // stime + utime
        parseInt(info[23], 10)]];
      }));
    })();
  }

  _getGlobalCPUTime() {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this5._getGlobalProcessStat()).split(/\s+/).slice(1, -2).reduce(function (acc, current) {
        const val = parseInt(current, 10);
        return acc + val;
      }, 0);
    })();
  }

  _getGlobalProcessStat() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this6._adb.runShortCommand(_this6._device, ['shell', 'cat', '/proc/stat']).toPromise()).split(/\n/)[0].trim();
    })();
  }
}
exports.AdbTop = AdbTop;