'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideBuckRpc;

function _load_nuclideBuckRpc() {
  return _nuclideBuckRpc = _interopRequireWildcard(require('../../nuclide-buck-rpc'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BUCK_GEN_PATH = 'buck-out/gen'; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       * 
                                       * @format
                                       */

const LINK_TREE_SUFFIXES = {
  python_binary: '#link-tree',
  python_unittest: '#binary,link-tree'
};

class LinkTreeManager {
  _getBuckTargetForDir(dirPath) {
    return `//${dirPath}:`;
  }

  _getDirForBuckTarget(target) {
    return target.slice(2).replace(/:/g, '/');
  }

  _getDependencies(src, basePath, kind) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Since we're doing string-based comparisons, resolve paths to their
      // real (symlinks followed) paths.
      const realBasePath = yield (_fsPromise || _load_fsPromise()).default.realpath(basePath);
      const realSrcPath = yield (_fsPromise || _load_fsPromise()).default.realpath(src);

      let currPath = (_nuclideUri || _load_nuclideUri()).default.dirname(realSrcPath);

      while ((_nuclideUri || _load_nuclideUri()).default.contains(realBasePath, currPath)) {
        const relativePath = (_nuclideUri || _load_nuclideUri()).default.relative(realBasePath, currPath);
        if (relativePath === '.' || relativePath === '') {
          break;
        }
        const searchRoot = _this._getBuckTargetForDir(relativePath);
        try {
          // Not using Promise.all since we want to break as soon as one query returns
          // a non-empty result, and we don't want concurrent buck queries.
          // eslint-disable-next-line no-await-in-loop
          const results = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).query(basePath, `kind(${kind}, rdeps(${searchRoot}, owner(${src})))`);
          if (results.length > 0) {
            return results;
          }
        } catch (e) {
          // Ignore - most likely because the currPath doesn't contain a
          // BUCK/TARGETS file.
        }
        currPath = (_nuclideUri || _load_nuclideUri()).default.dirname(currPath);
      }

      return [];
    })();
  }

  // TODO: memoize this function
  getLinkTreePaths(src) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        const buckRoot = yield (_nuclideBuckRpc || _load_nuclideBuckRpc()).getRootForPath(src);
        if (buckRoot == null) {
          return [];
        }

        let kind = 'python_binary';
        let bins = yield _this2._getDependencies(src, buckRoot, kind);
        // Attempt to find a python_unittest target if a python_binary was not found.
        if (bins.length === 0) {
          kind = 'python_unittest';
          bins = yield _this2._getDependencies(src, buckRoot, kind);
        }

        // TODO: once we add link-tree flavor to buck, build the link tree of the
        // first binary.
        return bins.map(function (bin) {
          const linkTreeSuffix = LINK_TREE_SUFFIXES[kind];
          const binPath = _this2._getDirForBuckTarget(bin);
          return (_nuclideUri || _load_nuclideUri()).default.join(buckRoot, BUCK_GEN_PATH, binPath + linkTreeSuffix);
        });
      } catch (e) {
        return [];
      }
    })();
  }

  reset(src) {}

  dispose() {}
}
exports.default = LinkTreeManager;