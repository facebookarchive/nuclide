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

exports.compareHackCompletions = compareHackCompletions;
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

var _commonsAtomWordAtPosition2;

function _commonsAtomWordAtPosition() {
  return _commonsAtomWordAtPosition2 = _interopRequireDefault(require('../../commons-atom/word-at-position'));
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var MATCH_PREFIX_CASE_SENSITIVE_SCORE = 6;
var MATCH_PREFIX_CASE_INSENSITIVE_SCORE = 4;
var MATCH_TOKEN_CASE_SENSITIVE_SCORE = 2;
var MATCH_TOKEN_CASE_INSENSITIVE_SCORE = 0;
var MATCH_PRIVATE_FUNCTION_PENALTY = -4;
var MATCH_APLHABETICAL_SCORE = 1;
var HACK_SERVICE_NAME = 'HackService';

function compareHackCompletions(token) {
  var tokenLowerCase = token.toLowerCase();

  return function (matchText1, matchText2) {
    var matchTexts = [matchText1, matchText2];
    var scores = matchTexts.map(function (matchText, i) {
      if (matchText.startsWith(token)) {
        // Matches starting with the prefix gets the highest score.
        return MATCH_PREFIX_CASE_SENSITIVE_SCORE;
      } else if (matchText.toLowerCase().startsWith(tokenLowerCase)) {
        // Ignore case score matches gets a good score.
        return MATCH_PREFIX_CASE_INSENSITIVE_SCORE;
      }

      var score = undefined;
      if (matchText.indexOf(token) !== -1) {
        // Small score for a match that contains the token case-sensitive.
        score = MATCH_TOKEN_CASE_SENSITIVE_SCORE;
      } else {
        // Zero score for a match that contains the token without case-sensitive matching.
        score = MATCH_TOKEN_CASE_INSENSITIVE_SCORE;
      }

      // Private functions gets negative score.
      if (matchText.startsWith('_')) {
        score += MATCH_PRIVATE_FUNCTION_PENALTY;
      }
      return score;
    });
    // Finally, consider the alphabetical order, but not higher than any other score.
    if (matchTexts[0] < matchTexts[1]) {
      scores[0] += MATCH_APLHABETICAL_SCORE;
    } else {
      scores[1] += MATCH_APLHABETICAL_SCORE;
    }
    return scores[1] - scores[0];
  };
}

var HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

function getIdentifierAndRange(editor, position) {
  var matchData = (0, (_commonsAtomWordAtPosition2 || _commonsAtomWordAtPosition()).default)(editor, position, HACK_WORD_REGEX);
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