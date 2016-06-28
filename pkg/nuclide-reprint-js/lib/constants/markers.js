

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// These are special markers that can be used to identify special handling.
//
// TODO: This is not technically correct. Really we should create references
// to unique objects so when we insert a marker it's impossible that it has
// appeared elsewhere in the source. This may make flow types annoying though.
module.exports = {
  // Hard break that must exist here. We are explicit about breaks because we
  // generally want the algorithm to condense lines for us.
  hardBreak: '$$hardBreak$$',

  // This is like a hard break except duplicates will be preserved. Use this if
  // you need multiple line breaks to be preserved.
  multiHardBreak: '$$multiHardBreak$$',

  // Prefix a token with this to indicate that no breaks should happen here.
  // This is stronger than any kind of break, a break will not happen if a
  // noBreak is within the break's contiguous chain of markers.
  noBreak: '$$noBreak$$',

  // These represent groups of soft breaks. A break doesn't have to happen here
  // but whenever we choose to break at a scopeBreak we must also break at
  // all other scopeBreaks within the same scope. (Not child scopes though).
  openScope: '$$openScope$$',
  scopeIndent: '$$scopeIndent$$',
  scopeBreak: '$$scopeBreak$$',
  // This is like scope break but is replaced with a space if not broken.
  scopeSpaceBreak: '$$scopeSpaceBreak$$',
  // Replace this with a comma if the scope is broken.
  scopeComma: '$$scopeComma$$',
  scopeDedent: '$$scopeDedent$$',
  closeScope: '$$closeScope$$',

  // Decrease the indentation after this line.
  dedent: '$$dedent$$',

  // Increase the indentation after this line.
  indent: '$$indent$$',

  // These are necessary to maintain contiguous runs of markers when relevant.
  comma: '$$comma$$',
  space: '$$space$$',
  empty: '$$empty$$'
};