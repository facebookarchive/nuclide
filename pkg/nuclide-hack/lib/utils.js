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

exports.getIdentifierAndRange = getIdentifierAndRange;
exports.getIdentifierAtPosition = getIdentifierAtPosition;

var getHackEnvironmentDetails = _asyncToGenerator(function* (fileUri) {
  var hackService = getHackService(fileUri);
  var config = (0, (_config2 || _config()).getConfig)();
  // TODO: Reenable this once the server connection is revived.
  var useIdeConnection = false && (config.useIdeConnection || (yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)('nuclide_hack_use_persistent_connection')));
  var hackEnvironment = yield hackService.getHackEnvironmentDetails(fileUri, config.hhClientPath, useIdeConnection, config.logLevel);
  var isAvailable = hackEnvironment != null;

  var _ref = hackEnvironment || {};

  var hackRoot = _ref.hackRoot;
  var hackCommand = _ref.hackCommand;

  return {
    hackService: hackService,
    hackRoot: hackRoot,
    hackCommand: hackCommand,
    isAvailable: isAvailable,
    useIdeConnection: useIdeConnection
  };
});

exports.getHackEnvironmentDetails = getHackEnvironmentDetails;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsAtomRange2;

function _commonsAtomRange() {
  return _commonsAtomRange2 = require('../../commons-atom/range');
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var HACK_SERVICE_NAME = 'HackService';

var HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

function getIdentifierAndRange(editor, position) {
  var matchData = (0, (_commonsAtomRange2 || _commonsAtomRange()).wordAtPosition)(editor, position, HACK_WORD_REGEX);
  return matchData == null || matchData.wordMatch.length === 0 ? null : { id: matchData.wordMatch[0], range: matchData.range };
}

function getIdentifierAtPosition(editor, position) {
  var result = getIdentifierAndRange(editor, position);
  return result == null ? null : result.id;
}

// Don't call this directly from outside this package.
// Call getHackEnvironmentDetails instead.
function getHackService(filePath) {
  var hackRegisteredService = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)(HACK_SERVICE_NAME, filePath);
  (0, (_assert2 || _assert()).default)(hackRegisteredService);
  return hackRegisteredService;
}