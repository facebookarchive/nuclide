'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.outlineFromHackIdeOutline = outlineFromHackIdeOutline;

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('nuclide-commons/tokenized-text');
}

var _HackHelpers;

function _load_HackHelpers() {
  return _HackHelpers = require('./HackHelpers');
}

// Note that all line/column values are 1-based.
function outlineFromHackIdeOutline(hackOutline) {
  return {
    outlineTrees: hackOutline.map(outlineFromHackIdeItem)
  };
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

function outlineFromHackIdeItem(hackItem) {
  const tokenizedText = [];

  function addKeyword(value) {
    tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).keyword)(value));
    tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '));
  }

  function addModifiers(modifiers) {
    if (modifiers != null) {
      modifiers.forEach(addKeyword);
    }
  }

  addModifiers(hackItem.modifiers);
  switch (hackItem.kind) {
    case 'typeconst':
      addKeyword('const');
      addKeyword('type');
      break;
    case 'method':
      addKeyword('function');
      break;
    default:
      addKeyword(hackItem.kind);
      break;
  }

  // name
  switch (hackItem.kind) {
    case 'class':
    case 'enum':
    case 'typeconst':
      tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).className)(hackItem.name));
      break;
    default:
      tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).method)(hackItem.name));
      break;
  }

  // params
  const params = hackItem.params;
  if (params != null) {
    tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).plain)('('));
    let first = true;
    for (const param of params) {
      if (!first) {
        tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).plain)(','));
        tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '));
      }
      first = false;
      addModifiers(param.modifiers);
      tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).plain)(param.name));
    }
    tokenizedText.push((0, (_tokenizedText || _load_tokenizedText()).plain)(')'));
  }

  return {
    tokenizedText,
    representativeName: hackItem.name,
    startPosition: (0, (_HackHelpers || _load_HackHelpers()).atomPointFromHack)(hackItem.position.line, hackItem.position.char_start),
    endPosition: (0, (_HackHelpers || _load_HackHelpers()).atomPointFromHack)(hackItem.span.line_end, hackItem.span.char_end),
    children: hackItem.children == null ? [] : hackItem.children.map(outlineFromHackIdeItem)
  };
}