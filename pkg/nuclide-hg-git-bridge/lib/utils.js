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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.getMultiRootFileChanges = getMultiRootFileChanges;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeCollection;

function _load_commonsNodeCollection() {
  return _commonsNodeCollection = require('../../commons-node/collection');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

function getMultiRootFileChanges(fileChanges, rootPaths) {
  var roots = undefined;
  if (rootPaths == null) {
    roots = (0, (_commonsNodeCollection || _load_commonsNodeCollection()).arrayCompact)(atom.project.getDirectories().map(function (directory) {
      var rootPath = directory.getPath();
      var repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(rootPath);
      if (repository == null || repository.getType() !== 'hg') {
        return null;
      }
      return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.ensureTrailingSeparator(rootPath);
    }));
  } else {
    roots = rootPaths.map(function (root) {
      return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.ensureTrailingSeparator(root);
    });
  }

  var sortedFilePaths = Array.from(fileChanges.entries()).sort(function (_ref, _ref3) {
    var _ref2 = _slicedToArray(_ref, 1);

    var filePath1 = _ref2[0];

    var _ref32 = _slicedToArray(_ref3, 1);

    var filePath2 = _ref32[0];
    return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(filePath1).toLowerCase().localeCompare((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(filePath2).toLowerCase());
  });

  var changedRoots = new Map(roots.map(function (root) {
    var rootChanges = new Map(sortedFilePaths.filter(function (_ref4) {
      var _ref42 = _slicedToArray(_ref4, 1);

      var filePath = _ref42[0];
      return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.contains(root, filePath);
    }));
    return [root, rootChanges];
  }));

  return changedRoots;
}