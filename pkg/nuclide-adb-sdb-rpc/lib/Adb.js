'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Adb = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.parsePsTableOutput = parsePsTableOutput;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('./DebugBridge');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Adb extends (_DebugBridge || _load_DebugBridge()).DebugBridge {
  getAndroidProp(device, key) {
    return this.runShortAdbCommand(device, ['shell', 'getprop', key]).map(s => s.trim());
  }

  getDeviceArchitecture(device) {
    return this.getAndroidProp(device, 'ro.product.cpu.abi').toPromise();
  }

  getDeviceModel(device) {
    return this.getAndroidProp(device, 'ro.product.model').map(s => s === 'sdk' ? 'emulator' : s).toPromise();
  }

  getAPIVersion(device) {
    return this.getAndroidProp(device, 'ro.build.version.sdk').toPromise();
  }

  installPackage(device, packagePath) {
    if (!!(_nuclideUri || _load_nuclideUri()).default.isRemote(packagePath)) {
      throw new Error('Invariant violation: "!nuclideUri.isRemote(packagePath)"');
    }

    return this.runLongAdbCommand(device, ['install', '-r', packagePath]);
  }

  forwardJdwpPortToPid(device, tcpPort, pid) {
    return this.runShortAdbCommand(device, ['forward', `tcp:${tcpPort}`, `jdwp:${pid}`]).toPromise();
  }

  launchActivity(device, packageName, activity, debug, action) {
    const args = ['shell', 'am', 'start', '-W', '-n'];
    if (action != null) {
      args.push('-a', action);
    }
    if (debug) {
      args.push('-N', '-D');
    }
    args.push(`${packageName}/${activity}`);
    return this.runShortAdbCommand(device, args).toPromise();
  }

  activityExists(device, packageName, activity) {
    const packageActivityString = `${packageName}/${activity}`;
    const deviceArg = device !== '' ? ['-s', device] : [];
    const command = deviceArg.concat(['shell', 'dumpsys', 'package']);
    return (0, (_process || _load_process()).runCommand)(this._adbPath, command).map(stdout => stdout.includes(packageActivityString)).toPromise();
  }

  getJavaProcesses(device) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const allProcesses = yield _this.runShortAdbCommand(device, ['shell', 'ps']).map(function (stdout) {
        const psOutput = stdout.trim();
        return parsePsTableOutput(psOutput, ['user', 'pid', 'name']);
      }).toPromise();

      const args = (device !== '' ? ['-s', device] : []).concat('jdwp');
      return (0, (_process || _load_process()).observeProcessRaw)(_this._adbPath, args, { killTreeOnComplete: true }).take(1).map(function (output) {
        const jdwpPids = new Set();
        if (output.kind === 'stdout') {
          const block = output.data;
          block.split(/\s+/).forEach(function (pid) {
            jdwpPids.add(pid.trim());
          });
        }

        return allProcesses.filter(function (row) {
          return jdwpPids.has(row.pid);
        });
      }).toPromise();
    })();
  }
}

exports.Adb = Adb; /**
                    * Copyright (c) 2015-present, Facebook, Inc.
                    * All rights reserved.
                    *
                    * This source code is licensed under the license found in the LICENSE file in
                    * the root directory of this source tree.
                    *
                    * 
                    */

function parsePsTableOutput(output, desiredFields) {
  const lines = output.split(/\n/);
  const header = lines[0];
  const cols = header.split(/\s+/);
  const colMapping = {};

  for (let i = 0; i < cols.length; i++) {
    const columnName = cols[i].toLowerCase();
    if (desiredFields.includes(columnName)) {
      colMapping[i] = columnName;
    }
  }

  const formattedData = [];
  const data = lines.slice(1);
  data.filter(row => row.trim() !== '').forEach(row => {
    const rowData = row.split(/\s+/);
    const rowObj = {};
    for (let i = 0; i < rowData.length; i++) {
      // Android's ps output has an extra column "S" in the data that doesn't appear
      // in the header. Skip that column's value.
      const effectiveColumn = i;
      if (rowData[i] === 'S' && i < rowData.length - 1) {
        i++;
      }

      if (colMapping[effectiveColumn] !== undefined) {
        rowObj[colMapping[effectiveColumn]] = rowData[i];
      }
    }

    formattedData.push(rowObj);
  });

  return formattedData;
}