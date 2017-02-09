/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {runCommand} from '../../commons-node/process';
import memoize from 'lodash.memoize';
import {Observable} from 'rxjs';

export type DeviceState = 'CREATING' | 'BOOTING' | 'SHUTTING_DOWN' | 'SHUT_DOWN' | 'BOOTED';

export type Device = {
  name: string,
  udid: string,
  state: ?DeviceState,
  os: string,
};

export function parseDevicesFromFbsimctlOutput(output: string): Array<Device> {
  const devices = [];

  output.split('\n').forEach(line => {
    let event;
    try {
      event = JSON.parse(line);
    } catch (e) {
      return;
    }
    if (!event || !event.event_name || event.event_name !== 'list' || !event.subject) {
      return;
    }
    const simulator = event.subject;
    if (!simulator.state || !simulator.os || !simulator.name || !simulator.udid) {
      return;
    }

    if (!simulator.os.match(/^iOS (.+)$/)) {
      return;
    }

    devices.push({
      name: simulator.name,
      udid: simulator.udid,
      state: validateState(simulator.state),
      os: simulator.os,
    });
  });

  return devices;
}

export function parseDevicesFromSimctlOutput(output: string): Array<Device> {
  const devices = [];
  let currentOS = null;

  output.split('\n').forEach(line => {
    const section = line.match(/^-- (.+) --$/);
    if (section) {
      const header = section[1].match(/^iOS (.+)$/);
      if (header) {
        currentOS = header[1];
      } else {
        currentOS = null;
      }
      return;
    }

    const device =
      line.match(/^[ ]*([^()]+) \(([^()]+)\) \((Creating|Booting|Shutting Down|Shutdown|Booted)\)/);
    if (device && currentOS) {
      const [, name, udid, state] = device;
      devices.push({
        name,
        udid,
        state: validateState(state),
        os: currentOS,
      });
    }
  });

  return devices;
}

function validateState(rawState: ?string): ?DeviceState {
  switch (rawState) {
    case 'Creating': return 'CREATING';
    case 'Booting': return 'BOOTING';
    case 'Shutting Down': return 'SHUTTING_DOWN';
    case 'Shutdown': return 'SHUT_DOWN';
    case 'Booted': return 'BOOTED';
    default: return null;
  }
}

export const getFbsimctlDevices: () => Observable<Array<Device>> = memoize(() => (
  runCommand('fbsimctl', ['--json', '--simulators', 'list'])
    .map(parseDevicesFromFbsimctlOutput)
    .catch(error => (
      // Users may not have fbsimctl installed. If the command failed, just return an empty list.
      Observable.of([])
    ))
    .share()
));

export const getDevices: () => Observable<Array<Device>> = memoize(() => (
  runCommand('xcrun', ['simctl', 'list', 'devices'])
    .map(parseDevicesFromSimctlOutput)
    .catch(error => (
      // Users may not have xcrun installed, particularly if they are using Buck for non-iOS
      // projects. If the command failed, just return an empty list.
      Observable.of([])
    ))
    .share()
));

export function getActiveDeviceIndex(devices: Array<Device>): number {
  const bootedDeviceIndex = devices.findIndex(device => device.state === 'BOOTED');
  if (bootedDeviceIndex > -1) {
    return bootedDeviceIndex;
  }

  let defaultDeviceIndex = 0;
  let lastOS = '';
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
