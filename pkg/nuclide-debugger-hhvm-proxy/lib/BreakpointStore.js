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
//# sourceMappingURL=data:application/json;base64,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RSxHQUFHLENBQUMsQ0FBQztBQUN2QyxnQkFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUM1QixnQkFBUSxNQUFNO0FBQ1osZUFBSyxjQUFjLENBQUM7QUFDcEIsZUFBSyxZQUFZLENBQUM7QUFDbEIsZUFBSyxVQUFVO0FBQ2Isa0JBQUssaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7QUFBQSxTQUN0QztPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFZ0IsMkJBQUMsVUFBc0IsRUFBUTtBQUM5QyxVQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ3JDLFlBQUksQ0FBQyxZQUFZLFVBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUN0QztLQUNGOzs7U0FoSFUsZUFBZSIsImZpbGUiOiJCcmVha3BvaW50U3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHR5cGUge0Nvbm5lY3Rpb259IGZyb20gJy4vQ29ubmVjdGlvbic7XG5cbnR5cGUgQnJlYWtwb2ludElkID0gc3RyaW5nO1xudHlwZSBCcmVha3BvaW50ID0ge1xuICBzdG9yZUlkOiBCcmVha3BvaW50SWQ7XG4gIGZpbGVuYW1lOiBzdHJpbmc7XG4gIGxpbmVOdW1iZXI6IG51bWJlcjtcbn07XG5leHBvcnQgdHlwZSBFeGNlcHRpb25TdGF0ZSA9ICdub25lJyB8ICd1bmNhdWdodCcgfCAnYWxsJztcblxuY29uc3QgUEFVU0VfQUxMX0VYQ0VQVElPTl9OQU1FID0gJyonO1xuY29uc3QgRVhDRVBUSU9OX1BBVVNFX1NUQVRFX0FMTCA9ICdhbGwnO1xuXG5jb25zdCB7XG4gIFNUQVRVU19TVE9QUEVELFxuICBTVEFUVVNfRVJST1IsXG4gIFNUQVRVU19FTkQsXG59ID0gcmVxdWlyZSgnLi9EYmdwU29ja2V0Jyk7XG5cbi8vIFN0b3JlcyBicmVha3BvaW50cyBhbmQgY29ubmVjdGlvbnMuXG4vL1xuLy8gQWRkZWQgYnJlYWtwb2ludHMgYXJlIGdpdmVuIGEgdW5pcXVlIGlkIGFuZCBhcmUgYWRkZWQgdG8gYWxsIGF2YWlsYWJsZSBjb25uZWN0aW9ucy5cbi8vXG4vLyBCcmVha3BvaW50cyBtYXkgYmUgYWRkZWQgYmVmb3JlIGFueSBjb25uZWN0aW9ucy5cbi8vXG4vLyBDYXJlIGlzIHRha2VuIHRvIGVuc3VyZSB0aGF0IG9wZXJhdGlvbnMgYXJlIGF0b21pYyBpbiB0aGUgZmFjZSBvZiBhc3luYyB0dXJucy5cbi8vIFNwZWNpZmljYWxseSwgcmVtb3ZpbmcgYSBicmVha3BvaW50IHJlbW92ZXMgaXQgZnJvbSBhbGwgY29ubmVjdGlvbidzIG1hcHNcbi8vIGJlZm9yZSByZXR1cm5pbmcuXG5leHBvcnQgY2xhc3MgQnJlYWtwb2ludFN0b3JlIHtcbiAgX2JyZWFrcG9pbnRDb3VudDogbnVtYmVyO1xuICAvLyBGb3IgZWFjaCBjb25uZWN0aW9uIGEgbWFwIGZyb20gdGhlIFN0b3JlJ3MgQnJlYWtwb2ludCBJZCB0byB0aGVcbiAgLy8gUHJvbWlzZSBvZiB0aGUgQ29ubmVjdGlvbidzIEJyZWFrcG9pbnQgSWQuXG4gIF9jb25uZWN0aW9uczogTWFwPENvbm5lY3Rpb24sIE1hcDxCcmVha3BvaW50SWQsIFByb21pc2U8QnJlYWtwb2ludElkPj4+O1xuICBfYnJlYWtwb2ludHM6IE1hcDxCcmVha3BvaW50SWQsIEJyZWFrcG9pbnQ+O1xuICBfcGF1c2VBbGxFeGNlcHRpb25CcmVha3BvaW50SWQ6ID9CcmVha3BvaW50SWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fYnJlYWtwb2ludENvdW50ID0gMDtcbiAgICB0aGlzLl9jb25uZWN0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9icmVha3BvaW50cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9wYXVzZUFsbEV4Y2VwdGlvbkJyZWFrcG9pbnRJZCA9IG51bGw7XG4gIH1cblxuICBzZXRCcmVha3BvaW50KGZpbGVuYW1lOiBzdHJpbmcsIGxpbmVOdW1iZXI6IG51bWJlcik6IEJyZWFrcG9pbnRJZCB7XG4gICAgdGhpcy5fYnJlYWtwb2ludENvdW50Kys7XG4gICAgY29uc3Qgc3RvcmVJZCA9IFN0cmluZyh0aGlzLl9icmVha3BvaW50Q291bnQpO1xuICAgIHRoaXMuX2JyZWFrcG9pbnRzLnNldChzdG9yZUlkLCB7c3RvcmVJZCwgZmlsZW5hbWUsIGxpbmVOdW1iZXJ9KTtcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRoaXMuX2Nvbm5lY3Rpb25zLmVudHJpZXMoKSkge1xuICAgICAgY29uc3QgW2Nvbm5lY3Rpb24sIG1hcF0gPSBlbnRyeTtcbiAgICAgIG1hcC5zZXQoc3RvcmVJZCwgY29ubmVjdGlvbi5zZXRCcmVha3BvaW50KGZpbGVuYW1lLCBsaW5lTnVtYmVyKSk7XG4gICAgfVxuICAgIHJldHVybiBzdG9yZUlkO1xuICB9XG5cbiAgYXN5bmMgcmVtb3ZlQnJlYWtwb2ludChicmVha3BvaW50SWQ6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIHRoaXMuX2JyZWFrcG9pbnRzLmRlbGV0ZShicmVha3BvaW50SWQpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLl9yZW1vdmVCcmVha3BvaW50RnJvbUNvbm5lY3Rpb25zKGJyZWFrcG9pbnRJZCk7XG4gIH1cblxuICAvKipcbiAgICogVE9ET1tqZWZmcmV5dGFuXTogbG9vayBpbnRvIHVuaGFuZGxlZCBleGNlcHRpb24gc3VwcG9ydC5cbiAgICogRGJncCBwcm90b2NvbCBkb2VzIG5vdCBzZWVtIHRvIHN1cHBvcnQgdW5jYXVnaHQgZXhjZXB0aW9uIGhhbmRsaW5nXG4gICAqIHNvIHdlIG9ubHkgc3VwcG9ydCAnYWxsJyBhbmQgdHJlYXQgYWxsIG90aGVyIHN0YXRlcyBhcyAnbm9uZScuXG4gICAqL1xuICBhc3luYyBzZXRQYXVzZU9uRXhjZXB0aW9ucyhzdGF0ZTogRXhjZXB0aW9uU3RhdGUpOiBQcm9taXNlIHtcbiAgICBpZiAoc3RhdGUgPT09IEVYQ0VQVElPTl9QQVVTRV9TVEFURV9BTEwpIHtcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRDb3VudCsrO1xuICAgICAgY29uc3QgYnJlYWtwaW9udElkID0gU3RyaW5nKHRoaXMuX2JyZWFrcG9pbnRDb3VudCk7XG4gICAgICB0aGlzLl9wYXVzZUFsbEV4Y2VwdGlvbkJyZWFrcG9pbnRJZCA9IGJyZWFrcGlvbnRJZDtcblxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLl9jb25uZWN0aW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgICAgY29uc3QgW2Nvbm5lY3Rpb24sIG1hcF0gPSBlbnRyeTtcbiAgICAgICAgbWFwLnNldChcbiAgICAgICAgICBicmVha3Bpb250SWQsXG4gICAgICAgICAgY29ubmVjdGlvbi5zZXRFeGNlcHRpb25CcmVha3BvaW50KFBBVVNFX0FMTF9FWENFUFRJT05fTkFNRSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVHJ5IHRvIHJlbW92ZSBhbnkgZXhpc3RpbmcgZXhjZXB0aW9uIGJyZWFrcG9pbnQuXG4gICAgICBhd2FpdCB0aGlzLl9yZW1vdmVQYXVzZUFsbEV4Y2VwdGlvbkJyZWFrcG9pbnRJZk5lZWRlZCgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9yZW1vdmVQYXVzZUFsbEV4Y2VwdGlvbkJyZWFrcG9pbnRJZk5lZWRlZCgpOiBQcm9taXNlIHtcbiAgICBjb25zdCBicmVha3BvaW50SWQgPSB0aGlzLl9wYXVzZUFsbEV4Y2VwdGlvbkJyZWFrcG9pbnRJZDtcbiAgICBpZiAoYnJlYWtwb2ludElkKSB7XG4gICAgICB0aGlzLl9wYXVzZUFsbEV4Y2VwdGlvbkJyZWFrcG9pbnRJZCA9IG51bGw7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5fcmVtb3ZlQnJlYWtwb2ludEZyb21Db25uZWN0aW9ucyhicmVha3BvaW50SWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIGNhbiBoYXBwZW4gaWYgdXNlcnMgc3dpdGNoIGJldHdlZW4gJ25vbmUnIGFuZCAndW5jYXVnaHQnIHN0YXRlcy5cbiAgICAgIGxvZ2dlci5sb2coJ05vIGV4Y2VwdGlvbiBicmVha3BvaW50IHRvIHJlbW92ZS4nKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfcmVtb3ZlQnJlYWtwb2ludEZyb21Db25uZWN0aW9ucyhicmVha3BvaW50SWQ6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChBcnJheS5mcm9tKHRoaXMuX2Nvbm5lY3Rpb25zLmVudHJpZXMoKSlcbiAgICAgIC5tYXAoZW50cnkgPT4ge1xuICAgICAgICBjb25zdCBbY29ubmVjdGlvbiwgbWFwXSA9IGVudHJ5O1xuICAgICAgICBpZiAobWFwLmhhcyhicmVha3BvaW50SWQpKSB7XG4gICAgICAgICAgY29uc3QgY29ubmVjdGlvbklkUHJvbWlzZSA9IG1hcC5nZXQoYnJlYWtwb2ludElkKTtcbiAgICAgICAgICBtYXAuZGVsZXRlKGJyZWFrcG9pbnRJZCk7XG4gICAgICAgICAgLy8gRW5zdXJlIHdlJ3ZlIHJlbW92ZWQgZnJvbSB0aGUgY29ubmVjdGlvbidzIG1hcCBiZWZvcmUgYXdhaXRpbmcuXG4gICAgICAgICAgcmV0dXJuIChhc3luYyAoKSA9PiBjb25uZWN0aW9uLnJlbW92ZUJyZWFrcG9pbnQoYXdhaXQgY29ubmVjdGlvbklkUHJvbWlzZSkpKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gIH1cblxuICBhZGRDb25uZWN0aW9uKGNvbm5lY3Rpb246IENvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fYnJlYWtwb2ludHMuZm9yRWFjaChicmVha3BvaW50ID0+IHtcbiAgICAgIG1hcC5zZXQoXG4gICAgICAgIGJyZWFrcG9pbnQuc3RvcmVJZCxcbiAgICAgICAgY29ubmVjdGlvbi5zZXRCcmVha3BvaW50KGJyZWFrcG9pbnQuZmlsZW5hbWUsIGJyZWFrcG9pbnQubGluZU51bWJlcilcbiAgICAgICk7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMuX3BhdXNlQWxsRXhjZXB0aW9uQnJlYWtwb2ludElkKSB7XG4gICAgICBtYXAuc2V0KFxuICAgICAgICB0aGlzLl9wYXVzZUFsbEV4Y2VwdGlvbkJyZWFrcG9pbnRJZCxcbiAgICAgICAgY29ubmVjdGlvbi5zZXRFeGNlcHRpb25CcmVha3BvaW50KFBBVVNFX0FMTF9FWENFUFRJT05fTkFNRSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5fY29ubmVjdGlvbnMuc2V0KGNvbm5lY3Rpb24sIG1hcCk7XG4gICAgY29ubmVjdGlvbi5vblN0YXR1cyhzdGF0dXMgPT4ge1xuICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgY2FzZSBTVEFUVVNfU1RPUFBFRDpcbiAgICAgICAgY2FzZSBTVEFUVVNfRVJST1I6XG4gICAgICAgIGNhc2UgU1RBVFVTX0VORDpcbiAgICAgICAgICB0aGlzLl9yZW1vdmVDb25uZWN0aW9uKGNvbm5lY3Rpb24pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX3JlbW92ZUNvbm5lY3Rpb24oY29ubmVjdGlvbjogQ29ubmVjdGlvbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jb25uZWN0aW9ucy5oYXMoY29ubmVjdGlvbikpIHtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zLmRlbGV0ZShjb25uZWN0aW9uKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==