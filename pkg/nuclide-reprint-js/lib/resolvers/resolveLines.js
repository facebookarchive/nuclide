

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var resolveAll = require('./resolveAll');
var resolveDuplicates = require('./resolveDuplicates');
var resolveForcedMarkers = require('./resolveForcedMarkers');
var resolveForcedScopeBreaks = require('./resolveForcedScopeBreaks');
var resolveNoBreaks = require('./resolveNoBreaks');
var resolveScopes = require('./resolveScopes');

/**
 * After printing the AST parts and all appropriate markers this will join the
 * parts based on options and the markers that are available.
 */
function resolveLines(lines, options) {
  lines = resolveNoBreaks(lines);
  lines = resolveForcedScopeBreaks(lines);
  lines = resolveDuplicates(lines);

  // Now we will resolve some newlines where possible. This will affect
  // runs, whereas before we were careful to not affect runs of markers.
  lines = resolveForcedMarkers(lines);
  lines = resolveScopes(lines, options);
  return resolveAll(lines, options);
}

module.exports = resolveLines;