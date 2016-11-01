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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.getMultiRootFileChanges = getMultiRootFileChanges;

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getMultiRootFileChanges(fileChanges, rootPaths) {
  let roots;
  if (rootPaths == null) {
    roots = (0, (_collection || _load_collection()).arrayCompact)(atom.project.getDirectories().map(directory => {
      const rootPath = directory.getPath();
      const repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(rootPath);
      if (repository == null || repository.getType() !== 'hg') {
        return null;
      }
      return (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(rootPath);
    }));
  } else {
    roots = rootPaths.map(root => (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(root));
  }

  const sortedFilePaths = Array.from(fileChanges.entries()).sort((_ref, _ref2) => {
    var _ref4 = _slicedToArray(_ref, 1);

    let filePath1 = _ref4[0];

    var _ref3 = _slicedToArray(_ref2, 1);

    let filePath2 = _ref3[0];
    return (_nuclideUri || _load_nuclideUri()).default.basename(filePath1).toLowerCase().localeCompare((_nuclideUri || _load_nuclideUri()).default.basename(filePath2).toLowerCase());
  });

  const changedRoots = new Map(roots.map(root => {
    const rootChanges = new Map(sortedFilePaths.filter((_ref5) => {
      var _ref6 = _slicedToArray(_ref5, 1);

      let filePath = _ref6[0];
      return (_nuclideUri || _load_nuclideUri()).default.contains(root, filePath);
    }));
    return [root, rootChanges];
  }));

  return changedRoots;
}