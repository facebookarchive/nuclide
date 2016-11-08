'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let hgActionToPath = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (nodePath, actionName, actionDoneMessage, action) {
    if (nodePath == null || nodePath.length === 0) {
      atom.notifications.addError(`Cannot ${ actionName } an empty path!`);
      return;
    }
    const repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(nodePath);
    if (repository == null || repository.getType() !== 'hg') {
      atom.notifications.addError(`Cannot ${ actionName } a non-mercurial repository path`);
      return;
    }
    const hgRepository = repository;
    try {
      yield action(hgRepository);
      atom.notifications.addSuccess(`${ actionDoneMessage } \`${ repository.relativize(nodePath) }\` successfully.`);
    } catch (error) {
      atom.notifications.addError(`Failed to ${ actionName } \`${ repository.relativize(nodePath) }\``, { detail: error.message });
    }
  });

  return function hgActionToPath(_x3, _x4, _x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

exports.addPath = addPath;
exports.revertPath = revertPath;

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addPath(nodePath) {
  return hgActionToPath(nodePath, 'add', 'Added', (() => {
    var _ref = (0, _asyncToGenerator.default)(function* (hgRepository) {
      if (!nodePath) {
        throw new Error('Invariant violation: "nodePath"');
      }

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-repository-add', { nodePath: nodePath });
      yield hgRepository.addAll([nodePath]);
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })());
}

function revertPath(nodePath) {
  return hgActionToPath(nodePath, 'revert', 'Reverted', (() => {
    var _ref2 = (0, _asyncToGenerator.default)(function* (hgRepository) {
      if (!nodePath) {
        throw new Error('Invariant violation: "nodePath"');
      }

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-repository-revert', { nodePath: nodePath });
      yield hgRepository.checkoutHead(nodePath);
    });

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  })());
}