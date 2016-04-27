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

var pythonTextToOutline = _asyncToGenerator(function* (showGlobalVariables, text) {
  try {
    var tree = yield getPythonTree(text);
    return tree == null ? null : treeToOutline(showGlobalVariables, tree);
  } catch (e) {
    logger.error('Exception getting outline: ', e);
    return null;
  }
});

exports.pythonTextToOutline = pythonTextToOutline;

var getPythonTree = _asyncToGenerator(function* (text) {
  var result = yield (0, _nuclideCommons.checkOutput)((0, _config.getPythonPath)(), [_path2['default'].join(__dirname, '../python/outline.py')], { stdin: text });
  if (result.exitCode !== 0) {
    logger.error('Python tree failed to get results: stderr: ' + result.stderr);
    return null;
  }
  return JSON.parse(result.stdout);
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require('atom');

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideTokenizedText = require('../../nuclide-tokenized-text');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nuclideCommons = require('../../nuclide-commons');

var _config = require('./config');

var SHOW_NO_VARIABLES = 'none';
var SHOW_CONSTANTS = 'constants';
var SHOW_ALL_VARIABLES = 'all';

var logger = (0, _nuclideLogging.getLogger)();

function treeToOutline(showGlobalVariables, tree) {
  switch (tree.kind) {
    case 'Module':
      return {
        outlineTrees: treesToOutlineTrees(showGlobalVariables ? SHOW_ALL_VARIABLES : SHOW_CONSTANTS, tree.body)
      };
    default:
      logger.error('Cannot convert python tree kind ' + tree.kind);
      return null;
  }
}

function treesToOutlineTrees(showVariables, trees) {
  return trees.map(function (tree) {
    return treeToOutlineTree(showVariables, tree);
  }).filter(function (outlineTree) {
    return outlineTree != null;
  });
}

function treeToOutlineTree(showVariables, tree) {
  switch (tree.kind) {
    case 'FunctionDef':
      return functionDefToOutline(tree);
    case 'ClassDef':
      return classDefToOutline(tree);
    case 'Assign':
      return assignToOutline(showVariables, tree);
    case 'Expr':
    case 'For':
    case 'If':
    case 'Import':
    case 'ImportFrom':
    case 'Print':
    case 'TryExcept':
      return null;
    default:
      logger.error('Unexpected python outline tree kind ' + tree.kind);
      return null;
  }
}

function assignToOutline(mode, tree) {
  if (mode === SHOW_NO_VARIABLES) {
    return null;
  }
  if (tree.targets.length !== 1) {
    return null;
  }
  var target = tree.targets[0];
  if (target.kind !== 'Name') {
    return null;
  }
  var id = target.id;
  // Only show initialization of constants, which according to python
  // style are all upper case.
  if (mode === SHOW_CONSTANTS && id !== id.toUpperCase()) {
    return null;
  }
  return {
    tokenizedText: [(0, _nuclideTokenizedText.plain)(id)],
    startPosition: treeToPoint(target),
    children: []
  };
}

function classDefToOutline(tree) {
  return {
    tokenizedText: [(0, _nuclideTokenizedText.keyword)('class'), (0, _nuclideTokenizedText.whitespace)(' '), (0, _nuclideTokenizedText.method)(tree.name)],
    startPosition: treeToPoint(tree),
    children: treesToOutlineTrees(SHOW_NO_VARIABLES, tree.body)
  };
}

function functionDefToOutline(tree) {
  return {
    tokenizedText: [(0, _nuclideTokenizedText.keyword)('def'), (0, _nuclideTokenizedText.whitespace)(' '), (0, _nuclideTokenizedText.method)(tree.name), (0, _nuclideTokenizedText.plain)('(')].concat(_toConsumableArray(argsToText(tree.args)), [(0, _nuclideTokenizedText.plain)(')')]),
    startPosition: treeToPoint(tree),
    children: []
  };
}

function argsToText(args) {

  function startArg() {
    if (result.length > 0) {
      result.push((0, _nuclideTokenizedText.plain)(','));
      result.push((0, _nuclideTokenizedText.whitespace)(' '));
    }
  }
  var result = [];
  var vararg = args.vararg;
  if (vararg != null) {
    result.push((0, _nuclideTokenizedText.plain)('*'));
    result.push((0, _nuclideTokenizedText.param)(vararg));
  }
  for (var arg of args.args) {
    startArg();
    result.push((0, _nuclideTokenizedText.param)(arg.id));
  }
  var kwarg = args.kwarg;
  if (kwarg != null) {
    startArg();
    result.push((0, _nuclideTokenizedText.plain)('**'));
    result.push((0, _nuclideTokenizedText.param)(kwarg));
  }
  return result;
}

function treeToPoint(tree) {
  return new _atom.Point(tree.lineno - 1, tree.col_offset);
}