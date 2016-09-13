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

/**
 * This actualizes the forced markers we already have. It's not guaranteed to
 * remove all markers.
 */
function resolveForcedMarkers(lines) {
  return lines.map(function (line) {
    if (line === (_constantsMarkers2 || _constantsMarkers()).default.hardBreak) {
      return '\n';
    } else if (line === (_constantsMarkers2 || _constantsMarkers()).default.multiHardBreak) {
      return '\n';
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
}

module.exports = resolveForcedMarkers;