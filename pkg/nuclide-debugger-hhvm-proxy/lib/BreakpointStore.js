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

var STATUS_STOPPING = _require.STATUS_STOPPING;
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
      return Promise.all(Array.from(this._connections.entries()).map(function (entry) {
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
          case STATUS_STOPPING:
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
//# sourceMappingURL=data:application/json;base64,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QyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLGdCQUFVLENBQUMsUUFBUSxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQzVCLGdCQUFRLE1BQU07QUFDWixlQUFLLGVBQWUsQ0FBQztBQUNyQixlQUFLLGNBQWMsQ0FBQztBQUNwQixlQUFLLFlBQVksQ0FBQztBQUNsQixlQUFLLFVBQVU7QUFDYixrQkFBSyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUFBLFNBQ3RDO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVnQiwyQkFBQyxVQUFzQixFQUFRO0FBQzlDLFVBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDckMsWUFBSSxDQUFDLFlBQVksVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ3RDO0tBQ0Y7OztTQWpIVSxlQUFlIiwiZmlsZSI6IkJyZWFrcG9pbnRTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgdHlwZSB7Q29ubmVjdGlvbn0gZnJvbSAnLi9Db25uZWN0aW9uJztcblxudHlwZSBCcmVha3BvaW50SWQgPSBzdHJpbmc7XG50eXBlIEJyZWFrcG9pbnQgPSB7XG4gIHN0b3JlSWQ6IEJyZWFrcG9pbnRJZDtcbiAgZmlsZW5hbWU6IHN0cmluZztcbiAgbGluZU51bWJlcjogbnVtYmVyO1xufTtcbmV4cG9ydCB0eXBlIEV4Y2VwdGlvblN0YXRlID0gJ25vbmUnIHwgJ3VuY2F1Z2h0JyB8ICdhbGwnO1xuXG5jb25zdCBQQVVTRV9BTExfRVhDRVBUSU9OX05BTUUgPSAnKic7XG5jb25zdCBFWENFUFRJT05fUEFVU0VfU1RBVEVfQUxMID0gJ2FsbCc7XG5cbmNvbnN0IHtcbiAgU1RBVFVTX1NUT1BQSU5HLFxuICBTVEFUVVNfU1RPUFBFRCxcbiAgU1RBVFVTX0VSUk9SLFxuICBTVEFUVVNfRU5ELFxufSA9IHJlcXVpcmUoJy4vRGJncFNvY2tldCcpO1xuXG4vLyBTdG9yZXMgYnJlYWtwb2ludHMgYW5kIGNvbm5lY3Rpb25zLlxuLy9cbi8vIEFkZGVkIGJyZWFrcG9pbnRzIGFyZSBnaXZlbiBhIHVuaXF1ZSBpZCBhbmQgYXJlIGFkZGVkIHRvIGFsbCBhdmFpbGFibGUgY29ubmVjdGlvbnMuXG4vL1xuLy8gQnJlYWtwb2ludHMgbWF5IGJlIGFkZGVkIGJlZm9yZSBhbnkgY29ubmVjdGlvbnMuXG4vL1xuLy8gQ2FyZSBpcyB0YWtlbiB0byBlbnN1cmUgdGhhdCBvcGVyYXRpb25zIGFyZSBhdG9taWMgaW4gdGhlIGZhY2Ugb2YgYXN5bmMgdHVybnMuXG4vLyBTcGVjaWZpY2FsbHksIHJlbW92aW5nIGEgYnJlYWtwb2ludCByZW1vdmVzIGl0IGZyb20gYWxsIGNvbm5lY3Rpb24ncyBtYXBzXG4vLyBiZWZvcmUgcmV0dXJuaW5nLlxuZXhwb3J0IGNsYXNzIEJyZWFrcG9pbnRTdG9yZSB7XG4gIF9icmVha3BvaW50Q291bnQ6IG51bWJlcjtcbiAgLy8gRm9yIGVhY2ggY29ubmVjdGlvbiBhIG1hcCBmcm9tIHRoZSBTdG9yZSdzIEJyZWFrcG9pbnQgSWQgdG8gdGhlXG4gIC8vIFByb21pc2Ugb2YgdGhlIENvbm5lY3Rpb24ncyBCcmVha3BvaW50IElkLlxuICBfY29ubmVjdGlvbnM6IE1hcDxDb25uZWN0aW9uLCBNYXA8QnJlYWtwb2ludElkLCBQcm9taXNlPEJyZWFrcG9pbnRJZD4+PjtcbiAgX2JyZWFrcG9pbnRzOiBNYXA8QnJlYWtwb2ludElkLCBCcmVha3BvaW50PjtcbiAgX3BhdXNlQWxsRXhjZXB0aW9uQnJlYWtwb2ludElkOiA/QnJlYWtwb2ludElkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2JyZWFrcG9pbnRDb3VudCA9IDA7XG4gICAgdGhpcy5fY29ubmVjdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fYnJlYWtwb2ludHMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQgPSBudWxsO1xuICB9XG5cbiAgc2V0QnJlYWtwb2ludChmaWxlbmFtZTogc3RyaW5nLCBsaW5lTnVtYmVyOiBudW1iZXIpOiBCcmVha3BvaW50SWQge1xuICAgIHRoaXMuX2JyZWFrcG9pbnRDb3VudCsrO1xuICAgIGNvbnN0IHN0b3JlSWQgPSBTdHJpbmcodGhpcy5fYnJlYWtwb2ludENvdW50KTtcbiAgICB0aGlzLl9icmVha3BvaW50cy5zZXQoc3RvcmVJZCwge3N0b3JlSWQsIGZpbGVuYW1lLCBsaW5lTnVtYmVyfSk7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLl9jb25uZWN0aW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgIGNvbnN0IFtjb25uZWN0aW9uLCBtYXBdID0gZW50cnk7XG4gICAgICBtYXAuc2V0KHN0b3JlSWQsIGNvbm5lY3Rpb24uc2V0QnJlYWtwb2ludChmaWxlbmFtZSwgbGluZU51bWJlcikpO1xuICAgIH1cbiAgICByZXR1cm4gc3RvcmVJZDtcbiAgfVxuXG4gIGFzeW5jIHJlbW92ZUJyZWFrcG9pbnQoYnJlYWtwb2ludElkOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICB0aGlzLl9icmVha3BvaW50cy5kZWxldGUoYnJlYWtwb2ludElkKTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fcmVtb3ZlQnJlYWtwb2ludEZyb21Db25uZWN0aW9ucyhicmVha3BvaW50SWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE9bamVmZnJleXRhbl06IGxvb2sgaW50byB1bmhhbmRsZWQgZXhjZXB0aW9uIHN1cHBvcnQuXG4gICAqIERiZ3AgcHJvdG9jb2wgZG9lcyBub3Qgc2VlbSB0byBzdXBwb3J0IHVuY2F1Z2h0IGV4Y2VwdGlvbiBoYW5kbGluZ1xuICAgKiBzbyB3ZSBvbmx5IHN1cHBvcnQgJ2FsbCcgYW5kIHRyZWF0IGFsbCBvdGhlciBzdGF0ZXMgYXMgJ25vbmUnLlxuICAgKi9cbiAgYXN5bmMgc2V0UGF1c2VPbkV4Y2VwdGlvbnMoc3RhdGU6IEV4Y2VwdGlvblN0YXRlKTogUHJvbWlzZSB7XG4gICAgaWYgKHN0YXRlID09PSBFWENFUFRJT05fUEFVU0VfU1RBVEVfQUxMKSB7XG4gICAgICB0aGlzLl9icmVha3BvaW50Q291bnQrKztcbiAgICAgIGNvbnN0IGJyZWFrcGlvbnRJZCA9IFN0cmluZyh0aGlzLl9icmVha3BvaW50Q291bnQpO1xuICAgICAgdGhpcy5fcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQgPSBicmVha3Bpb250SWQ7XG5cbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5fY29ubmVjdGlvbnMuZW50cmllcygpKSB7XG4gICAgICAgIGNvbnN0IFtjb25uZWN0aW9uLCBtYXBdID0gZW50cnk7XG4gICAgICAgIG1hcC5zZXQoXG4gICAgICAgICAgYnJlYWtwaW9udElkLFxuICAgICAgICAgIGNvbm5lY3Rpb24uc2V0RXhjZXB0aW9uQnJlYWtwb2ludChQQVVTRV9BTExfRVhDRVBUSU9OX05BTUUpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRyeSB0byByZW1vdmUgYW55IGV4aXN0aW5nIGV4Y2VwdGlvbiBicmVha3BvaW50LlxuICAgICAgYXdhaXQgdGhpcy5fcmVtb3ZlUGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWZOZWVkZWQoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfcmVtb3ZlUGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWZOZWVkZWQoKTogUHJvbWlzZSB7XG4gICAgY29uc3QgYnJlYWtwb2ludElkID0gdGhpcy5fcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQ7XG4gICAgaWYgKGJyZWFrcG9pbnRJZCkge1xuICAgICAgdGhpcy5fcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQgPSBudWxsO1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX3JlbW92ZUJyZWFrcG9pbnRGcm9tQ29ubmVjdGlvbnMoYnJlYWtwb2ludElkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBjYW4gaGFwcGVuIGlmIHVzZXJzIHN3aXRjaCBiZXR3ZWVuICdub25lJyBhbmQgJ3VuY2F1Z2h0JyBzdGF0ZXMuXG4gICAgICBsb2dnZXIubG9nKCdObyBleGNlcHRpb24gYnJlYWtwb2ludCB0byByZW1vdmUuJyk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3JlbW92ZUJyZWFrcG9pbnRGcm9tQ29ubmVjdGlvbnMoYnJlYWtwb2ludElkOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoQXJyYXkuZnJvbSh0aGlzLl9jb25uZWN0aW9ucy5lbnRyaWVzKCkpXG4gICAgICAubWFwKGVudHJ5ID0+IHtcbiAgICAgICAgY29uc3QgW2Nvbm5lY3Rpb24sIG1hcF0gPSBlbnRyeTtcbiAgICAgICAgaWYgKG1hcC5oYXMoYnJlYWtwb2ludElkKSkge1xuICAgICAgICAgIGNvbnN0IGNvbm5lY3Rpb25JZFByb21pc2UgPSBtYXAuZ2V0KGJyZWFrcG9pbnRJZCk7XG4gICAgICAgICAgbWFwLmRlbGV0ZShicmVha3BvaW50SWQpO1xuICAgICAgICAgIC8vIEVuc3VyZSB3ZSd2ZSByZW1vdmVkIGZyb20gdGhlIGNvbm5lY3Rpb24ncyBtYXAgYmVmb3JlIGF3YWl0aW5nLlxuICAgICAgICAgIHJldHVybiAoYXN5bmMgKCkgPT4gY29ubmVjdGlvbi5yZW1vdmVCcmVha3BvaW50KGF3YWl0IGNvbm5lY3Rpb25JZFByb21pc2UpKSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICB9XG5cbiAgYWRkQ29ubmVjdGlvbihjb25uZWN0aW9uOiBDb25uZWN0aW9uKTogdm9pZCB7XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2JyZWFrcG9pbnRzLmZvckVhY2goYnJlYWtwb2ludCA9PiB7XG4gICAgICBtYXAuc2V0KFxuICAgICAgICBicmVha3BvaW50LnN0b3JlSWQsXG4gICAgICAgIGNvbm5lY3Rpb24uc2V0QnJlYWtwb2ludChicmVha3BvaW50LmZpbGVuYW1lLCBicmVha3BvaW50LmxpbmVOdW1iZXIpXG4gICAgICApO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLl9wYXVzZUFsbEV4Y2VwdGlvbkJyZWFrcG9pbnRJZCkge1xuICAgICAgbWFwLnNldChcbiAgICAgICAgdGhpcy5fcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQsXG4gICAgICAgIGNvbm5lY3Rpb24uc2V0RXhjZXB0aW9uQnJlYWtwb2ludChQQVVTRV9BTExfRVhDRVBUSU9OX05BTUUpXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuX2Nvbm5lY3Rpb25zLnNldChjb25uZWN0aW9uLCBtYXApO1xuICAgIGNvbm5lY3Rpb24ub25TdGF0dXMoc3RhdHVzID0+IHtcbiAgICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgIGNhc2UgU1RBVFVTX1NUT1BQSU5HOlxuICAgICAgICBjYXNlIFNUQVRVU19TVE9QUEVEOlxuICAgICAgICBjYXNlIFNUQVRVU19FUlJPUjpcbiAgICAgICAgY2FzZSBTVEFUVVNfRU5EOlxuICAgICAgICAgIHRoaXMuX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfcmVtb3ZlQ29ubmVjdGlvbihjb25uZWN0aW9uOiBDb25uZWN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb25zLmhhcyhjb25uZWN0aW9uKSkge1xuICAgICAgdGhpcy5fY29ubmVjdGlvbnMuZGVsZXRlKGNvbm5lY3Rpb24pO1xuICAgIH1cbiAgfVxufVxuIl19