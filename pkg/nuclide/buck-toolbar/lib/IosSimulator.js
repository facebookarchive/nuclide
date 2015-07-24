'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {asyncExecute} = require('nuclide-commons');

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
  getDevices,
};
