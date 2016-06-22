Object.defineProperty(exports, '__esModule', {
  value: true
});

var fileTreeHasFinishedLoading = _asyncToGenerator(function* () {
  var maxWaitTime = arguments.length <= 0 || arguments[0] === undefined ? 1000 : arguments[0];

  yield (0, (_pollFor2 || _pollFor()).default)(function () {
    var cssSelector = '.nuclide-file-tree .list-tree.has-collapsable-children .loading';
    return document.body.querySelectorAll(cssSelector).length === 0;
  }, 'File tree did not finish loading', maxWaitTime);
});

exports.fileTreeHasFinishedLoading = fileTreeHasFinishedLoading;
exports.getVisibleEntryFromFileTree = getVisibleEntryFromFileTree;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _pollFor2;

function _pollFor() {
  return _pollFor2 = _interopRequireDefault(require('./pollFor'));
}

function getVisibleEntryFromFileTree(name) {
  var cssSelector = '.nuclide-file-tree .list-tree.has-collapsable-children li';
  var elements = Array.prototype.slice.call(document.body.querySelectorAll(cssSelector));
  return elements.find(function (e) {
    return e.innerHTML.indexOf('>' + name + '<') > -1;
  });
}