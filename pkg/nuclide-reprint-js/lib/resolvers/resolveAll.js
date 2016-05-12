

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../constants/markers'));
}

/**
 * This resolves all markers. We are guaranteed to have a single remaining
 * string after this.
 */
function resolveAll(lines, options) {
  // Resolve everything except for indents and cursor. Note that this expects
  // indentation to already have been taken into account when breaking, just not
  // resolved yet.
  lines = lines.map(function (line) {
    if (line === (_constantsMarkers2 || _constantsMarkers()).default.hardBreak) {
      return '\n';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.multiHardBreak) {
      return '\n';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.noBreak) {
      return '';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.openScope) {
      return '';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.scopeIndent) {
      return '';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.scopeBreak) {
      return '';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.scopeSpaceBreak) {
      return ' ';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.scopeComma) {
      return '';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.scopeDedent) {
      return '';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.closeScope) {
      return '';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.comma) {
      return ',';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.space) {
      return ' ';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.empty) {
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
    if (lines[i] === (_constantsMarkers2 || _constantsMarkers()).default.indent) {
      indent++;
    } else if (lines[i] === (_constantsMarkers2 || _constantsMarkers()).default.dedent) {
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