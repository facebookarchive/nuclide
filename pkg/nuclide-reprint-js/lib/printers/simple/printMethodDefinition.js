

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

function printMethodDefinition(print, node) {
  var parts = [];

  if (node.static) {
    parts = parts.concat(['static', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space]);
  }

  if (node.kind === 'get') {
    parts = parts.concat(['get', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space]);
  } else if (node.kind === 'set') {
    parts = parts.concat(['set', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space]);
  }

  if (node.value && node.value.async) {
    // The async part of the method declaration lives below on the function
    // expression.... sad times :(
    parts = parts.concat(['async', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, (_constantsMarkers2 || _constantsMarkers()).default.space]);
  }

  if (node.value && node.value.generator) {
    parts = parts.concat(['*', (_constantsMarkers2 || _constantsMarkers()).default.noBreak]);
  }

  var key = node.kind === 'constructor' ? ['constructor'] : print(node.key);

  if (node.computed) {
    parts = parts.concat(['[', (_constantsMarkers2 || _constantsMarkers()).default.noBreak, key, (_constantsMarkers2 || _constantsMarkers()).default.noBreak, ']', (_constantsMarkers2 || _constantsMarkers()).default.noBreak]);
  } else {
    parts = parts.concat([key, (_constantsMarkers2 || _constantsMarkers()).default.noBreak]);
  }

  parts = parts.concat([(_constantsMarkers2 || _constantsMarkers()).default.noBreak, print(node.value), (_constantsMarkers2 || _constantsMarkers()).default.hardBreak]);

  return (0, (_utilsFlatten2 || _utilsFlatten()).default)(parts);
}

module.exports = printMethodDefinition;