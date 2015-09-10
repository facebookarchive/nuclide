'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {array, asyncExecute} = require('nuclide-commons');

export type Device = {
  name: string;
  udid: string;
  state: string;
  os: string;
}

var DeviceState = {
  Creating: 'Creating',
  Booting: 'Booting',
  ShuttingDown: 'Shutting Down',
  Shutdown: 'Shutdown',
  Booted: 'Booted',
};

function parseDevicesFromSimctlOutput(output: string): Device[] {
  var devices = [];
  var currentOS = null;

  output.split('\n').forEach(line => {
    var section = line.match(/^-- (.+) --$/);
    if (section) {
      var header = section[1].match(/^iOS (.+)$/);
      if (header) {
        currentOS = header[1];
      } else {
        currentOS = null;
      }
      return;
    }

    var device = line.match(/^[ ]*([^()]+) \(([^()]+)\) \((Creating|Booting|Shutting Down|Shutdown|Booted)\)/);
    if (device && currentOS) {
      var [, name, udid, state] = device;
      devices.push({name, udid, state, os: currentOS});
    }
  });

  return devices;
}

async function getDevices(): Promise<Device[]> {
  var xcrunOutput;
  try {
    var {stdout} = await asyncExecute('xcrun', ['simctl', 'list', 'devices']);
    xcrunOutput = stdout;
  } catch (e) {
    // Users may not have xcrun installed, particularly if they are using Buck for non-iOS projects.
    return [];
  }
  return parseDevicesFromSimctlOutput(xcrunOutput);
}

function selectDevice(devices: Device[]): number {
  var bootedDeviceIndex = array.findIndex(
    devices,
    device => device.state === DeviceState.Booted
  );
  if (bootedDeviceIndex > -1) {
    return bootedDeviceIndex;
  }

  var defaultDeviceIndex = 0;
  var lastOS = '';
  devices.forEach((device, index) => {
    if (device.name === 'iPhone 5s') {
      if (device.os > lastOS) {
        defaultDeviceIndex = index;
        lastOS = device.os;
      }
    }
  });
  return defaultDeviceIndex;
}


module.exports = {
  DeviceState,
  getDevices,
  parseDevicesFromSimctlOutput,
  selectDevice,
};
