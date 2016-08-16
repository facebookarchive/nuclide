

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsFlatten2;

function _utilsFlatten() {
  return _utilsFlatten2 = _interopRequireDefault(require('../../utils/flatten'));
}

var _constantsMarkers2;

function _constantsMarkers() {
  return _constantsMarkers2 = _interopRequireDefault(require('../../constants/markers'));
}

function printTypeofTypeAnnotation(print, node) {
  return (0, (_utilsFlatten2 || _utilsFlatten()).default)(['typeof', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, print(node.argument)]);
}

module.exports = printTypeofTypeAnnotation;