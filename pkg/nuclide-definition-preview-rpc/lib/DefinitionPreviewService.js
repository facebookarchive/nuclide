"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefinitionPreview = getDefinitionPreview;

function _symbolDefinitionPreview() {
  const data = require("../../../modules/nuclide-commons/symbol-definition-preview");

  _symbolDefinitionPreview = function () {
    return data;
  };

  return data;
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
  return (0, _symbolDefinitionPreview().getDefinitionPreview)(definition);
}