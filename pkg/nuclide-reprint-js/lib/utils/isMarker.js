function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../constants/markers'));
}

var MARKER_SET = new Set();
Object.keys((_constantsMarkers2 || _constantsMarkers()).default).forEach(function (key) {
  MARKER_SET.add((_constantsMarkers2 || _constantsMarkers()).default[key]);
});

function isMarker(line) {
  return MARKER_SET.has(line);
}

module.exports = isMarker;