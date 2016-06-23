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
      return '//' + (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(dirPath) + ':';
    }
  }, {
    key: '_getDirForBuckTarget',
    value: function _getDirForBuckTarget(target) {
      return target.slice(2).replace(/:/g, '/');
    }
  }, {
    key: '_getDependencies',
    value: _asyncToGenerator(function* (src, kind) {
      var project = yield this._getBuckProject(src);
      if (!project) {
        return [];
      }

      var searchRoot = this._getBuckTargetForDir((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(src));

      // TODO: Currently, this attempts to find python_binary targets that are
      // defined in the same directory's BUCK/TARGETS. Once we change how Buck
      // handles global rdeps searches ("//.."), this should search globally.
      return project.query('kind(' + kind + ', rdeps(' + searchRoot + ', owner(' + src + ')))');
    })
  }, {
    key: 'getLinkTreePath',
    value: _asyncToGenerator(function* (src) {
      if (this._cachedLinkTreePaths.has(src)) {
        return this._cachedLinkTreePaths.get(src);
      }
      try {
        var project = yield this._getBuckProject(src);
        if (!project) {
          this._cachedLinkTreePaths.set(src, null);
          return null;
        }

        var kind = 'python_binary';
        var bins = yield this._getDependencies(src, kind);
        // Attempt to find a python_unittest target if a python_binary was not found.
        if (bins.length === 0) {
          kind = 'python_unittest';
          bins = yield this._getDependencies(src, kind);

          if (bins.length === 0) {
            this._cachedLinkTreePaths.set(src, null);
            return null;
          }
        }
        var bin = bins[0];
        var linkTreeSuffix = LINK_TREE_SUFFIXES[kind];

        // TODO: once we add link-tree flavor to buck, build only the link tree here.

        var basePath = yield project.getPath();
        var binPath = this._getDirForBuckTarget(bin);
        var linkTreePath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(basePath, BUCK_GEN_PATH, binPath + linkTreeSuffix);
        this._cachedLinkTreePaths.set(src, linkTreePath);
        return linkTreePath;
      } catch (e) {
        return null;
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