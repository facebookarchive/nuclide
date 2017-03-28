'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.niceAsyncExecute = exports.niceCheckOutput = exports.niceSafeSpawn = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let niceSafeSpawn = exports.niceSafeSpawn = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (command, args, execOptions) {
    const nicified = yield nicifyCommand(command, args);
    return (0, (_process || _load_process()).safeSpawn)(nicified.command, nicified.args, execOptions);
  });

  return function niceSafeSpawn(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

let niceCheckOutput = exports.niceCheckOutput = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (command, args, execOptions) {
    const nicified = yield nicifyCommand(command, args);
    return (0, (_process || _load_process()).checkOutput)(nicified.command, nicified.args, execOptions);
  });

  return function niceCheckOutput(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
})();

let niceAsyncExecute = exports.niceAsyncExecute = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (command, args, execOptions) {
    const nicified = yield nicifyCommand(command, args);
    return (0, (_process || _load_process()).asyncExecute)(nicified.command, nicified.args, execOptions);
  });

  return function niceAsyncExecute(_x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
})();

let nicifyCommand = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (command, args) {
    const fullArgs = [command, ...args];
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

  return function nicifyCommand(_x10, _x11) {
    return _ref4.apply(this, arguments);
  };
})();

let hasCommand = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (command) {
    let result = commandAvailabilityCache.get(command);
    if (result == null) {
      result = (yield (0, (_which || _load_which()).default)(command)) != null;
      commandAvailabilityCache.set(command, result);
    }
    return result;
  });

  return function hasCommand(_x12) {
    return _ref5.apply(this, arguments);
  };
})();

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NICE_COMMAND = 'nice'; /**
                              * Copyright (c) 2015-present, Facebook, Inc.
                              * All rights reserved.
                              *
                              * This source code is licensed under the license found in the LICENSE file in
                              * the root directory of this source tree.
                              *
                              * 
                              */

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