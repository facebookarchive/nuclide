Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var PAUSE_ALL_EXCEPTION_NAME = '*';
var EXCEPTION_PAUSE_STATE_ALL = 'all';

var _require = require('./DbgpSocket');

var STATUS_STOPPED = _require.STATUS_STOPPED;
var STATUS_ERROR = _require.STATUS_ERROR;
var STATUS_END = _require.STATUS_END;

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
      this._breakpoints['delete'](breakpointId);
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
        _utils2['default'].log('No exception breakpoint to remove.');
        return Promise.resolve();
      }
    })
  }, {
    key: '_removeBreakpointFromConnections',
    value: _asyncToGenerator(function* (breakpointId) {
      return Promise.all(require('../../commons').array.from(this._connections.entries()).map(function (entry) {
        var _entry3 = _slicedToArray(entry, 2);

        var connection = _entry3[0];
        var map = _entry3[1];

        if (map.has(breakpointId)) {
          var _ret = (function () {
            var connectionIdPromise = map.get(breakpointId);
            map['delete'](breakpointId);
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
          case STATUS_STOPPED:
          case STATUS_ERROR:
          case STATUS_END:
            _this._removeConnection(connection);
        }
      });
    }
  }, {
    key: '_removeConnection',
    value: function _removeConnection(connection) {
      if (this._connections.has(connection)) {
        this._connections['delete'](connection);
      }
    }
  }]);

  return BreakpointStore;
})();

exports.BreakpointStore = BreakpointStore;

