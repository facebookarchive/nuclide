'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowIDEConnectionWatcher = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _FlowIDEConnection;

function _load_FlowIDEConnection() {
  return _FlowIDEConnection = require('./FlowIDEConnection');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const defaultIDEConnectionFactory = proc => new (_FlowIDEConnection || _load_FlowIDEConnection()).FlowIDEConnection(proc);

// ESLint thinks the comment at the end is whitespace and warns. Worse, the autofix removes the
// entire comment as well as the whitespace.
// eslint-disable-next-line semi-spacing
const IDE_CONNECTION_MAX_WAIT_MS = 20 /* min */ * 60 /* s/min */ * 1000 /* ms/s */;

// For the lifetime of this class instance, keep a FlowIDEConnection alive, assuming we do not have
// too many failures in a row.
class FlowIDEConnectionWatcher {

  constructor(processFactory, ideConnectionCallback,
  // Can be injected for testing purposes
  ideConnectionFactory = defaultIDEConnectionFactory) {
    this._processFactory = processFactory;
    this._ideConnectionFactory = ideConnectionFactory;
    this._currentIDEConnection = null;
    this._ideConnectionCallback = ideConnectionCallback;
    this._isDisposed = false;
    this._isStarted = false;
  }

  // Returns a promise which resolves when the first connection has been established, or we give up.
  start() {
    if (!this._isStarted) {
      this._isStarted = true;
      return this._makeIDEConnection();
    } else {
      return Promise.resolve();
    }
  }

  _makeIDEConnection() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      let proc = null;
      const endTimeMS = _this._getTimeMS() + IDE_CONNECTION_MAX_WAIT_MS;
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        proc = yield _this._processFactory();
        // dispose() could have been called while we were waiting for the above promise to resolve.
        if (_this._isDisposed) {
          if (proc != null) {
            proc.kill();
          }
          return;
        }
        if (proc != null || _this._getTimeMS() > endTimeMS) {
          break;
        } else {
          (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Failed to start Flow IDE connection... retrying');
        }
      }
      if (proc == null) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Failed to start Flow IDE connection too many times... giving up');
        return;
      }
      const ideConnection = _this._ideConnectionFactory(proc);
      _this._ideConnectionCallback(ideConnection);
      _this._currentIDEConnectionSubscription = ideConnection.onWillDispose(function () {
        _this._ideConnectionCallback(null);
        _this._makeIDEConnection();
      });

      _this._currentIDEConnection = ideConnection;
    })();
  }

  // Split this out just so it's easy to mock
  _getTimeMS() {
    return Date.now();
  }

  dispose() {
    if (!this._isDisposed) {
      this._isDisposed = true;
      if (this._currentIDEConnectionSubscription != null) {
        this._currentIDEConnectionSubscription.dispose();
      }
      if (this._currentIDEConnection != null) {
        this._currentIDEConnection.dispose();
      }
    }
  }
}
exports.FlowIDEConnectionWatcher = FlowIDEConnectionWatcher;