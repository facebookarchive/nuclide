'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getJavaProcesses = exports.getPidFromPackageName = exports.getAPIVersion = exports.getDeviceList = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getDeviceList = exports.getDeviceList = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (adbPath) {
    const devices = yield (0, (_process || _load_process()).runCommand)(adbPath, ['devices']).map(function (stdout) {
      return stdout.split(/\n+/g).slice(1).filter(function (s) {
        return s.length > 0 && !s.trim().startsWith('*');
      }).map(function (s) {
        return s.split(/\s+/g);
      }).filter(function (a) {
        return a[0] !== '';
      }).map(function (a) {
        return a[0];
      });
    }).toPromise();

    const deviceTable = yield Promise.all(devices.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (name) {
        try {
          const architecture = yield getDeviceArchitecture(adbPath, name);
          const apiVersion = yield getAPIVersion(adbPath, name);
          const model = yield getDeviceModel(adbPath, name);
          return { name, architecture, apiVersion, model };
        } catch (error) {
          return null;
        }
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })()));

    return (0, (_collection || _load_collection()).arrayCompact)(deviceTable);
  });

  return function getDeviceList(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getAPIVersion = exports.getAPIVersion = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (adbPath, device) {
    if (adbPath.endsWith('sdb')) {
      let version;
      try {
        version = yield getTizenModelConfigKey(adbPath, device, 'tizen.org/feature/platform.core.api.version');
      } catch (e) {
        version = yield getTizenModelConfigKey(adbPath, device, 'tizen.org/feature/platform.native.api.version');
      }
      return version;
    } else {
      return getAndroidProp(adbPath, device, 'ro.build.version.sdk').toPromise();
    }
  });

  return function getAPIVersion(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
})();

let getPidFromPackageName = exports.getPidFromPackageName = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (adbPath, device, packageName) {
    const pidLine = (yield runShortAdbCommand(adbPath, device, ['shell', 'ps', '|', 'grep', '-i', packageName]).toPromise()).split(_os.EOL)[0];
    if (pidLine == null) {
      throw new Error(`Can not find a running process with package name: ${packageName}`);
    }
    // First column is 'USER', second is 'PID'.
    return parseInt(pidLine.trim().split(/\s+/)[1], /* radix */10);
  });

  return function getPidFromPackageName(_x5, _x6, _x7) {
    return _ref4.apply(this, arguments);
  };
})();

let getJavaProcesses = exports.getJavaProcesses = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (adbPath, device) {
    const allProcesses = yield runShortAdbCommand(adbPath, device, ['shell', 'ps']).map(function (stdout) {
      const psOutput = stdout.trim();
      return parsePsTableOutput(psOutput, ['user', 'pid', 'name']);
    }).toPromise();

    const args = (device !== '' ? ['-s', device] : []).concat('jdwp');
    return (0, (_process || _load_process()).observeProcessRaw)(function () {
      return (0, (_process || _load_process()).safeSpawn)(adbPath, args);
    }, true).take(1).map(function (output) {
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
  });

  return function getJavaProcesses(_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
})();

exports.startServer = startServer;
exports.getDeviceArchitecture = getDeviceArchitecture;
exports.getDeviceModel = getDeviceModel;
exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;
exports.forwardJdwpPortToPid = forwardJdwpPortToPid;
exports.launchActivity = launchActivity;
exports.activityExists = activityExists;
exports.parsePsTableOutput = parsePsTableOutput;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _os = _interopRequireWildcard(require('os'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function runShortAdbCommand(adbPath, device, command) {
  const deviceArg = device !== '' ? ['-s', device] : [];
  return (0, (_process || _load_process()).runCommand)(adbPath, deviceArg.concat(command));
}

function runLongAdbCommand(adbPath, device, command) {
  const deviceArg = device !== '' ? ['-s', device] : [];
  return (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)(adbPath, deviceArg.concat(command)), true);
}

function getAndroidProp(adbPath, device, key) {
  return runShortAdbCommand(adbPath, device, ['shell', 'getprop', key]).map(s => s.trim());
}

function getTizenModelConfigKey(adbPath, device, key) {
  const modelConfigPath = '/etc/config/model-config.xml';

  return runShortAdbCommand(adbPath, device, ['shell', 'cat', modelConfigPath]).map(stdout => stdout.split(/\n+/g).filter(s => s.indexOf(key) !== -1)[0]).map(s => {
    const regex = /.*<.*>(.*)<.*>/g;
    return regex.exec(s)[1];
  }).toPromise();
}

function startServer(adbPath) {
  return (0, (_process || _load_process()).runCommand)(adbPath, ['start-server']).publish();
}

function getDeviceArchitecture(adbPath, device) {
  // SDB is a tool similar to ADB used with Tizen devices. `getprop` doesn't
  // exist on Tizen, so we have to rely on uname instead.
  if (adbPath.endsWith('sdb')) {
    return runShortAdbCommand(adbPath, device, ['shell', 'uname', '-m']).map(s => s.trim()).toPromise();
  } else {
    return getAndroidProp(adbPath, device, 'ro.product.cpu.abi').toPromise();
  }
}

function getDeviceModel(adbPath, device) {
  if (adbPath.endsWith('sdb')) {
    return getTizenModelConfigKey(adbPath, device, 'tizen.org/system/model_name');
  } else {
    return getAndroidProp(adbPath, device, 'ro.product.model').map(s => s === 'sdk' ? 'emulator' : s).toPromise();
  }
}

function installPackage(adbPath, device, packagePath) {
  if (!!(_nuclideUri || _load_nuclideUri()).default.isRemote(packagePath)) {
    throw new Error('Invariant violation: "!nuclideUri.isRemote(packagePath)"');
  }

  if (adbPath.endsWith('adb')) {
    // SDB overwrites existing packages by default, ADB needs the '-r' option
    return runLongAdbCommand(adbPath, device, ['install', '-r', packagePath]);
  } else {
    return runLongAdbCommand(adbPath, device, ['install', packagePath]);
  }
}

function uninstallPackage(adbPath, device, packageName) {
  return runLongAdbCommand(adbPath, device, ['uninstall', packageName]);
}

function forwardJdwpPortToPid(adbPath, device, tcpPort, pid) {
  return runShortAdbCommand(adbPath, device, ['forward', `tcp:${tcpPort}`, `jdwp:${pid}`]).toPromise();
}

function launchActivity(adbPath, device, packageName, activity, action) {
  return runShortAdbCommand(adbPath, device, ['shell', 'am', 'start', '-D', '-N', '-W', '-a', action, '-n', `${packageName}/${activity}`]).toPromise();
}

function activityExists(adbPath, device, packageName, activity) {
  const packageActivityString = `${packageName}/${activity}`;
  const deviceArg = device !== '' ? ['-s', device] : [];
  const command = deviceArg.concat(['shell', 'dumpsys', 'package']);
  return (0, (_process || _load_process()).runCommand)(adbPath, command).map(stdout => stdout.includes(packageActivityString)).toPromise();
}

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