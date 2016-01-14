

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
//# sourceMappingURL=data:application/json;base64,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LEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEQsTUFBTTtBQUNMLFlBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkI7R0FDRjs7QUFFRCxTQUFPO0FBQ0wsVUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQy9CLENBQUM7Q0FDSDs7Ozs7O0FBTUQsU0FBUyxLQUFLLENBQUMsTUFBYyxFQUFVOztBQUVyQyxRQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQzs7OztBQUk5QixRQUFNLEdBQUcsTUFBTSxDQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FDWCxHQUFHLENBQUMsVUFBQSxJQUFJO1dBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO0dBQUEsQ0FBQyxDQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWQsU0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJyZXNvbHZlQWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgT3B0aW9ucyBmcm9tICcuLi9vcHRpb25zL09wdGlvbnMnO1xuaW1wb3J0IHR5cGUge091dHB1dH0gZnJvbSAnLi4vdHlwZXMvY29tbW9uJztcblxuY29uc3QgbWFya2VycyA9IHJlcXVpcmUoJy4uL2NvbnN0YW50cy9tYXJrZXJzJyk7XG5cbi8qKlxuICogVGhpcyByZXNvbHZlcyBhbGwgbWFya2Vycy4gV2UgYXJlIGd1YXJhbnRlZWQgdG8gaGF2ZSBhIHNpbmdsZSByZW1haW5pbmdcbiAqIHN0cmluZyBhZnRlciB0aGlzLlxuICovXG5mdW5jdGlvbiByZXNvbHZlQWxsKGxpbmVzOiBBcnJheTxhbnk+LCBvcHRpb25zOiBPcHRpb25zKTogT3V0cHV0IHtcbiAgLy8gUmVzb2x2ZSBldmVyeXRoaW5nIGV4Y2VwdCBmb3IgaW5kZW50cyBhbmQgY3Vyc29yLiBOb3RlIHRoYXQgdGhpcyBleHBlY3RzXG4gIC8vIGluZGVudGF0aW9uIHRvIGFscmVhZHkgaGF2ZSBiZWVuIHRha2VuIGludG8gYWNjb3VudCB3aGVuIGJyZWFraW5nLCBqdXN0IG5vdFxuICAvLyByZXNvbHZlZCB5ZXQuXG4gIGxpbmVzID0gbGluZXNcbiAgICAubWFwKGxpbmUgPT4ge1xuICAgICAgaWYgKGxpbmUgPT09IG1hcmtlcnMuaGFyZEJyZWFrKSB7XG4gICAgICAgIHJldHVybiAnXFxuJztcbiAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gbWFya2Vycy5tdWx0aUhhcmRCcmVhaykge1xuICAgICAgICByZXR1cm4gJ1xcbic7XG4gICAgICB9IGVsc2UgaWYgKGxpbmUgPT09IG1hcmtlcnMubm9CcmVhaykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9IGVsc2UgaWYgKGxpbmUgPT09IG1hcmtlcnMub3BlblNjb3BlKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gbWFya2Vycy5zY29wZUluZGVudCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9IGVsc2UgaWYgKGxpbmUgPT09IG1hcmtlcnMuc2NvcGVCcmVhaykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9IGVsc2UgaWYgKGxpbmUgPT09IG1hcmtlcnMuc2NvcGVTcGFjZUJyZWFrKSB7XG4gICAgICAgIHJldHVybiAnICc7XG4gICAgICB9IGVsc2UgaWYgKGxpbmUgPT09IG1hcmtlcnMuc2NvcGVDb21tYSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9IGVsc2UgaWYgKGxpbmUgPT09IG1hcmtlcnMuc2NvcGVEZWRlbnQpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfSBlbHNlIGlmIChsaW5lID09PSBtYXJrZXJzLmNsb3NlU2NvcGUpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfSBlbHNlIGlmIChsaW5lID09PSBtYXJrZXJzLmNvbW1hKSB7XG4gICAgICAgIHJldHVybiAnLCc7XG4gICAgICB9IGVsc2UgaWYgKGxpbmUgPT09IG1hcmtlcnMuc3BhY2UpIHtcbiAgICAgICAgcmV0dXJuICcgJztcbiAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gbWFya2Vycy5lbXB0eSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbGluZTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5maWx0ZXIobGluZSA9PiBsaW5lICE9PSAnJyk7XG5cbiAgbGV0IGluZGVudCA9IDA7XG4gIGNvbnN0IHRhYlN0cmluZyA9IG9wdGlvbnMudXNlU3BhY2VzID8gJyAnLnJlcGVhdChvcHRpb25zLnRhYldpZHRoKSA6ICdcXHQnO1xuXG4gIGNvbnN0IHJlc3VsdCA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZW5kID0gcmVzdWx0Lmxlbmd0aCA+IDAgPyByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdIDogbnVsbDtcbiAgICBpZiAobGluZXNbaV0gPT09IG1hcmtlcnMuaW5kZW50KSB7XG4gICAgICBpbmRlbnQrKztcbiAgICB9IGVsc2UgaWYgKGxpbmVzW2ldID09PSBtYXJrZXJzLmRlZGVudCkge1xuICAgICAgaW5kZW50LS07XG4gICAgfSBlbHNlIGlmIChlbmQgJiYgL1xcbiQvLnRlc3QoZW5kKSkge1xuICAgICAgcmVzdWx0LnB1c2godGFiU3RyaW5nLnJlcGVhdChpbmRlbnQpICsgbGluZXNbaV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucHVzaChsaW5lc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzb3VyY2U6IGNsZWFuKHJlc3VsdC5qb2luKCcnKSksXG4gIH07XG59XG5cbi8qKlxuICogQ29uc2lzdGVudCB3YXkgdG8gY2xlYW4gdXAgdGhlIGZpbmFsIHNvdXJjZSBiZWZvcmUgcmV0dXJuaW5nLiBUaGlzIHJlbW92ZXNcbiAqIHRyYWlsaW5nIHdoaXRlc3BhY2UgYW5kIGV4dHJhIG5ldyBsaW5lcy5cbiAqL1xuZnVuY3Rpb24gY2xlYW4oc291cmNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBUcmltIGFuZCBhZGQgYW4gZXh0cmEgbmV3IGxpbmVcbiAgc291cmNlID0gc291cmNlLnRyaW0oKSArICdcXG4nO1xuXG4gIC8vIFJlbW92ZSBhbnkgdHJhaWxpbmcgd2hpdGVzcGFjZSBvbiBsaW5lcy4gSSBiZWxpZXZlIHRoaXMgaXMgbmVjZXNzYXJ5IGR1ZVxuICAvLyB0byBzY29wZVNwYWNlQnJlYWtzIG9yIHNvbWV0aGluZy4gVE9ETzogTWFrZSB0aGlzIG5vdCBuZWNlc3NhcnkuLi5cbiAgc291cmNlID0gc291cmNlXG4gICAgLnNwbGl0KCdcXG4nKVxuICAgIC5tYXAobGluZSA9PiBsaW5lLnJlcGxhY2UoL1xccyokLywgJycpKVxuICAgIC5qb2luKCdcXG4nKTtcblxuICByZXR1cm4gc291cmNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc29sdmVBbGw7XG4iXX0=