'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

async function timedAsync<T>(promise: Promise<T>): Promise<{time: number, ret: T}> {
  var start = Date.now();
  var ret = await promise;
  await sleepUntilNoRequests();
  var time = Date.now() - start;
  return {time, ret};
}

function timedSync<T>(func: () => T): {time: number, ret: T} {
  var start = Date.now();
  var ret = func();
  Promise.resolve(sleepUntilNoRequests());
  var time = Date.now() - start;
  return {time, ret};
}

function makeSizedFixture(location: string, size: number): void {
  var fs = require('fs');
  var file = fs.openSync(location, 'w');
  var line = '// ------\n';
  var lineLength = line.length;
  fs.truncateSync(file, 0);
  for (var i = 0; i < size; i += lineLength) {
    fs.writeSync(file, line);
  }
  fs.closeSync(file);
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function sleepUntilNoRequests(pollMilliseconds: number = 1) {
  while (process._getActiveRequests().length !== 0) {
    await sleep(pollMilliseconds);
  }
}

function yellow(str: string): string {
  return `\x1b[93m${str}\x1b[0m`;
}

function green(str: string): string {
  return `\x1b[92m${str}\x1b[0m`;
}

module.exports = {
  timedAsync,
  timedSync,
  makeSizedFixture,
  sleep,
  sleepUntilNoRequests,
  yellow,
  green,
};
