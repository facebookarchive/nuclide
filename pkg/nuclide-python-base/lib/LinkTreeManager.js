Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideBuckBase2;

function _nuclideBuckBase() {
  return _nuclideBuckBase2 = require('../../nuclide-buck-base');
}

var BUCK_GEN_PATH = 'buck-out/gen';
var LINK_TREE_SUFFIXES = {
  python_binary: '#link-tree',
  python_unittest: '#binary,link-tree'
};

var LinkTreeManager = (function () {
  function LinkTreeManager() {
    _classCallCheck(this, LinkTreeManager);

    this._cachedBuckProjects = new Map();
    this._cachedLinkTreePaths = new Map();
  }

  _createClass(LinkTreeManager, [{
    key: '_getBuckProject',
    value: _asyncToGenerator(function* (src) {
      var project = this._cachedBuckProjects.get(src);
      if (!project) {
        var buckProjectRoot = yield (_nuclideBuckBase2 || _nuclideBuckBase()).BuckProject.getRootForPath(src);
        if (buckProjectRoot == null) {
          return null;
        }
        project = new (_nuclideBuckBase2 || _nuclideBuckBase()).BuckProject({ rootPath: buckProjectRoot });
        this._cachedBuckProjects.set(src, project);
      }

      return project;
    })
  }, {
    key: '_getBuckTargetForDir',
    value: function _getBuckTargetForDir(dirPath) {
      return '//' + dirPath + ':';
    }
  }, {
    key: '_getDirForBuckTarget',
    value: function _getDirForBuckTarget(target) {
      return target.slice(2).replace(/:/g, '/');
    }
  }, {
    key: '_getDependencies',
    value: _asyncToGenerator(function* (src, basePath, kind) {
      var project = yield this._getBuckProject(src);
      if (!project) {
        return [];
      }

      // Since we're doing string-based comparisons, resolve paths to their
      // real (symlinks followed) paths.
      var realBasePath = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.realpath(basePath);
      var realSrcPath = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.realpath(src);

      var currPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(realSrcPath);

      while ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.contains(realBasePath, currPath)) {
        var relativePath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.relative(realBasePath, currPath);
        if (relativePath === '.' || relativePath === '') {
          break;
        }
        var searchRoot = this._getBuckTargetForDir(relativePath);
        try {
          // Not using Promise.all since we want to break as soon as one query returns
          // a non-empty result, and we don't want concurrent buck queries.
          var results = yield project.query( // eslint-disable-line babel/no-await-in-loop
          'kind(' + kind + ', rdeps(' + searchRoot + ', owner(' + src + ')))');
          if (results.length > 0) {
            return results;
          }
        } catch (e) {
          // Ignore - most likely because the currPath doesn't contain a
          // BUCK/TARGETS file.
        }
        currPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(currPath);
      }

      return [];
    })
  }, {
    key: 'getLinkTreePaths',
    value: _asyncToGenerator(function* (src) {
      var _this = this;

      if (this._cachedLinkTreePaths.has(src)) {
        return this._cachedLinkTreePaths.get(src);
      }
      try {
        var _ret = yield* (function* () {
          var project = yield _this._getBuckProject(src);
          if (!project) {
            _this._cachedLinkTreePaths.set(src, []);
            return {
              v: []
            };
          }
          var basePath = yield project.getPath();

          var kind = 'python_binary';
          var bins = yield _this._getDependencies(src, basePath, kind);
          // Attempt to find a python_unittest target if a python_binary was not found.
          if (bins.length === 0) {
            kind = 'python_unittest';
            bins = yield _this._getDependencies(src, basePath, kind);
          }

          // TODO: once we add link-tree flavor to buck, build the link tree of the
          // first binary.
          var linkTreePaths = bins.map(function (bin) {
            var linkTreeSuffix = LINK_TREE_SUFFIXES[kind];
            var binPath = _this._getDirForBuckTarget(bin);
            return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(basePath, BUCK_GEN_PATH, binPath + linkTreeSuffix);
          });

          _this._cachedLinkTreePaths.set(src, linkTreePaths);
          return {
            v: linkTreePaths
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } catch (e) {
        return [];
      }
    })
  }, {
    key: 'reset',
    value: function reset(src) {
      this._cachedBuckProjects.delete(src);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._cachedBuckProjects.clear();
    }
  }]);

  return LinkTreeManager;
})();

exports.default = LinkTreeManager;
module.exports = exports.default;