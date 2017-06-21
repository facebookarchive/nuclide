'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOutline = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getOutline = exports.getOutline = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (editor) {
    const path = editor.getPath();
    if (path == null) {
      return null;
    }
    const instance = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('MerlinService', path);
    if (!instance) {
      return null;
    }
    yield instance.pushNewBuffer(path, editor.getText());
    const result = yield instance.outline(path);
    if (!Array.isArray(result)) {
      return null;
    }
    return {
      outlineTrees: convertMerlinOutlines(result)
    };
  });

  return function getOutline(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _atom = require('atom');

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('nuclide-commons/tokenized-text');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeTokens(data) {
  let kind;
  let nameToken;

  switch (data.kind) {
    case 'Value':
      kind = 'val';
      nameToken = (0, (_tokenizedText || _load_tokenizedText()).method)(data.name);
      break;
    case 'Class':
    case 'Exn':
    case 'Module':
      nameToken = (0, (_tokenizedText || _load_tokenizedText()).className)(data.name);
      break;
    case 'Constructor':
      kind = 'ctor';
      nameToken = (0, (_tokenizedText || _load_tokenizedText()).className)(data.name);
      break;
    case 'Signature':
      kind = 'sig';
      nameToken = (0, (_tokenizedText || _load_tokenizedText()).className)(data.name);
      break;
    case 'Type':
      nameToken = (0, (_tokenizedText || _load_tokenizedText()).type)(data.name);
      break;
  }
  if (kind == null) {
    kind = data.kind.toLowerCase();
  }
  if (nameToken == null) {
    nameToken = (0, (_tokenizedText || _load_tokenizedText()).plain)(data.name);
  }

  return [(0, (_tokenizedText || _load_tokenizedText()).keyword)(kind), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), nameToken];
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function convertMerlinOutlines(outlines) {
  return outlines.map(data => {
    const tokenizedText = makeTokens(data);
    const children = convertMerlinOutlines(data.children);
    const startPosition = new _atom.Point(data.start.line - 1, data.start.col);
    const endPosition = new _atom.Point(data.end.line - 1, data.end.col);

    return {
      tokenizedText,
      children,
      startPosition,
      endPosition
    };
  }).sort((a, b) => {
    return a.startPosition.compare(b.startPosition);
  });
}