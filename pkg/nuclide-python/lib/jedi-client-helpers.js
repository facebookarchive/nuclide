var getCompletions = _asyncToGenerator(function* (editor) {
  var src = editor.getPath();
  if (!src) {
    return null;
  }
  var cursor = editor.getLastCursor();

  var line = cursor.getBufferRow();
  var column = cursor.getBufferColumn();

  var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);
  (0, (_assert2 || _assert()).default)(service);

  return service.getCompletions(src, editor.getText(), line, column);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

module.exports = {
  getCompletions: getCompletions
};