function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _resolveAll = require('./resolveAll');

var _resolveAll2 = _interopRequireDefault(_resolveAll);

var _resolveDuplicates = require('./resolveDuplicates');

var _resolveDuplicates2 = _interopRequireDefault(_resolveDuplicates);

var _resolveForcedMarkers = require('./resolveForcedMarkers');

var _resolveForcedMarkers2 = _interopRequireDefault(_resolveForcedMarkers);

var _resolveForcedScopeBreaks = require('./resolveForcedScopeBreaks');

var _resolveForcedScopeBreaks2 = _interopRequireDefault(_resolveForcedScopeBreaks);

var _resolveNoBreaks = require('./resolveNoBreaks');

var _resolveNoBreaks2 = _interopRequireDefault(_resolveNoBreaks);

var _resolveScopes = require('./resolveScopes');

var _resolveScopes2 = _interopRequireDefault(_resolveScopes);

/**
 * After printing the AST parts and all appropriate markers this will join the
 * parts based on options and the markers that are available.
 */
function resolveLines(lines, options) {
  lines = (0, _resolveNoBreaks2.default)(lines);
  lines = (0, _resolveForcedScopeBreaks2.default)(lines);
  lines = (0, _resolveDuplicates2.default)(lines);

  // Now we will resolve some newlines where possible. This will affect
  // runs, whereas before we were careful to not affect runs of markers.
  lines = (0, _resolveForcedMarkers2.default)(lines);
  lines = (0, _resolveScopes2.default)(lines, options);
  return (0, _resolveAll2.default)(lines, options);
}

module.exports = resolveLines;