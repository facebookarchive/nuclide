

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../constants/markers');

var MARKER_SET = new Set();
Object.keys(markers).forEach(function (key) {
  MARKER_SET.add(markers[key]);
});

function isMarker(line) {
  return MARKER_SET.has(line);
}

module.exports = isMarker;