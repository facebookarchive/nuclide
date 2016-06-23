Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _DbgpSocket2;

function _DbgpSocket() {
  return _DbgpSocket2 = require('./DbgpSocket');
}

var PAUSE_ALL_EXCEPTION_NAME = '*';
var EXCEPTION_PAUSE_STATE_ALL = 'all';

// Stores breakpoints and connections.
//
// Added breakpoints are given a unique id and are added to all available connections.
//
// Breakpoints may be added before any connections.
//
// Care is taken to ensure that operations are atomic in the face of async turns.
// Specifically, removing a breakpoint removes it from all connection's maps
// before returning.

var BreakpointStore = (function () {
  function BreakpointStore() {
    _classCallCheck(this, BreakpointStore);

    this._breakpointCount = 0;
    this._connections = new Map();
    this._breakpoints = new Map();
    this._pauseAllExceptionBreakpointId = null;
  }

  _createClass(BreakpointStore, [{
    key: 'setBreakpoint',
    value: function setBreakpoint(filename, lineNumber) {
      this._breakpointCount++;
      var storeId = String(this._breakpointCount);
      this._breakpoints.set(storeId, { storeId: storeId, filename: filename, lineNumber: lineNumber });
      for (var entry of this._connections.entries()) {
        var _entry = _slicedToArray(entry, 2);

        var connection = _entry[0];
        var map = _entry[1];

        map.set(storeId, connection.setBreakpoint(filename, lineNumber));
      }
      return storeId;
    }
  }, {
    key: 'removeBreakpoint',
    value: _asyncToGenerator(function* (breakpointId) {
      this._breakpoints.delete(breakpointId);
      return yield this._removeBreakpointFromConnections(breakpointId);
    })

    /**
     * TODO[jeffreytan]: look into unhandled exception support.
     * Dbgp protocol does not seem to support uncaught exception handling
     * so we only support 'all' and treat all other states as 'none'.
     */
  }, {
    key: 'setPauseOnExceptions',
    value: _asyncToGenerator(function* (state) {
      if (state === EXCEPTION_PAUSE_STATE_ALL) {
        this._breakpointCount++;
        var breakpiontId = String(this._breakpointCount);
        this._pauseAllExceptionBreakpointId = breakpiontId;

        for (var entry of this._connections.entries()) {
          var _entry2 = _slicedToArray(entry, 2);

          var connection = _entry2[0];
          var map = _entry2[1];

          map.set(breakpiontId, connection.setExceptionBreakpoint(PAUSE_ALL_EXCEPTION_NAME));
        }
      } else {
        // Try to remove any existing exception breakpoint.
        yield this._removePauseAllExceptionBreakpointIfNeeded();
      }
    })
  }, {
    key: '_removePauseAllExceptionBreakpointIfNeeded',
    value: _asyncToGenerator(function* () {
      var breakpointId = this._pauseAllExceptionBreakpointId;
      if (breakpointId) {
        this._pauseAllExceptionBreakpointId = null;
        return yield this._removeBreakpointFromConnections(breakpointId);
      } else {
        // This can happen if users switch between 'none' and 'uncaught' states.
        (_utils2 || _utils()).default.log('No exception breakpoint to remove.');
        return Promise.resolve();
      }
    })
  }, {
    key: '_removeBreakpointFromConnections',
    value: _asyncToGenerator(function* (breakpointId) {
      return Promise.all(Array.from(this._connections.entries()).map(function (entry) {
        var _entry3 = _slicedToArray(entry, 2);

        var connection = _entry3[0];
        var map = _entry3[1];

        if (map.has(breakpointId)) {
          var _ret = (function () {
            var connectionIdPromise = map.get(breakpointId);
            (0, (_assert2 || _assert()).default)(connectionIdPromise != null);
            map.delete(breakpointId);
            // Ensure we've removed from the connection's map before awaiting.
            return {
              v: _asyncToGenerator(function* () {
                return connection.removeBreakpoint((yield connectionIdPromise));
              })()
            };
          })();

          if (typeof _ret === 'object') return _ret.v;
        } else {
          return Promise.resolve();
        }
      }));
    })
  }, {
    key: 'addConnection',
    value: function addConnection(connection) {
      var _this = this;

      var map = new Map();
      this._breakpoints.forEach(function (breakpoint) {
        map.set(breakpoint.storeId, connection.setBreakpoint(breakpoint.filename, breakpoint.lineNumber));
      });
      if (this._pauseAllExceptionBreakpointId) {
        map.set(this._pauseAllExceptionBreakpointId, connection.setExceptionBreakpoint(PAUSE_ALL_EXCEPTION_NAME));
      }

      this._connections.set(connection, map);
      connection.onStatus(function (status) {
        switch (status) {
          case (_DbgpSocket2 || _DbgpSocket()).STATUS_STOPPING:
          case (_DbgpSocket2 || _DbgpSocket()).STATUS_STOPPED:
          case (_DbgpSocket2 || _DbgpSocket()).STATUS_ERROR:
          case (_DbgpSocket2 || _DbgpSocket()).STATUS_END:
            _this._removeConnection(connection);
        }
      });
    }
  }, {
    key: '_removeConnection',
    value: function _removeConnection(connection) {
      if (this._connections.has(connection)) {
        this._connections.delete(connection);
      }
    }
  }]);

  return BreakpointStore;
})();

exports.BreakpointStore = BreakpointStore;

// For each connection a map from the Store's Breakpoint Id to the
// Promise of the Connection's Breakpoint Id.