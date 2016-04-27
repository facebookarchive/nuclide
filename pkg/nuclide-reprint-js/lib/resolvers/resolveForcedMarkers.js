

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