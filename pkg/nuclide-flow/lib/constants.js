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

var JS_GRAMMARS = Object.freeze(['source.js', 'source.js.jsx']);

exports.JS_GRAMMARS = JS_GRAMMARS;
var identifierOrNumber = '[a-zA-Z0-9_$]+';

function makeStrRegex(delimiter) {
  var d = delimiter;
  // Each run of four backslashes ends up as just one backslash. We need to escape once for the
  // string literal here, and once for the RegExp compilation.
  return d + '(\\\\.|[^' + d + '\\\\])*' + d;
}

var strRegexes = ['`', "'", '"'].map(makeStrRegex);

var regexStrings = [].concat(strRegexes, [identifierOrNumber]).map(function (s) {
  return '(' + s + ')';
});

var JAVASCRIPT_WORD_REGEX = new RegExp(regexStrings.join('|'), 'g');

exports.JAVASCRIPT_WORD_REGEX = JAVASCRIPT_WORD_REGEX;
// A simple heuristic for identifier names in JavaScript.
var JAVASCRIPT_IDENTIFIER_REGEX = /[\$_a-zA-Z][\$_\w]*/gi;
exports.JAVASCRIPT_IDENTIFIER_REGEX = JAVASCRIPT_IDENTIFIER_REGEX;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnN0YW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFXTyxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7OztBQUV6RSxJQUFNLGtCQUFrQixHQUFHLGdCQUFnQixDQUFDOztBQUU1QyxTQUFTLFlBQVksQ0FBQyxTQUFpQixFQUFVO0FBQy9DLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQzs7O0FBR3BCLFNBQVUsQ0FBQyxpQkFBWSxDQUFDLGVBQVUsQ0FBQyxDQUFHO0NBQ3ZDOztBQUVELElBQU0sVUFBVSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRXJELElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7ZUFBUSxDQUFDO0NBQUcsQ0FBQyxDQUFDOztBQUU3RSxJQUFNLHFCQUFxQixHQUFHLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Ozs7QUFHdEUsSUFBTSwyQkFBMkIsR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJjb25zdGFudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5leHBvcnQgY29uc3QgSlNfR1JBTU1BUlMgPSBPYmplY3QuZnJlZXplKFsnc291cmNlLmpzJywgJ3NvdXJjZS5qcy5qc3gnXSk7XG5cbmNvbnN0IGlkZW50aWZpZXJPck51bWJlciA9ICdbYS16QS1aMC05XyRdKyc7XG5cbmZ1bmN0aW9uIG1ha2VTdHJSZWdleChkZWxpbWl0ZXI6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGQgPSBkZWxpbWl0ZXI7XG4gIC8vIEVhY2ggcnVuIG9mIGZvdXIgYmFja3NsYXNoZXMgZW5kcyB1cCBhcyBqdXN0IG9uZSBiYWNrc2xhc2guIFdlIG5lZWQgdG8gZXNjYXBlIG9uY2UgZm9yIHRoZVxuICAvLyBzdHJpbmcgbGl0ZXJhbCBoZXJlLCBhbmQgb25jZSBmb3IgdGhlIFJlZ0V4cCBjb21waWxhdGlvbi5cbiAgcmV0dXJuIGAke2R9KFxcXFxcXFxcLnxbXiR7ZH1cXFxcXFxcXF0pKiR7ZH1gO1xufVxuXG5jb25zdCBzdHJSZWdleGVzID0gWydgJywgXCInXCIsICdcIiddLm1hcChtYWtlU3RyUmVnZXgpO1xuXG5jb25zdCByZWdleFN0cmluZ3MgPSBbXS5jb25jYXQoc3RyUmVnZXhlcywgW2lkZW50aWZpZXJPck51bWJlcl0pLm1hcChzID0+IGAoJHtzfSlgKTtcblxuZXhwb3J0IGNvbnN0IEpBVkFTQ1JJUFRfV09SRF9SRUdFWCA9IG5ldyBSZWdFeHAocmVnZXhTdHJpbmdzLmpvaW4oJ3wnKSwgJ2cnKTtcblxuLy8gQSBzaW1wbGUgaGV1cmlzdGljIGZvciBpZGVudGlmaWVyIG5hbWVzIGluIEphdmFTY3JpcHQuXG5leHBvcnQgY29uc3QgSkFWQVNDUklQVF9JREVOVElGSUVSX1JFR0VYID0gL1tcXCRfYS16QS1aXVtcXCRfXFx3XSovZ2k7XG4iXX0=