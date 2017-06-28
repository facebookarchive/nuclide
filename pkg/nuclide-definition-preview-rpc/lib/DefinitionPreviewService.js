'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefinitionPreview = getDefinitionPreview;

var _symbolDefinitionPreview;

function _load_symbolDefinitionPreview() {
  return _symbolDefinitionPreview = require('nuclide-commons/symbol-definition-preview');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function getDefinitionPreview(definition) {
  return (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(definition);
}