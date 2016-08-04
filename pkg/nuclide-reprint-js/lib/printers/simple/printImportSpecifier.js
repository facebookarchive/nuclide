

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

function printImportSpecifier(print, node) {
  // I'm pretty sure it's safe to assume they are both Identifiers, but let's
  // be safe just in case.
  if (node.imported && node.imported.type === 'Identifier' && node.local && node.local.type === 'Identifier' && node.imported.name !== node.local.name) {
    return (0, (_utilsFlatten2 || _utilsFlatten()).default)([print(node.imported), (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, 'as', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space, print(node.local)]);
  } else {
    return (0, (_utilsFlatten2 || _utilsFlatten()).default)(print(node.local));
  }
}

module.exports = printImportSpecifier;