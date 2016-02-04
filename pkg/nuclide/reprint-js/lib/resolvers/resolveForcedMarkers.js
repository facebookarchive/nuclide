

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../constants/markers');

/**
 * This actualizes the forced markers we already have. It's not guaranteed to
 * remove all markers.
 */
function resolveForcedMarkers(lines) {
  return lines.map(function (line) {
    if (line === markers.hardBreak) {
      return '\n';
    } else if (line === markers.multiHardBreak) {
      return '\n';
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
}

module.exports = resolveForcedMarkers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc29sdmVGb3JjZWRNYXJrZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7Ozs7O0FBTWhELFNBQVMsb0JBQW9CLENBQUMsS0FBaUIsRUFBYztBQUMzRCxTQUFPLEtBQUssQ0FDVCxHQUFHLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDWCxRQUFJLElBQUksS0FBSyxPQUFPLENBQUMsU0FBUyxFQUFFO0FBQzlCLGFBQU8sSUFBSSxDQUFDO0tBQ2IsTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsY0FBYyxFQUFFO0FBQzFDLGFBQU8sSUFBSSxDQUFDO0tBQ2IsTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQ2pDLGFBQU8sR0FBRyxDQUFDO0tBQ1osTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQ2pDLGFBQU8sR0FBRyxDQUFDO0tBQ1osTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFO0FBQ2pDLGFBQU8sRUFBRSxDQUFDO0tBQ1gsTUFBTTtBQUNMLGFBQU8sSUFBSSxDQUFDO0tBQ2I7R0FDRixDQUFDLENBQ0QsTUFBTSxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksS0FBSyxFQUFFO0dBQUEsQ0FBQyxDQUFDO0NBQ2hDOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsb0JBQW9CLENBQUMiLCJmaWxlIjoicmVzb2x2ZUZvcmNlZE1hcmtlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBtYXJrZXJzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL21hcmtlcnMnKTtcblxuLyoqXG4gKiBUaGlzIGFjdHVhbGl6ZXMgdGhlIGZvcmNlZCBtYXJrZXJzIHdlIGFscmVhZHkgaGF2ZS4gSXQncyBub3QgZ3VhcmFudGVlZCB0b1xuICogcmVtb3ZlIGFsbCBtYXJrZXJzLlxuICovXG5mdW5jdGlvbiByZXNvbHZlRm9yY2VkTWFya2VycyhsaW5lczogQXJyYXk8YW55Pik6IEFycmF5PGFueT4ge1xuICByZXR1cm4gbGluZXNcbiAgICAubWFwKGxpbmUgPT4ge1xuICAgICAgaWYgKGxpbmUgPT09IG1hcmtlcnMuaGFyZEJyZWFrKSB7XG4gICAgICAgIHJldHVybiAnXFxuJztcbiAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gbWFya2Vycy5tdWx0aUhhcmRCcmVhaykge1xuICAgICAgICByZXR1cm4gJ1xcbic7XG4gICAgICB9IGVsc2UgaWYgKGxpbmUgPT09IG1hcmtlcnMuY29tbWEpIHtcbiAgICAgICAgcmV0dXJuICcsJztcbiAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gbWFya2Vycy5zcGFjZSkge1xuICAgICAgICByZXR1cm4gJyAnO1xuICAgICAgfSBlbHNlIGlmIChsaW5lID09PSBtYXJrZXJzLmVtcHR5KSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgfVxuICAgIH0pXG4gICAgLmZpbHRlcihsaW5lID0+IGxpbmUgIT09ICcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZXNvbHZlRm9yY2VkTWFya2VycztcbiJdfQ==