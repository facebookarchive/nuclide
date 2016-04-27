

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../constants/markers');

/**
 * This resolves all markers. We are guaranteed to have a single remaining
 * string after this.
 */
function resolveAll(lines, options) {
  // Resolve everything except for indents and cursor. Note that this expects
  // indentation to already have been taken into account when breaking, just not
  // resolved yet.
  lines = lines.map(function (line) {
    if (line === markers.hardBreak) {
      return '\n';
    } else if (line === markers.multiHardBreak) {
      return '\n';
    } else if (line === markers.noBreak) {
      return '';
    } else if (line === markers.openScope) {
      return '';
    } else if (line === markers.scopeIndent) {
      return '';
    } else if (line === markers.scopeBreak) {
      return '';
    } else if (line === markers.scopeSpaceBreak) {
      return ' ';
    } else if (line === markers.scopeComma) {
      return '';
    } else if (line === markers.scopeDedent) {
      return '';
    } else if (line === markers.closeScope) {
      return '';
    } else if (line === markers.comma) {
      return ',';
    } else if (line === markers.space) {
      return ' ';
    } else if (line === markers.empty) {
      return '';
    } else {
      return line;
    }
  }).filter(function (line) {
    return line !== '';
  });

  var indent = 0;
  var tabString = options.useSpaces ? ' '.repeat(options.tabWidth) : '\t';

  var result = [];
  for (var i = 0; i < lines.length; i++) {
    var end = result.length > 0 ? result[result.length - 1] : null;
    if (lines[i] === markers.indent) {
      indent++;
    } else if (lines[i] === markers.dedent) {
      indent--;
    } else if (end && /\n$/.test(end)) {
      result.push(tabString.repeat(indent) + lines[i]);
    } else {
      result.push(lines[i]);
    }
  }

  return {
    source: clean(result.join(''))
  };
}

/**
 * Consistent way to clean up the final source before returning. This removes
 * trailing whitespace and extra new lines.
 */
function clean(source) {
  // Trim and add an extra new line
  source = source.trim() + '\n';

  // Remove any trailing whitespace on lines. I believe this is necessary due
  // to scopeSpaceBreaks or something. TODO: Make this not necessary...
  source = source.split('\n').map(function (line) {
    return line.replace(/\s*$/, '');
  }).join('\n');

  return source;
}

module.exports = resolveAll;