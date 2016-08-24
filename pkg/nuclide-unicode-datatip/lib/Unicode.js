Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.zeroPaddedHex = zeroPaddedHex;
exports.decodeSurrogateCodePoints = decodeSurrogateCodePoints;
exports.extractCodePoints = extractCodePoints;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var HIGH_SURROGATE_START = 0xD800;
var HIGH_SURROGATE_END = 0xDBFF;
var LOW_SURROGATE_START = 0xDC00;
var LOW_SURROGATE_END = 0xDFFF;

function zeroPaddedHex(codePoint, len) {
  var codePointHex = codePoint.toString(16).toUpperCase();
  var numZeros = Math.max(0, len - codePointHex.length);
  var result = '';
  for (var i = 0; i < numZeros; i++) {
    result += '0';
  }
  result += codePointHex;
  return result;
}

function decodeSurrogateCodePoints(codePoints) {
  var highSurrogate = -1;
  var result = [];
  for (var codePoint of codePoints) {
    if (codePoint >= HIGH_SURROGATE_START && codePoint <= HIGH_SURROGATE_END) {
      if (highSurrogate !== -1) {
        // Double high surrogate
        result.push(highSurrogate);
      }
      highSurrogate = codePoint;
    } else if (codePoint >= LOW_SURROGATE_START && codePoint <= LOW_SURROGATE_END && highSurrogate !== -1) {
      var decoded = 0x10000 + (highSurrogate - HIGH_SURROGATE_START) * 0x400 + (codePoint - LOW_SURROGATE_START);
      result.push(decoded);
      highSurrogate = -1;
    } else {
      if (highSurrogate !== -1) {
        result.push(highSurrogate);
        highSurrogate = -1;
      }
      result.push(codePoint);
    }
  }

  // Dangling high surrogate
  if (highSurrogate !== -1) {
    result.push(highSurrogate);
    highSurrogate = -1;
  }

  return result;
}

function extractCodePoints(word) {
  var escapeRe = /(?:\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{8})|\\u{([0-9a-fA-F]{1,8})}|([a-zA-Z0-9_-]+))/g;
  var result = [];
  var matches = undefined;
  while ((matches = escapeRe.exec(word)) !== null) {
    // Groups 1, 2, and 3 hold hexadecimal code points
    for (var i = 1; i < 4; i++) {
      if (matches[i] != null) {
        result.push(parseInt(matches[i], 16));
        break;
      }
    }
    // Group 4 holds alphanumerics, underscores, and dashes
    if (matches[4] != null) {
      result = result.concat(matches[4].split('').map(function (c) {
        return c.charCodeAt(0);
      }));
    }
  }
  return result;
}