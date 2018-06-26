'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNamespaceNode = createNamespaceNode;

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('../../../../modules/nuclide-commons/tokenized-text');
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

function createNamespaceNode(name, startPosition) {
  return {
    representativeName: name,
    plainText: name,
    startPosition: startPosition == null ? new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(0, 0) : startPosition,
    children: [],
    kind: 'module',
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).type)(name)]
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */