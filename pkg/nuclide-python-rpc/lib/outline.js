'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.itemsToOutline = itemsToOutline;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('nuclide-commons/tokenized-text');
}

function itemToOutlineTree(mode, item) {
  switch (item.kind) {
    case 'class':
      return classToOutlineTree('all', item);
    case 'function':
      return functionToOutlineTree(item);
    case 'statement':
      return statementToOutlineTree(mode, item);
  }
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

function classToOutlineTree(mode, item) {
  return Object.assign({
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).keyword)('class'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).method)(item.name)],
    representativeName: item.name,
    children: itemsToOutline(mode, item.children)
  }, itemToPositions(item));
}

function functionToOutlineTree(item) {
  return Object.assign({
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).keyword)('def'), (0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '), (0, (_tokenizedText || _load_tokenizedText()).method)(item.name), (0, (_tokenizedText || _load_tokenizedText()).plain)('('), ...argsToText(item.params || []), (0, (_tokenizedText || _load_tokenizedText()).plain)(')')],
    representativeName: item.name,
    children: []
  }, itemToPositions(item));
}

function statementToOutlineTree(mode, item) {
  if (mode === 'none') {
    return null;
  }
  const name = item.name;
  // Only show initialization of constants, which according to python
  // style are all upper case.
  if (mode === 'constants' && name !== name.toUpperCase()) {
    return null;
  }

  return Object.assign({
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).plain)(name)],
    representativeName: name,
    children: []
  }, itemToPositions(item));
}

function argsToText(args) {
  const result = [];

  function startArg() {
    if (result.length > 0) {
      result.push((0, (_tokenizedText || _load_tokenizedText()).plain)(','));
      result.push((0, (_tokenizedText || _load_tokenizedText()).whitespace)(' '));
    }
  }
  args.forEach(arg => {
    startArg();
    if (arg.startsWith('**')) {
      result.push((0, (_tokenizedText || _load_tokenizedText()).plain)('**'));
      result.push((0, (_tokenizedText || _load_tokenizedText()).param)(arg.slice(2)));
    } else if (arg.startsWith('*')) {
      result.push((0, (_tokenizedText || _load_tokenizedText()).plain)('*'));
      result.push((0, (_tokenizedText || _load_tokenizedText()).param)(arg.slice(1)));
    } else {
      result.push((0, (_tokenizedText || _load_tokenizedText()).param)(arg));
    }
  });

  return result;
}

function itemToPositions(item) {
  const { start, end } = item;
  return {
    startPosition: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(start.line - 1, start.column),
    // Outline's endPosition is inclusive, while Jedi's is exclusive.
    // By decrementing the end column, we avoid situations where
    // two items are highlighted at once. End column may end up as -1,
    // which still has the intended effect.
    endPosition: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(end.line - 1, end.column - 1)
  };
}

function itemsToOutline(mode, items) {
  if (!items || items.length === 0) {
    return [];
  }
  const result = [];
  items.map(i => itemToOutlineTree(mode, i)).forEach(tree => {
    if (tree) {
      result.push(tree);
    }
  });
  return result;
}