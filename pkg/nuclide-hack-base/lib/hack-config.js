Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.findHackConfigDir = findHackConfigDir;

// Returns the empty string on failure

var findHackCommand = _asyncToGenerator(function* () {
  // `stdout` would be empty if there is no such command.
  return (yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).asyncExecute)('which', [PATH_TO_HH_CLIENT])).stdout.trim();
});

exports.setHackCommand = setHackCommand;
exports.getHackCommand = getHackCommand;

var getHackExecOptions = _asyncToGenerator(function* (localFile) {
  var _ref = yield Promise.all([hackCommand, findHackConfigDir(localFile)]);

  var _ref2 = _slicedToArray(_ref, 2);

  var currentHackCommand = _ref2[0];
  var hackRoot = _ref2[1];

  if (hackRoot && currentHackCommand) {
    return { hackRoot: hackRoot, hackCommand: currentHackCommand };
  } else {
    return null;
  }
});

exports.getHackExecOptions = getHackExecOptions;
exports.setUseIde = setUseIde;
exports.getUseIde = getUseIde;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var HACK_LOGGER_CATEGORY = 'nuclide-hack';
var logger = require('../../nuclide-logging').getCategoryLogger(HACK_LOGGER_CATEGORY);

exports.logger = logger;
var HACK_CONFIG_FILE_NAME = '.hhconfig';
var PATH_TO_HH_CLIENT = 'hh_client';

// Kick this off early, so we don't need to repeat this on every call.
// We don't have a way of changing the path on the dev server after a
// connection is made so this shouldn't change over time.
// Worst case scenario is requiring restarting Nuclide after changing the hh_client path.
var DEFAULT_HACK_COMMAND = findHackCommand();
var hackCommand = DEFAULT_HACK_COMMAND;

var useConnection = false;

/**
* If this returns null, then it is not safe to run hack.
*/

function findHackConfigDir(localFile) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile(HACK_CONFIG_FILE_NAME, localFile);
}

function setHackCommand(newHackCommand) {
  if (newHackCommand === '') {
    hackCommand = DEFAULT_HACK_COMMAND;
  } else {
    logger.logTrace('Using custom hh_client: ' + newHackCommand);
    hackCommand = Promise.resolve(newHackCommand);
  }
}

function getHackCommand() {
  return hackCommand;
}

function setUseIde(useIdeConnection) {
  useConnection = useIdeConnection;
}

function getUseIde() {
  return useConnection;
}