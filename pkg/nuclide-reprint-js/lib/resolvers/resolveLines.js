

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _resolveAll2;

function _resolveAll() {
  return _resolveAll2 = _interopRequireDefault(require('./resolveAll'));
}

var _resolveDuplicates2;

function _resolveDuplicates() {
  return _resolveDuplicates2 = _interopRequireDefault(require('./resolveDuplicates'));
}

var _resolveForcedMarkers2;

function _resolveForcedMarkers() {
  return _resolveForcedMarkers2 = _interopRequireDefault(require('./resolveForcedMarkers'));
}

var _resolveForcedScopeBreaks2;

function _resolveForcedScopeBreaks() {
  return _resolveForcedScopeBreaks2 = _interopRequireDefault(require('./resolveForcedScopeBreaks'));
}

var _resolveNoBreaks2;

function _resolveNoBreaks() {
  return _resolveNoBreaks2 = _interopRequireDefault(require('./resolveNoBreaks'));
}

var _resolveScopes2;

function _resolveScopes() {
  return _resolveScopes2 = _interopRequireDefault(require('./resolveScopes'));
}

/**
 * After printing the AST parts and all appropriate markers this will join the
 * parts based on options and the markers that are available.
 */
function resolveLines(lines, options) {
  lines = (0, (_resolveNoBreaks2 || _resolveNoBreaks()).default)(lines);
  lines = (0, (_resolveForcedScopeBreaks2 || _resolveForcedScopeBreaks()).default)(lines);
  lines = (0, (_resolveDuplicates2 || _resolveDuplicates()).default)(lines);

  // Now we will resolve some newlines where possible. This will affect
  // runs, whereas before we were careful to not affect runs of markers.
  lines = (0, (_resolveForcedMarkers2 || _resolveForcedMarkers()).default)(lines);
  lines = (0, (_resolveScopes2 || _resolveScopes()).default)(lines, options);
  return (0, (_resolveAll2 || _resolveAll()).default)(lines, options);
}

module.exports = resolveLines;