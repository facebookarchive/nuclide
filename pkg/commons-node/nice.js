Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var niceSafeSpawn = _asyncToGenerator(function* (command, args, execOptions) {
  var nicified = yield nicifyCommand(command, args);
  return (0, (_process || _load_process()).safeSpawn)(nicified.command, nicified.args, execOptions);
});

exports.niceSafeSpawn = niceSafeSpawn;

var niceCheckOutput = _asyncToGenerator(function* (command, args, execOptions) {
  var nicified = yield nicifyCommand(command, args);
  return yield (0, (_process || _load_process()).checkOutput)(nicified.command, nicified.args, execOptions);
});

exports.niceCheckOutput = niceCheckOutput;

var niceAsyncExecute = _asyncToGenerator(function* (command, args, execOptions) {
  var nicified = yield nicifyCommand(command, args);
  return yield (0, (_process || _load_process()).asyncExecute)(nicified.command, nicified.args, execOptions);
});

exports.niceAsyncExecute = niceAsyncExecute;

var nicifyCommand = _asyncToGenerator(function* (command, args) {
  var fullArgs = [command].concat(args);
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
  return {
    command: fullArgs[0],
    args: fullArgs.slice(1)
  };
});

var hasCommand = _asyncToGenerator(function* (command) {
  var result = commandAvailabilityCache.get(command);
  if (result == null) {
    result = (yield (0, (_which || _load_which()).default)(command)) != null;
    commandAvailabilityCache.set(command, result);
  }
  return result;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _process;

function _load_process() {
  return _process = require('./process');
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('./which'));
}

var NICE_COMMAND = 'nice';
var IONICE_COMMAND = 'ionice';

var commandAvailabilityCache = (0, (_lruCache || _load_lruCache()).default)({
  max: 10,
  // Realistically this will not change very often so we can cache for long periods of time. We
  // probably could just check at startup and get away with it, but maybe someone will install
  // `ionice` and it would be nice to pick that up.
  maxAge: 1000 * 60 * 5 });

// 5 minutes
function hasNiceCommand() {
  return hasCommand(NICE_COMMAND);
}

function hasIoniceCommand() {
  return hasCommand(IONICE_COMMAND);
}