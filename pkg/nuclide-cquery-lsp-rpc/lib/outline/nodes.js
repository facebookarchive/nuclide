"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNamespaceNode = createNamespaceNode;

function _tokenizedText() {
  const data = require("../../../../modules/nuclide-commons/tokenized-text");

  _tokenizedText = function () {
    return data;
  };

  return data;
}

function _simpleTextBuffer() {
  const data = require("simple-text-buffer");

  _simpleTextBuffer = function () {
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
 *  strict-local
 * @format
 */
function createNamespaceNode(name, startPosition) {
  return {
    representativeName: name,
    plainText: name,
    startPosition: startPosition == null ? new (_simpleTextBuffer().Point)(0, 0) : startPosition,
    children: [],
    kind: 'module',
    tokenizedText: [(0, _tokenizedText().type)(name)]
  };
}