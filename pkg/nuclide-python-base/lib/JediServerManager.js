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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var getServerArgs = _asyncToGenerator(function* (src) {
  var overrides = {};
  try {
    // Override the python path and additional sys paths
    // if override script is present.
    overrides = yield require('./fb/find-jedi-server-args')(src);
  } catch (e) {
    // Ignore.
  }

  return _extends({
    // Default to assuming that python is in system PATH.
    pythonPath: 'python',
    paths: []
  }, overrides);
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lruCache2;

function _lruCache() {
  return _lruCache2 = _interopRequireDefault(require('lru-cache'));
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _JediServer2;

function _JediServer() {
  return _JediServer2 = _interopRequireDefault(require('./JediServer'));
}

var _LinkTreeManager2;

function _LinkTreeManager() {
  return _LinkTreeManager2 = _interopRequireDefault(require('./LinkTreeManager'));
}

var JediServerManager = (function () {
  function JediServerManager() {
    _classCallCheck(this, JediServerManager);

    this._linkTreeManager = new (_LinkTreeManager2 || _LinkTreeManager()).default();
    this._servers = new (_lruCache2 || _lruCache()).default({
      max: 20,
      dispose: function dispose(key, val) {
        val.dispose();
      }
    });
  }

  _createClass(JediServerManager, [{
    key: 'getJediService',
    value: _asyncToGenerator(function* (src) {
      var server = this._servers.get(src);
      if (server == null) {
        var _ref = yield getServerArgs(src);

        var pythonPath = _ref.pythonPath;
        var paths = _ref.paths;

        // Create a JediServer using default python path.
        server = new (_JediServer2 || _JediServer()).default(src, pythonPath, paths);
        this._servers.set(src, server);

        // Add link tree and top-level module paths without awaiting,
        // so we don't block the service from returning.
        this._addLinkTreePaths(src, server);
        this._addTopLevelModulePath(src, server);
      }

      return yield server.getService();
    })
  }, {
    key: '_addLinkTreePaths',
    value: _asyncToGenerator(function* (src, server) {
      var linkTreePaths = yield this._linkTreeManager.getLinkTreePaths(src);
      if (server.isDisposed() || linkTreePaths.length === 0) {
        return;
      }
      var service = yield server.getService();
      yield service.add_paths(linkTreePaths);
    })
  }, {
    key: '_addTopLevelModulePath',
    value: _asyncToGenerator(function* (src, server) {
      // Find the furthest directory while an __init__.py is present, stopping
      // search once a directory does not contain an __init__.py.
      var topLevelModulePath = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findFurthestFile('__init__.py', (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(src), true /* stopOnMissing */
      );
      if (server.isDisposed() || !topLevelModulePath) {
        return;
      }
      var service = yield server.getService();
      yield service.add_paths([topLevelModulePath]);
    })
  }, {
    key: 'reset',
    value: function reset(src) {
      this._servers.del(src);
      this._linkTreeManager.reset(src);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._servers.reset();
      this._linkTreeManager.dispose();
    }
  }]);

  return JediServerManager;
})();

exports.default = JediServerManager;
module.exports = exports.default;