Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.outlineFromHackIdeOutline = outlineFromHackIdeOutline;

var _commonsNodeTokenizedText2;

function _commonsNodeTokenizedText() {
  return _commonsNodeTokenizedText2 = require('../../commons-node/tokenizedText');
}

var _simpleTextBuffer2;

function _simpleTextBuffer() {
  return _simpleTextBuffer2 = require('simple-text-buffer');
}

// Note that all line/column values are 1-based.

function outlineFromHackIdeOutline(hackOutline) {
  return {
    outlineTrees: hackOutline.map(outlineFromHackIdeItem)
  };
}

function outlineFromHackIdeItem(hackItem) {
  var tokenizedText = [];

  function addKeyword(value) {
    tokenizedText.push((0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).keyword)(value));
    tokenizedText.push((0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).whitespace)(' '));
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
      tokenizedText.push((0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).className)(hackItem.name));
      break;
    default:
      tokenizedText.push((0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).method)(hackItem.name));
      break;
  }

  // params
  var params = hackItem.params;
  if (params != null) {
    tokenizedText.push((0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).plain)('('));
    var first = true;
    for (var param of params) {
      if (!first) {
        tokenizedText.push((0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).plain)(','));
        tokenizedText.push((0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).whitespace)(' '));
      }
      first = false;
      addModifiers(param.modifiers);
      tokenizedText.push((0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).plain)(param.name));
    }
    tokenizedText.push((0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).plain)(')'));
  }

  return {
    tokenizedText: tokenizedText,
    representativeName: hackItem.name,
    startPosition: pointFromHack(hackItem.position.line, hackItem.position.char_start),
    endPosition: pointFromHack(hackItem.span.line_end, hackItem.span.char_end),
    children: hackItem.children == null ? [] : hackItem.children.map(outlineFromHackIdeItem)
  };
}

function pointFromHack(hackLine, hackColumn) {
  return new (_simpleTextBuffer2 || _simpleTextBuffer()).Point(hackLine - 1, hackColumn - 1);
}