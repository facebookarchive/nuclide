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
  var repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(nodePath);
  if (repository == null || repository.getType() !== 'hg') {
    atom.notifications.addError('Cannot ' + actionName + ' a non-mercurial repository path');
    return;
  }
  var hgRepository = repository;
  try {
    yield action(hgRepository);
    atom.notifications.addSuccess(actionDoneMessage + ' `' + repository.relativize(nodePath) + '` successfully.');
  } catch (error) {
    atom.notifications.addError('Failed to ' + actionName + ' `' + repository.relativize(nodePath) + '`', { detail: error.message });
  }
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function addPath(nodePath) {
  return hgActionToPath(nodePath, 'add', 'Added', _asyncToGenerator(function* (hgRepository) {
    (0, (_assert || _load_assert()).default)(nodePath);
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-repository-add', { nodePath: nodePath });
    yield hgRepository.addAll([nodePath]);
  }));
}

function revertPath(nodePath) {
  return hgActionToPath(nodePath, 'revert', 'Reverted', _asyncToGenerator(function* (hgRepository) {
    (0, (_assert || _load_assert()).default)(nodePath);
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-repository-revert', { nodePath: nodePath });
    yield hgRepository.checkoutHead(nodePath);
  }));
}