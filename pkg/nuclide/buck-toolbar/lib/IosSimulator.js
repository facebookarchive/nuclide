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
var path = require('path');

type Device = {
  udid: string;
  name: string;
  state: string;
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

/**
 * Delay for a period of time.
 *
 * Useful in async:
 *  // do stuff...
 *  await wait(1000);
 *  // do more stuff...
 */
function wait(milliseconds: number): Promise {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
  * Retrieve the bundle identifier of the given app bundle.
  */
async function getBundleIdentifier(bundlePath: string): Promise<string> {
  var bundleIdentifier = await checkStdout(
    'defaults', ['read', path.join(bundlePath, 'Info.plist'), 'CFBundleIdentifier']);
  return bundleIdentifier.trim();
}

/**
  * Install app into simulator.
  */
function installApp(udid: string, bundlePath: string): Promise {
  return checkStdout('xcrun', ['simctl', 'install', udid, bundlePath]);
}

/**
  * Start the simulator GUI for a particular simulator.
  */
async function startSimulator(udid: string): Promise {
  var xcodePath = await checkStdout('xcode-select', ['--print-path']);
  xcodePath = xcodePath.trim();
  await checkStdout('open', [
    '--new',
    '-a', path.join(xcodePath, 'Applications/iOS Simulator.app'),
    '--args', '-CurrentDeviceUDID', udid
  ]);
  for (var i = 0; i < 10; i++) {
    await wait(100);
    var devices = await getDevices();
    var device = array.find(devices, elem => elem.udid === udid);
    if (!device) {
      throw new Error('Simulator device vanished while waiting to start.');
    }
    if (device.state === DeviceState.Booted) {
      return;
    }
  }
  throw new Error('Timed out waiting for simulator to start.');
}

/**
  * Launch app in simulator and return pid.
  */
async function launchApp(udid: string, bundleId: string, debug: boolean): Promise<number> {
  var args = ['simctl', 'launch'];
  if (debug) {
    args.push('--wait-for-debugger');
  }
  args.push(udid, bundleId);
  var output = await checkStdout('xcrun', args);
  var captures = /^(.*): ([0-9]+)$/.exec(output.trim());
  if (!captures) {
    throw new Error('Failed to parse result of simctl launch. output: ' + output);
  }
  return Number(captures[2]);
}

async function getDevices(): Promise<Device[]> {
  var stdout = await checkStdout('xcrun', ['simctl', 'list', 'devices']);

  // Output looks something like this:
  //
  // > == Devices ==
  // > -- iOS 8.3 --
  // >     iPhone 4s (34582EC5-2135-4DF3-A615-3764E580B2B9) (Shutdown)
  // >     iPhone 5 (F8739886-A276-4719-B116-06FEEB1411DF) (Shutdown)
  // > -- Unavailable: com.apple.CoreSimulator.SimRuntime.iOS-7-1 --
  // >     iPhone 4s (7CEBF91C-8740-458C-AC67-F137432A6BFA) (Shutdown) (unavailable, runtime profile not found)
  var pattern = /^ {4}(.+) \(([0-9A-F-]+)\) \((Creating|Booting|Shutting Down|Shutdown|Booted)\)( \(unavailable, (.*)\))?$/;
  //                  ^      ^                ^                                                 ^                ^
  //                  |      2. udid          3. state                                          4. unavailable?  5. reason
  //                  1. name
  var lines = stdout.split('\n');
  var devices = [];
  lines.forEach(line => {
    var result = pattern.exec(line);
    if (result && !result[4]) {
      devices.push({
        udid: result[2],
        name: result[1],
        state: result[3],
      });
    }
  });
  return devices;
}


module.exports = {
  DeviceState,
  getBundleIdentifier,
  installApp,
  startSimulator,
  launchApp,
  getDevices,
};
