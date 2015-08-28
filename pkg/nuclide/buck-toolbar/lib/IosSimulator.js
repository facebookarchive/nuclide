'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {array} = require('nuclide-commons');
var {asyncExecute} = require('nuclide-commons');

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

/**
 * Executes a command and returns stdout if exit code is 0, otherwise reject
 * with a message and stderr.
 */
async function checkStdout(cmd: string, args: Array<string>, options: ?Object = {}): Promise<string> {
  try {
    var {stdout} = await asyncExecute(cmd, args, options);
    return stdout;
  } catch(e) {
    throw new Error(`Process exited with non-zero exit code (${e.exitCode}). stderr: ${e.stderr}`);
  }
}

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
  var stdout = await checkStdout('xcrun', ['simctl', 'list', 'devices']);
  return parseDevicesFromSimctlOutput(stdout);
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
