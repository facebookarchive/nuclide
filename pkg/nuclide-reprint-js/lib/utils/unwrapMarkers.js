function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _flatten = require('./flatten');

var _flatten2 = _interopRequireDefault(_flatten);

var _isMarker = require('./isMarker');

var _isMarker2 = _interopRequireDefault(_isMarker);

/**
 * This utility unwraps contiguous leading and trailing markers from lines and
 * then inserts pre and post before adding the markers back.
 */
function unwrapMarkers(pre, lines, post) {
  var leading = [];
  for (var i = 0; i < lines.length && (0, _isMarker2.default)(lines[i]); i++) {
    leading.push(lines[i]);
  }
  var trailing = [];
  for (var i = lines.length - 1; i >= 0 && (0, _isMarker2.default)(lines[i]); i--) {
    trailing.unshift(lines[i]);
  }
  var middle = [];

  // Everything is a marker... how is that possible?
  if (lines.length === leading.length) {
    leading = [];
    middle = lines;
    trailing = [];
  } else {
    middle = lines.slice(leading.length, lines.length - trailing.length);
  }

  return (0, _flatten2.default)([leading, pre, middle, post, trailing]);
}

module.exports = unwrapMarkers;