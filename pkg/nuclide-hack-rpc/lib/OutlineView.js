"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.outlineFromHackIdeOutline = outlineFromHackIdeOutline;

function _tokenizedText() {
  const data = require("../../../modules/nuclide-commons/tokenized-text");

  _tokenizedText = function () {
    return data;
  };

  return data;
}

function _HackHelpers() {
  const data = require("./HackHelpers");

  _HackHelpers = function () {
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
function outlineFromHackIdeOutline(hackOutline) {
  return {
    outlineTrees: hackOutline.map(outlineFromHackIdeItem)
  };
}

function outlineFromHackIdeItem(hackItem) {
  const tokenizedText = [];

  function addKeyword(value) {
    tokenizedText.push((0, _tokenizedText().keyword)(value));
    tokenizedText.push((0, _tokenizedText().whitespace)(' '));
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
  } // name


  switch (hackItem.kind) {
    case 'class':
    case 'enum':
    case 'typeconst':
      tokenizedText.push((0, _tokenizedText().className)(hackItem.name));
      break;

    default:
      tokenizedText.push((0, _tokenizedText().method)(hackItem.name));
      break;
  } // params


  const params = hackItem.params;

  if (params != null) {
    tokenizedText.push((0, _tokenizedText().plain)('('));
    let first = true;

    for (const param of params) {
      if (!first) {
        tokenizedText.push((0, _tokenizedText().plain)(','));
        tokenizedText.push((0, _tokenizedText().whitespace)(' '));
      }

      first = false;
      addModifiers(param.modifiers);
      tokenizedText.push((0, _tokenizedText().plain)(param.name));
    }

    tokenizedText.push((0, _tokenizedText().plain)(')'));
  }

  return {
    tokenizedText,
    representativeName: hackItem.name,
    startPosition: (0, _HackHelpers().atomPointFromHack)(hackItem.position.line, hackItem.position.char_start),
    endPosition: (0, _HackHelpers().atomPointFromHack)(hackItem.span.line_end, hackItem.span.char_end),
    children: hackItem.children == null ? [] : hackItem.children.map(outlineFromHackIdeItem)
  };
}