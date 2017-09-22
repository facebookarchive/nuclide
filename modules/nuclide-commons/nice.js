'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.niceSafeSpawn = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let niceSafeSpawn = exports.niceSafeSpawn = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (command, args, execOptions) {
    const nicified = yield nicifyCommand(command, args, execOptions);
    const processStream = (0, (_process || _load_process()).spawn)(...nicified).publish();
    const processPromise = processStream.take(1).toPromise();
    processStream.connect();
    return processPromise;
  });

  return function niceSafeSpawn(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

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


let nicifyCommand = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (command, args, options) {
    const fullArgs = [command, ...(args || [])];
    if (yield hasNiceCommand()) {
      fullArgs.unshift(NICE_COMMAND);
    }
    if (yield hasIoniceCommand()) {
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
  });

  return function nicifyCommand(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
})();

let hasCommand = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (command) {
    let result = commandAvailabilityCache.get(command);
    if (result == null) {
      result = (yield (0, (_which || _load_which()).default)(command)) != null;
      commandAvailabilityCache.set(command, result);
    }
    return result;
  });

  return function hasCommand(_x7) {
    return _ref3.apply(this, arguments);
  };
})();

exports.niceObserveProcess = niceObserveProcess;

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('./which'));
}

var _process;

function _load_process() {
  return _process = require('./process');
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

const commandAvailabilityCache = (0, (_lruCache || _load_lruCache()).default)({
  max: 10,
  // Realistically this will not change very often so we can cache for long periods of time. We
  // probably could just check at startup and get away with it, but maybe someone will install
  // `ionice` and it would be nice to pick that up.
  maxAge: 1000 * 60 * 5 });

function hasNiceCommand() {
  return hasCommand(NICE_COMMAND);
}

function hasIoniceCommand() {
  return hasCommand(IONICE_COMMAND);
}

function niceObserveProcess(command, args, options) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => nicifyCommand(command, args, options)).switchMap(spawnArgs => (0, (_process || _load_process()).observeProcess)(...spawnArgs));
}