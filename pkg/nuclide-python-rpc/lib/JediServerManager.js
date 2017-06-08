'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getServerArgs = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (src) {
    let overrides = {};
    try {
      // Override the python path and additional sys paths
      // if override script is present.
      // $FlowFB
      const findJediServerArgs = require('./fb/find-jedi-server-args').default;
      overrides = yield findJediServerArgs(src);
    } catch (e) {}
    // Ignore.


    // Append the user's PYTHONPATH if it exists.
    const { PYTHONPATH } = yield (0, (_process || _load_process()).getOriginalEnvironment)();
    if (PYTHONPATH != null && PYTHONPATH.trim() !== '') {
      overrides.paths = (overrides.paths || []).concat((_nuclideUri || _load_nuclideUri()).default.splitPathList(PYTHONPATH));
    }

    return Object.assign({
      // Default to assuming that python is in system PATH.
      pythonPath: 'python',
      paths: []
    }, overrides);
  });

  return function getServerArgs(_x) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _JediServer;

function _load_JediServer() {
  return _JediServer = _interopRequireDefault(require('./JediServer'));
}

var _LinkTreeManager;

function _load_LinkTreeManager() {
  return _LinkTreeManager = _interopRequireDefault(require('./LinkTreeManager'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class JediServerManager {
  // Cache the promises of additional paths to ensure that we never trigger two
  // calls for the same file name from external calls to getLinkTreePaths and
  // getTopLevelModulePath.
  constructor() {
    this._cachedTopLevelModulePaths = new Map();
    this._cachedLinkTreePaths = new Map();

    this._linkTreeManager = new (_LinkTreeManager || _load_LinkTreeManager()).default();
    this._servers = new (_lruCache || _load_lruCache()).default({
      max: 20,
      dispose(key, val) {
        val.dispose();
      }
    });
  }

  getJediService(src) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      let server = _this._servers.get(src);
      if (server == null) {
        const { pythonPath, paths } = yield getServerArgs(src);
        // Create a JediServer using default python path.
        server = new (_JediServer || _load_JediServer()).default(src, pythonPath, paths);
        _this._servers.set(src, server);

        // Add link tree and top-level module paths without awaiting,
        // so we don't block the service from returning.
        _this._addLinkTreePaths(src, server);
        _this._addTopLevelModulePath(src, server);
      }

      return server.getService();
    })();
  }

  getLinkTreePaths(src) {
    let linkTreePathsPromise = this._cachedLinkTreePaths.get(src);
    if (linkTreePathsPromise == null) {
      linkTreePathsPromise = this._linkTreeManager.getLinkTreePaths(src);
      this._cachedLinkTreePaths.set(src, linkTreePathsPromise);
    }

    return Promise.resolve(linkTreePathsPromise);
  }

  getTopLevelModulePath(src) {
    let topLevelModulePathPromise = this._cachedTopLevelModulePaths.get(src);
    // We don't need to explicitly check undefined since the cached promise
    // itself is not nullable, though its content is.
    if (topLevelModulePathPromise == null) {
      // Find the furthest directory while an __init__.py is present, stopping
      // search once a directory does not contain an __init__.py.
      topLevelModulePathPromise = (_fsPromise || _load_fsPromise()).default.findFurthestFile('__init__.py', (_nuclideUri || _load_nuclideUri()).default.dirname(src), true /* stopOnMissing */
      );
      this._cachedTopLevelModulePaths.set(src, topLevelModulePathPromise);
    }

    return Promise.resolve(topLevelModulePathPromise);
  }

  _addLinkTreePaths(src, server) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const linkTreePaths = yield _this2.getLinkTreePaths(src);
      if (server.isDisposed() || linkTreePaths.length === 0) {
        return;
      }
      const service = yield server.getService();
      yield service.add_paths(linkTreePaths);
    })();
  }

  _addTopLevelModulePath(src, server) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const topLevelModulePath = yield _this3.getTopLevelModulePath(src);
      if (server.isDisposed() || !topLevelModulePath) {
        return;
      }
      const service = yield server.getService();
      // Add the parent dir of the top level module path, i.e. the closest
      // directory that does NOT contain __init__.py.
      yield service.add_paths([(_nuclideUri || _load_nuclideUri()).default.dirname(topLevelModulePath)]);
    })();
  }

  reset(src) {
    this._servers.del(src);
    this._linkTreeManager.reset(src);
  }

  dispose() {
    this._servers.reset();
    this._linkTreeManager.dispose();
  }
}
exports.default = JediServerManager;