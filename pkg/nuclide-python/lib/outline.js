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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var generateOutline = _asyncToGenerator(function* (src, contents, mode) {
  var service = yield (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);
  if (!service) {
    return null;
  }

  var result = yield service.getOutline(src, contents);
  if (result == null) {
    return null;
  }

  return {
    outlineTrees: itemsToOutline(mode, result)
  };
});

exports.generateOutline = generateOutline;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideTokenizedText2;

function _nuclideTokenizedText() {
  return _nuclideTokenizedText2 = require('../../nuclide-tokenized-text');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
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
}

function itemsToOutline(mode, items) {
  if (!items || items.length === 0) {
    return [];
  }
  var result = [];
  items.map(function (i) {
    return itemToOutlineTree(mode, i);
  }).forEach(function (tree) {
    if (tree) {
      result.push(tree);
    }
  });
  return result;
}

function classToOutlineTree(mode, item) {
  return _extends({
    tokenizedText: [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).keyword)('class'), (0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).whitespace)(' '), (0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).method)(item.name)],
    representativeName: item.name,
    children: itemsToOutline(mode, item.children)
  }, itemToPositions(item));
}

function functionToOutlineTree(item) {
  return _extends({
    tokenizedText: [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).keyword)('def'), (0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).whitespace)(' '), (0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).method)(item.name), (0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)('(')].concat(_toConsumableArray(argsToText(item.params || [])), [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(')')]),
    representativeName: item.name,
    children: []
  }, itemToPositions(item));
}

function statementToOutlineTree(mode, item) {
  if (mode === 'none') {
    return null;
  }
  var name = item.name;
  // Only show initialization of constants, which according to python
  // style are all upper case.
  if (mode === 'constants' && name !== name.toUpperCase()) {
    return null;
  }

  return _extends({
    tokenizedText: [(0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(name)],
    representativeName: name,
    children: []
  }, itemToPositions(item));
}

function argsToText(args) {
  var result = [];

  function startArg() {
    if (result.length > 0) {
      result.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(','));
      result.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).whitespace)(' '));
    }
  }
  args.forEach(function (arg) {
    startArg();
    if (arg.startsWith('**')) {
      result.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)('**'));
      result.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).param)(arg.slice(2)));
    } else if (arg.startsWith('*')) {
      result.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)('*'));
      result.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).param)(arg.slice(1)));
    } else {
      result.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).param)(arg));
    }
  });

  return result;
}

function itemToPositions(item) {
  var start = item.start;
  var end = item.end;

  return {
    startPosition: new (_atom2 || _atom()).Point(start.line - 1, start.column),
    // Outline's endPosition is inclusive, while Jedi's is exclusive.
    // By decrementing the end column, we avoid situations where
    // two items are highlighted at once. End column may end up as -1,
    // which still has the intended effect.
    endPosition: new (_atom2 || _atom()).Point(end.line - 1, end.column - 1)
  };
}