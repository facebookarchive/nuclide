'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launchAndroidServiceOrActivity = launchAndroidServiceOrActivity;
exports.getPidFromPackageName = getPidFromPackageName;
exports.getAdbAttachPortTargetInfo = getAdbAttachPortTargetInfo;

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _utils;

function _load_utils() {
  return _utils = require('../atom-ide-debugger-java/utils');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../nuclide-commons-atom/consumeFirstProvider'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));
}

var _nuclideAdb;

function _load_nuclideAdb() {
  return _nuclideAdb = require('../nuclide-adb');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Only one AdbProcessInfo can be active at a time. Since it ties up a forwarded
// adb port, new instances need to wait for the previous one to clean up before
// they can begin debugging.
let cleanupSubject = null; /**
                            * Copyright (c) 2017-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the BSD-style license found in the
                            * LICENSE file in the root directory of this source tree. An additional grant
                            * of patent rights can be found in the PATENTS file in the same directory.
                            *
                            * 
                            * @format
                            */

async function launchAndroidServiceOrActivity(adbServiceUri, service, activity, action, device, packageName) {
  const adbService = (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(adbServiceUri);
  if (service != null) {
    await adbService.launchService(device.name, packageName, service || '', true);
  } else if (activity != null && action != null) {
    // First query the device to be sure the activity exists in the specified package.
    // This will allow us to bubble up a useful error message instead of a cryptic
    // adb failure if the user simply mistyped the activity or package name.
    const activityExists = await adbService.activityExists(device.name, packageName, activity || '');

    if (!activityExists) {
      const packages = await adbService.getAllAvailablePackages(device.name);
      const availableActivities = new Set(packages.filter(line => line.includes(packageName + '/')));
      atom.notifications.addError(`Activity ${activity || ''} does not exist in package ` + packageName + '\n' + 'Did you mean one of these activities: ' + '\n' + Array.from(availableActivities).map(activityLine => activityLine.split('/')[1]).join('\n'));
    }

    await adbService.launchActivity(device.name, packageName, activity || '', true, action);
  }
}

async function getPidFromPackageName(adbServiceUri, device, packageName) {
  const adbService = (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(adbServiceUri);
  const pid = await adbService.getPidFromPackageName(device.name, packageName);
  if (!Number.isInteger(pid)) {
    throw new Error(`Fail to get pid for package: ${packageName}`);
  }
  return pid;
}

async function getAdbAttachPortTargetInfo(device, adbServiceUri, targetUri, pid, subscriptions) {
  const tunnelRequired = (_nuclideUri || _load_nuclideUri()).default.isLocal(adbServiceUri) && (_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri);
  const tunnelService = tunnelRequired ? await (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide.ssh-tunnel') : null;
  const adbService = (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(adbServiceUri);
  // tunnel Service's getAvailableServerPort does something weird where it
  //   wants adbServiceUri to be either '' or 'localhost'
  const adbPort = tunnelRequired ? await (0, (_nullthrows || _load_nullthrows()).default)(tunnelService).getAvailableServerPort((_nuclideUri || _load_nuclideUri()).default.isLocal(adbServiceUri) ? 'localhost' : adbServiceUri) : await (0, (_utils || _load_utils()).getJavaDebuggerHelpersServiceByNuclideUri)(adbServiceUri).getPortForJavaDebugger();
  const forwardSpec = await adbService.forwardJdwpPortToPid(device.name, adbPort, pid || 0);

  if (cleanupSubject != null) {
    await cleanupSubject.toPromise();
  }
  cleanupSubject = new _rxjsBundlesRxMinJs.Subject();
  subscriptions.add(async () => {
    const result = await adbService.removeJdwpForwardSpec(device.name, forwardSpec);
    if (result.trim().startsWith('error')) {
      // TODO(Ericblue): The OneWorld proxy swaps TCP forward for a local filesystem
      // redirection, which confuses adb and prevents proper removal of
      // the forward spec.  Fall back to removing all specs to avoid leaking
      // the port.
      await adbService.removeJdwpForwardSpec(device.name, null);
    }

    if (cleanupSubject != null) {
      cleanupSubject.complete();
    }
  });

  const attachPort = await new Promise(async (resolve, reject) => {
    try {
      if (!tunnelRequired) {
        resolve(adbPort);
        return;
      }

      if (!tunnelService) {
        throw new Error('Invariant violation: "tunnelService"');
      }

      const debuggerPort = await tunnelService.getAvailableServerPort(targetUri);
      const tunnel = {
        description: 'Java debugger',
        from: {
          host: (_nuclideUri || _load_nuclideUri()).default.getHostname(targetUri),
          port: debuggerPort,
          family: 4
        },
        to: { host: 'localhost', port: adbPort, family: 4 }
      };
      const openTunnel = tunnelService.openTunnels([tunnel]).share();
      subscriptions.add(openTunnel.subscribe());
      await openTunnel.take(1).toPromise();
      resolve(debuggerPort);
    } catch (e) {
      reject(e);
    }
  });
  return {
    debugMode: 'attach',
    machineName: 'localhost',
    port: attachPort
  };
}