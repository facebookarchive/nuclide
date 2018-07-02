"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.niceSafeSpawn = niceSafeSpawn;
exports.niceObserveProcess = niceObserveProcess;

function _lruCache() {
  const data = _interopRequireDefault(require("lru-cache"));

  _lruCache = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _which() {
  const data = _interopRequireDefault(require("./which"));

  _which = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("./process");

  _process = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
const NICE_COMMAND = 'nice';
const IONICE_COMMAND = 'ionice';

async function niceSafeSpawn(command, args, execOptions) {
  const nicified = await nicifyCommand(command, args, execOptions);
  const processStream = (0, _process().spawn)(...nicified).publish();
  const processPromise = processStream.take(1).toPromise();
  processStream.connect();
  return processPromise;
}
/**
 * Takes the arguments that you would normally pass to `spawn()` and returns an array of new
 * arguments to use to run the command under `nice`.
 *
 * Example:
 *
 * ```js
 * observeProcess(...(await nicifyCommand('hg', ['diff']))).subscribe(...);
 * ```
 *
 * See also `scriptifyCommand()` which does a similar thing but for `script`.
 */


async function nicifyCommand(command, args, options) {
  const fullArgs = [command, ...(args || [])];

  if (await hasNiceCommand()) {
    fullArgs.unshift(NICE_COMMAND);
  }

  if (await hasIoniceCommand()) {
    // Leave the process in the Best Effort class (default), but set it to the lowest priority for
    // that class. Priorities range from 0-7 with 4 as the default and lower numbers representing
    // higher priorities.
    //
    // See `man ionice` or http://linux.die.net/man/1/ionice
    //
    // It's not specified by POSIX like `nice` is but since it is included in util-linux which is
    // relatively core
    // (https://git.kernel.org/cgit/utils/util-linux/util-linux.git/tree/schedutils/ionice.c), I
    // think we can assume that it uses this interface if it exists.
    fullArgs.unshift(IONICE_COMMAND, '-n', '7');
  }

  return [fullArgs[0], fullArgs.slice(1), options];
}

const commandAvailabilityCache = (0, _lruCache().default)({
  max: 10,
  // Realistically this will not change very often so we can cache for long periods of time. We
  // probably could just check at startup and get away with it, but maybe someone will install
  // `ionice` and it would be nice to pick that up.
  maxAge: 1000 * 60 * 5 // 5 minutes

});

function hasNiceCommand() {
  return hasCommand(NICE_COMMAND);
}

function hasIoniceCommand() {
  return hasCommand(IONICE_COMMAND);
}

function hasCommand(command) {
  let result = commandAvailabilityCache.get(command);

  if (result == null) {
    result = (0, _which().default)(command).then(x => x != null);
    commandAvailabilityCache.set(command, result);
  }

  return result;
}

function niceObserveProcess(command, args, options) {
  return _RxMin.Observable.defer(() => nicifyCommand(command, args, options)).switchMap(spawnArgs => (0, _process().observeProcess)(...spawnArgs));
}