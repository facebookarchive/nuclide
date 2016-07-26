'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Options from '../options/Options';
import type {Output} from '../types/common';

import resolveAll from './resolveAll';
import resolveDuplicates from './resolveDuplicates';
import resolveForcedMarkers from './resolveForcedMarkers';
import resolveForcedScopeBreaks from './resolveForcedScopeBreaks';
import resolveNoBreaks from './resolveNoBreaks';
import resolveScopes from './resolveScopes';

/**
 * After printing the AST parts and all appropriate markers this will join the
 * parts based on options and the markers that are available.
 */
function resolveLines(lines_: Array<any>, options: Options): Output {
  let lines = lines_;
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
