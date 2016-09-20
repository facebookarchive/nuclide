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

exports.addPath = addPath;
exports.revertPath = revertPath;

var hgActionToPath = _asyncToGenerator(function* (nodePath, actionName, actionDoneMessage, action) {
  if (nodePath == null || nodePath.length === 0) {
    atom.notifications.addError('Cannot ' + actionName + ' an empty path!');
    return;
  }
  var repository = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(nodePath);
  if (repository == null || repository.getType() !== 'hg') {
    atom.notifications.addError('Cannot ' + actionName + ' a non-mercurial repository path');
    return;
  }
  var hgRepositoryAsync = repository.async;
  try {
    yield action(hgRepositoryAsync);
    atom.notifications.addSuccess(actionDoneMessage + ' `' + repository.relativize(nodePath) + '` successfully.');
  } catch (error) {
    atom.notifications.addError('Failed to ' + actionName + ' `' + repository.relativize(nodePath) + '`', { detail: error.message });
  }
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

function addPath(nodePath) {
  return hgActionToPath(nodePath, 'add', 'Added', _asyncToGenerator(function* (hgRepositoryAsync) {
    (0, (_assert2 || _assert()).default)(nodePath);
    (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('hg-repository-add', { nodePath: nodePath });
    yield hgRepositoryAsync.addAll([nodePath]);
  }));
}

function revertPath(nodePath) {
  return hgActionToPath(nodePath, 'revert', 'Reverted', _asyncToGenerator(function* (hgRepositoryAsync) {
    (0, (_assert2 || _assert()).default)(nodePath);
    (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('hg-repository-revert', { nodePath: nodePath });
    yield hgRepositoryAsync.checkoutHead(nodePath);
  }));
}