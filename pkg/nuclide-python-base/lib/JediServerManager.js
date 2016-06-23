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

var getPythonPath = _asyncToGenerator(function* () {
  if (pythonPath) {
    return pythonPath;
  }
  // Default to assuming that python is in system PATH.
  pythonPath = 'python';
  try {
    // Override the python path if override script is present.
    var overrides = yield require('./fb/find-jedi-server-args')();
    if (overrides.pythonExecutable) {
      pythonPath = overrides.pythonExecutable;
    }
  } catch (e) {
    // Ignore.
  }
  return pythonPath;
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lruCache2;

function _lruCache() {
  return _lruCache2 = _interopRequireDefault(require('lru-cache'));
}

var _JediServer2;

function _JediServer() {
  return _JediServer2 = _interopRequireDefault(require('./JediServer'));
}

var _LinkTreeManager2;

function _LinkTreeManager() {
  return _LinkTreeManager2 = _interopRequireDefault(require('./LinkTreeManager'));
}

// Cache the pythonPath on first execution so we don't rerun overrides script
// everytime.
var pythonPath = undefined;

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
        // Create a JediServer using default python path.
        server = new (_JediServer2 || _JediServer()).default(src, (yield getPythonPath()));
        this._servers.set(src, server);

        // Add link tree path without awaiting so we don't block the service
        // from returning.
        this._addLinkTreePath(src, server);
      }

      return yield server.getService();
    })
  }, {
    key: '_addLinkTreePath',
    value: _asyncToGenerator(function* (src, server) {
      var linkTreePath = yield this._linkTreeManager.getLinkTreePath(src);
      if (server.isDisposed() || linkTreePath == null) {
        return;
      }
      var service = yield server.getService();
      yield service.add_paths([linkTreePath]);
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