// For each connection a map from the Store's Breakpoint Id to the
// Promise of the Connection's Breakpoint Id.
//# sourceMappingURL=data:application/json;base64,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WSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkMsZ0JBQVUsQ0FBQyxRQUFRLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDNUIsZ0JBQVEsTUFBTTtBQUNaLGVBQUssY0FBYyxDQUFDO0FBQ3BCLGVBQUssWUFBWSxDQUFDO0FBQ2xCLGVBQUssVUFBVTtBQUNiLGtCQUFLLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQUEsU0FDdEM7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRWdCLDJCQUFDLFVBQXNCLEVBQVE7QUFDOUMsVUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNyQyxZQUFJLENBQUMsWUFBWSxVQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDdEM7S0FDRjs7O1NBaEhVLGVBQWUiLCJmaWxlIjoiQnJlYWtwb2ludFN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB0eXBlIHtDb25uZWN0aW9ufSBmcm9tICcuL0Nvbm5lY3Rpb24nO1xuXG50eXBlIEJyZWFrcG9pbnRJZCA9IHN0cmluZztcbnR5cGUgQnJlYWtwb2ludCA9IHtcbiAgc3RvcmVJZDogQnJlYWtwb2ludElkO1xuICBmaWxlbmFtZTogc3RyaW5nO1xuICBsaW5lTnVtYmVyOiBudW1iZXI7XG59O1xuZXhwb3J0IHR5cGUgRXhjZXB0aW9uU3RhdGUgPSAnbm9uZScgfCAndW5jYXVnaHQnIHwgJ2FsbCc7XG5cbmNvbnN0IFBBVVNFX0FMTF9FWENFUFRJT05fTkFNRSA9ICcqJztcbmNvbnN0IEVYQ0VQVElPTl9QQVVTRV9TVEFURV9BTEwgPSAnYWxsJztcblxuY29uc3Qge1xuICBTVEFUVVNfU1RPUFBFRCxcbiAgU1RBVFVTX0VSUk9SLFxuICBTVEFUVVNfRU5ELFxufSA9IHJlcXVpcmUoJy4vRGJncFNvY2tldCcpO1xuXG4vLyBTdG9yZXMgYnJlYWtwb2ludHMgYW5kIGNvbm5lY3Rpb25zLlxuLy9cbi8vIEFkZGVkIGJyZWFrcG9pbnRzIGFyZSBnaXZlbiBhIHVuaXF1ZSBpZCBhbmQgYXJlIGFkZGVkIHRvIGFsbCBhdmFpbGFibGUgY29ubmVjdGlvbnMuXG4vL1xuLy8gQnJlYWtwb2ludHMgbWF5IGJlIGFkZGVkIGJlZm9yZSBhbnkgY29ubmVjdGlvbnMuXG4vL1xuLy8gQ2FyZSBpcyB0YWtlbiB0byBlbnN1cmUgdGhhdCBvcGVyYXRpb25zIGFyZSBhdG9taWMgaW4gdGhlIGZhY2Ugb2YgYXN5bmMgdHVybnMuXG4vLyBTcGVjaWZpY2FsbHksIHJlbW92aW5nIGEgYnJlYWtwb2ludCByZW1vdmVzIGl0IGZyb20gYWxsIGNvbm5lY3Rpb24ncyBtYXBzXG4vLyBiZWZvcmUgcmV0dXJuaW5nLlxuZXhwb3J0IGNsYXNzIEJyZWFrcG9pbnRTdG9yZSB7XG4gIF9icmVha3BvaW50Q291bnQ6IG51bWJlcjtcbiAgLy8gRm9yIGVhY2ggY29ubmVjdGlvbiBhIG1hcCBmcm9tIHRoZSBTdG9yZSdzIEJyZWFrcG9pbnQgSWQgdG8gdGhlXG4gIC8vIFByb21pc2Ugb2YgdGhlIENvbm5lY3Rpb24ncyBCcmVha3BvaW50IElkLlxuICBfY29ubmVjdGlvbnM6IE1hcDxDb25uZWN0aW9uLCBNYXA8QnJlYWtwb2ludElkLCBQcm9taXNlPEJyZWFrcG9pbnRJZD4+PjtcbiAgX2JyZWFrcG9pbnRzOiBNYXA8QnJlYWtwb2ludElkLCBCcmVha3BvaW50PjtcbiAgX3BhdXNlQWxsRXhjZXB0aW9uQnJlYWtwb2ludElkOiA/QnJlYWtwb2ludElkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2JyZWFrcG9pbnRDb3VudCA9IDA7XG4gICAgdGhpcy5fY29ubmVjdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fYnJlYWtwb2ludHMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQgPSBudWxsO1xuICB9XG5cbiAgc2V0QnJlYWtwb2ludChmaWxlbmFtZTogc3RyaW5nLCBsaW5lTnVtYmVyOiBudW1iZXIpOiBCcmVha3BvaW50SWQge1xuICAgIHRoaXMuX2JyZWFrcG9pbnRDb3VudCsrO1xuICAgIGNvbnN0IHN0b3JlSWQgPSBTdHJpbmcodGhpcy5fYnJlYWtwb2ludENvdW50KTtcbiAgICB0aGlzLl9icmVha3BvaW50cy5zZXQoc3RvcmVJZCwge3N0b3JlSWQsIGZpbGVuYW1lLCBsaW5lTnVtYmVyfSk7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLl9jb25uZWN0aW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgIGNvbnN0IFtjb25uZWN0aW9uLCBtYXBdID0gZW50cnk7XG4gICAgICBtYXAuc2V0KHN0b3JlSWQsIGNvbm5lY3Rpb24uc2V0QnJlYWtwb2ludChmaWxlbmFtZSwgbGluZU51bWJlcikpO1xuICAgIH1cbiAgICByZXR1cm4gc3RvcmVJZDtcbiAgfVxuXG4gIGFzeW5jIHJlbW92ZUJyZWFrcG9pbnQoYnJlYWtwb2ludElkOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICB0aGlzLl9icmVha3BvaW50cy5kZWxldGUoYnJlYWtwb2ludElkKTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fcmVtb3ZlQnJlYWtwb2ludEZyb21Db25uZWN0aW9ucyhicmVha3BvaW50SWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE9bamVmZnJleXRhbl06IGxvb2sgaW50byB1bmhhbmRsZWQgZXhjZXB0aW9uIHN1cHBvcnQuXG4gICAqIERiZ3AgcHJvdG9jb2wgZG9lcyBub3Qgc2VlbSB0byBzdXBwb3J0IHVuY2F1Z2h0IGV4Y2VwdGlvbiBoYW5kbGluZ1xuICAgKiBzbyB3ZSBvbmx5IHN1cHBvcnQgJ2FsbCcgYW5kIHRyZWF0IGFsbCBvdGhlciBzdGF0ZXMgYXMgJ25vbmUnLlxuICAgKi9cbiAgYXN5bmMgc2V0UGF1c2VPbkV4Y2VwdGlvbnMoc3RhdGU6IEV4Y2VwdGlvblN0YXRlKTogUHJvbWlzZSB7XG4gICAgaWYgKHN0YXRlID09PSBFWENFUFRJT05fUEFVU0VfU1RBVEVfQUxMKSB7XG4gICAgICB0aGlzLl9icmVha3BvaW50Q291bnQrKztcbiAgICAgIGNvbnN0IGJyZWFrcGlvbnRJZCA9IFN0cmluZyh0aGlzLl9icmVha3BvaW50Q291bnQpO1xuICAgICAgdGhpcy5fcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQgPSBicmVha3Bpb250SWQ7XG5cbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5fY29ubmVjdGlvbnMuZW50cmllcygpKSB7XG4gICAgICAgIGNvbnN0IFtjb25uZWN0aW9uLCBtYXBdID0gZW50cnk7XG4gICAgICAgIG1hcC5zZXQoXG4gICAgICAgICAgYnJlYWtwaW9udElkLFxuICAgICAgICAgIGNvbm5lY3Rpb24uc2V0RXhjZXB0aW9uQnJlYWtwb2ludChQQVVTRV9BTExfRVhDRVBUSU9OX05BTUUpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRyeSB0byByZW1vdmUgYW55IGV4aXN0aW5nIGV4Y2VwdGlvbiBicmVha3BvaW50LlxuICAgICAgYXdhaXQgdGhpcy5fcmVtb3ZlUGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWZOZWVkZWQoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfcmVtb3ZlUGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWZOZWVkZWQoKTogUHJvbWlzZSB7XG4gICAgY29uc3QgYnJlYWtwb2ludElkID0gdGhpcy5fcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQ7XG4gICAgaWYgKGJyZWFrcG9pbnRJZCkge1xuICAgICAgdGhpcy5fcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQgPSBudWxsO1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX3JlbW92ZUJyZWFrcG9pbnRGcm9tQ29ubmVjdGlvbnMoYnJlYWtwb2ludElkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBjYW4gaGFwcGVuIGlmIHVzZXJzIHN3aXRjaCBiZXR3ZWVuICdub25lJyBhbmQgJ3VuY2F1Z2h0JyBzdGF0ZXMuXG4gICAgICBsb2dnZXIubG9nKCdObyBleGNlcHRpb24gYnJlYWtwb2ludCB0byByZW1vdmUuJyk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3JlbW92ZUJyZWFrcG9pbnRGcm9tQ29ubmVjdGlvbnMoYnJlYWtwb2ludElkOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLmFycmF5LmZyb20odGhpcy5fY29ubmVjdGlvbnMuZW50cmllcygpKVxuICAgICAgLm1hcChlbnRyeSA9PiB7XG4gICAgICAgIGNvbnN0IFtjb25uZWN0aW9uLCBtYXBdID0gZW50cnk7XG4gICAgICAgIGlmIChtYXAuaGFzKGJyZWFrcG9pbnRJZCkpIHtcbiAgICAgICAgICBjb25zdCBjb25uZWN0aW9uSWRQcm9taXNlID0gbWFwLmdldChicmVha3BvaW50SWQpO1xuICAgICAgICAgIG1hcC5kZWxldGUoYnJlYWtwb2ludElkKTtcbiAgICAgICAgICAvLyBFbnN1cmUgd2UndmUgcmVtb3ZlZCBmcm9tIHRoZSBjb25uZWN0aW9uJ3MgbWFwIGJlZm9yZSBhd2FpdGluZy5cbiAgICAgICAgICByZXR1cm4gKGFzeW5jICgpID0+IGNvbm5lY3Rpb24ucmVtb3ZlQnJlYWtwb2ludChhd2FpdCBjb25uZWN0aW9uSWRQcm9taXNlKSkoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgfVxuXG4gIGFkZENvbm5lY3Rpb24oY29ubmVjdGlvbjogQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9icmVha3BvaW50cy5mb3JFYWNoKGJyZWFrcG9pbnQgPT4ge1xuICAgICAgbWFwLnNldChcbiAgICAgICAgYnJlYWtwb2ludC5zdG9yZUlkLFxuICAgICAgICBjb25uZWN0aW9uLnNldEJyZWFrcG9pbnQoYnJlYWtwb2ludC5maWxlbmFtZSwgYnJlYWtwb2ludC5saW5lTnVtYmVyKVxuICAgICAgKTtcbiAgICB9KTtcbiAgICBpZiAodGhpcy5fcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQpIHtcbiAgICAgIG1hcC5zZXQoXG4gICAgICAgIHRoaXMuX3BhdXNlQWxsRXhjZXB0aW9uQnJlYWtwb2ludElkLFxuICAgICAgICBjb25uZWN0aW9uLnNldEV4Y2VwdGlvbkJyZWFrcG9pbnQoUEFVU0VfQUxMX0VYQ0VQVElPTl9OQU1FKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb25uZWN0aW9ucy5zZXQoY29ubmVjdGlvbiwgbWFwKTtcbiAgICBjb25uZWN0aW9uLm9uU3RhdHVzKHN0YXR1cyA9PiB7XG4gICAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgICBjYXNlIFNUQVRVU19TVE9QUEVEOlxuICAgICAgICBjYXNlIFNUQVRVU19FUlJPUjpcbiAgICAgICAgY2FzZSBTVEFUVVNfRU5EOlxuICAgICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfcmVtb3ZlQ29ubmVjdGlvbihjb25uZWN0aW9uOiBDb25uZWN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb25zLmhhcyhjb25uZWN0aW9uKSkge1xuICAgICAgdGhpcy5fY29ubmVjdGlvbnMuZGVsZXRlKGNvbm5lY3Rpb24pO1xuICAgIH1cbiAgfVxufVxuIl19