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

var getOutline = _asyncToGenerator(function* (editor) {
  var path = editor.getPath();
  if (path == null) {
    return null;
  }
  var instance = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('MerlinService', path);
  if (!instance) {
    return null;
  }
  yield instance.pushNewBuffer(path, editor.getText());
  var result = yield instance.outline(path);
  if (!Array.isArray(result)) {
    return null;
  }
  return {
    outlineTrees: convertMerlinOutlines(result)
  };
});

exports.getOutline = getOutline;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeTokenizedText2;

function _commonsNodeTokenizedText() {
  return _commonsNodeTokenizedText2 = require('../../commons-node/tokenizedText');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

function makeTokens(data) {
  var kind = undefined;
  var nameToken = undefined;

  switch (data.kind) {
    case 'Value':
      kind = 'val';
      nameToken = (0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).method)(data.name);
      break;
    case 'Class':
    case 'Exn':
    case 'Module':
      nameToken = (0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).className)(data.name);
      break;
    case 'Constructor':
      kind = 'ctor';
      nameToken = (0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).className)(data.name);
      break;
    case 'Signature':
      kind = 'sig';
      nameToken = (0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).className)(data.name);
      break;
    case 'Type':
      nameToken = (0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).type)(data.name);
      break;
  }
  if (kind == null) {
    kind = data.kind.toLowerCase();
  }
  if (nameToken == null) {
    nameToken = (0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).plain)(data.name);
  }

  return [(0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).keyword)(kind), (0, (_commonsNodeTokenizedText2 || _commonsNodeTokenizedText()).whitespace)(' '), nameToken];
}

function convertMerlinOutlines(outlines) {
  return outlines.reverse().map(function (data) {
    var tokenizedText = makeTokens(data);
    var children = convertMerlinOutlines(data.children);
    var startPosition = new (_atom2 || _atom()).Point(data.start.line - 1, data.start.col);
    var endPosition = new (_atom2 || _atom()).Point(data.end.line - 1, data.end.col);

    return {
      tokenizedText: tokenizedText,
      children: children,
      startPosition: startPosition,
      endPosition: endPosition
    };
  });
}