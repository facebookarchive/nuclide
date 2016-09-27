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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _atom4;

function _atom3() {
  return _atom4 = require('atom');
}

var _Constants2;

function _Constants() {
  return _Constants2 = _interopRequireDefault(require('./Constants'));
}

var _DebuggerStore2;

function _DebuggerStore() {
  return _DebuggerStore2 = require('./DebuggerStore');
}

var BREAKPOINT_NEED_UI_UPDATE = 'BREAKPOINT_NEED_UI_UPDATE';
var BREAKPOINT_USER_CHANGED = 'breakpoint_user_changed';

var ADDBREAKPOINT_ACTION = 'AddBreakpoint';
var DELETEBREAKPOINT_ACTION = 'DeleteBreakpoint';

/**
 * Stores the currently set breakpoints as (path, line) pairs.
 *
 * Mutations to this object fires off high level events to listeners such as UI
 * controllers, giving them a chance to update.
 */

var BreakpointStore = (function () {
  function BreakpointStore(dispatcher, initialBreakpoints) {
    _classCallCheck(this, BreakpointStore);

    var dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
      dispatcher.unregister(dispatcherToken);
    }));
    this._breakpointIdSeed = 0;
    this._breakpoints = new Map();
    this._idToBreakpointMap = new Map();
    this._emitter = new (_atom4 || _atom3()).Emitter();
    if (initialBreakpoints) {
      this._deserializeBreakpoints(initialBreakpoints);
    }
  }

  _createClass(BreakpointStore, [{
    key: '_handlePayload',
    value: function _handlePayload(payload) {
      var data = payload.data;

      switch (payload.actionType) {
        case (_Constants2 || _Constants()).default.Actions.ADD_BREAKPOINT:
          this._addBreakpoint(data.path, data.line);
          break;
        case (_Constants2 || _Constants()).default.Actions.UPDATE_BREAKPOINT_CONDITION:
          this._updateBreakpointCondition(data.breakpointId, data.condition);
          break;
        case (_Constants2 || _Constants()).default.Actions.UPDATE_BREAKPOINT_ENABLED:
          this._updateBreakpointEnabled(data.breakpointId, data.enabled);
          break;
        case (_Constants2 || _Constants()).default.Actions.DELETE_BREAKPOINT:
          this._deleteBreakpoint(data.path, data.line);
          break;
        case (_Constants2 || _Constants()).default.Actions.DELETE_ALL_BREAKPOINTS:
          this._deleteAllBreakpoints();
          break;
        case (_Constants2 || _Constants()).default.Actions.TOGGLE_BREAKPOINT:
          this._toggleBreakpoint(data.path, data.line);
          break;
        case (_Constants2 || _Constants()).default.Actions.DELETE_BREAKPOINT_IPC:
          this._deleteBreakpoint(data.path, data.line, false);
          break;
        case (_Constants2 || _Constants()).default.Actions.BIND_BREAKPOINT_IPC:
          this._bindBreakpoint(data.path, data.line, data.condition, data.enabled);
          break;
        case (_Constants2 || _Constants()).default.Actions.DEBUGGER_MODE_CHANGE:
          this._handleDebuggerModeChange(data);
          break;
        default:
          return;
      }
    }
  }, {
    key: '_addBreakpoint',
    value: function _addBreakpoint(path, line) {
      var condition = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
      var resolved = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      var userAction = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];
      var enabled = arguments.length <= 5 || arguments[5] === undefined ? true : arguments[5];

      this._breakpointIdSeed++;
      var breakpoint = {
        id: this._breakpointIdSeed,
        path: path,
        line: line,
        condition: condition,
        enabled: enabled,
        resolved: resolved
      };
      this._idToBreakpointMap.set(breakpoint.id, breakpoint);
      if (!this._breakpoints.has(path)) {
        this._breakpoints.set(path, new Map());
      }
      var lineMap = this._breakpoints.get(path);
      (0, (_assert2 || _assert()).default)(lineMap != null);
      lineMap.set(line, breakpoint);
      this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, path);
      if (userAction) {
        this._emitter.emit(BREAKPOINT_USER_CHANGED, {
          action: ADDBREAKPOINT_ACTION,
          breakpoint: breakpoint
        });
      }
    }
  }, {
    key: '_updateBreakpointEnabled',
    value: function _updateBreakpointEnabled(breakpointId, enabled) {
      var breakpoint = this._idToBreakpointMap.get(breakpointId);
      if (breakpoint == null) {
        return;
      }
      breakpoint.enabled = enabled;
      this._updateBreakpoint(breakpoint);
    }
  }, {
    key: '_updateBreakpointCondition',
    value: function _updateBreakpointCondition(breakpointId, condition) {
      var breakpoint = this._idToBreakpointMap.get(breakpointId);
      if (breakpoint == null) {
        return;
      }
      breakpoint.condition = condition;
      this._updateBreakpoint(breakpoint);
    }
  }, {
    key: '_updateBreakpoint',
    value: function _updateBreakpoint(breakpoint) {
      this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, breakpoint.path);
      this._emitter.emit(BREAKPOINT_USER_CHANGED, {
        action: 'UpdateBreakpoint',
        breakpoint: breakpoint
      });
    }
  }, {
    key: '_deleteAllBreakpoints',
    value: function _deleteAllBreakpoints() {
      for (var _path of this._breakpoints.keys()) {
        var lineMap = this._breakpoints.get(_path);
        (0, (_assert2 || _assert()).default)(lineMap != null);
        for (var line of lineMap.keys()) {
          this._deleteBreakpoint(_path, line);
        }
      }
    }
  }, {
    key: '_deleteBreakpoint',
    value: function _deleteBreakpoint(path, line) {
      var userAction = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      var lineMap = this._breakpoints.get(path);
      (0, (_assert2 || _assert()).default)(lineMap != null);
      var breakpoint = lineMap.get(line);
      if (lineMap.delete(line)) {
        (0, (_assert2 || _assert()).default)(breakpoint);
        this._idToBreakpointMap.delete(breakpoint.id);
        this._emitter.emit(BREAKPOINT_NEED_UI_UPDATE, path);
        if (userAction) {
          this._emitter.emit(BREAKPOINT_USER_CHANGED, {
            action: DELETEBREAKPOINT_ACTION,
            breakpoint: breakpoint
          });
        }
      }
    }
  }, {
    key: '_toggleBreakpoint',
    value: function _toggleBreakpoint(path, line) {
      if (!this._breakpoints.has(path)) {
        this._breakpoints.set(path, new Map());
      }
      var lineMap = this._breakpoints.get(path);
      (0, (_assert2 || _assert()).default)(lineMap != null);
      if (lineMap.has(line)) {
        this._deleteBreakpoint(path, line);
      } else {
        this._addBreakpoint(path, line, '');
      }
    }
  }, {
    key: '_bindBreakpoint',
    value: function _bindBreakpoint(path, line, condition, enabled) {
      this._addBreakpoint(path, line, condition, true, // resolved
      false, // userAction
      enabled);
    }
  }, {
    key: '_handleDebuggerModeChange',
    value: function _handleDebuggerModeChange(newMode) {
      if (newMode === (_DebuggerStore2 || _DebuggerStore()).DebuggerMode.STOPPED) {
        // All breakpoints should be unresolved after stop debugging.
        this._resetBreakpointUnresolved();
      }
    }
  }, {
    key: '_resetBreakpointUnresolved',
    value: function _resetBreakpointUnresolved() {
      for (var breakpoint of this.getAllBreakpoints()) {
        breakpoint.resolved = false;
      }
    }
  }, {
    key: 'getBreakpointsForPath',
    value: function getBreakpointsForPath(path) {
      if (!this._breakpoints.has(path)) {
        this._breakpoints.set(path, new Map());
      }
      var ret = this._breakpoints.get(path);
      (0, (_assert2 || _assert()).default)(ret);
      return ret;
    }
  }, {
    key: 'getBreakpointLinesForPath',
    value: function getBreakpointLinesForPath(path) {
      var lineMap = this._breakpoints.get(path);
      return lineMap != null ? new Set(lineMap.keys()) : new Set();
    }
  }, {
    key: 'getBreakpointAtLine',
    value: function getBreakpointAtLine(path, line) {
      var lineMap = this._breakpoints.get(path);
      if (lineMap == null) {
        return;
      }
      return lineMap.get(line);
    }
  }, {
    key: 'getAllBreakpoints',
    value: function getAllBreakpoints() {
      var breakpoints = [];
      for (var _ref3 of this._breakpoints) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var lineMap = _ref2[1];

        for (var breakpoint of lineMap.values()) {
          breakpoints.push(breakpoint);
        }
      }
      return breakpoints;
    }
  }, {
    key: 'getSerializedBreakpoints',
    value: function getSerializedBreakpoints() {
      var breakpoints = [];
      for (var _ref43 of this._breakpoints) {
        var _ref42 = _slicedToArray(_ref43, 2);

        var _path2 = _ref42[0];
        var lineMap = _ref42[1];

        for (var line of lineMap.keys()) {
          // TODO: serialize condition and enabled states.
          breakpoints.push({
            line: line,
            sourceURL: _path2
          });
        }
      }
      return breakpoints;
    }
  }, {
    key: '_deserializeBreakpoints',
    value: function _deserializeBreakpoints(breakpoints) {
      for (var breakpoint of breakpoints) {
        var line = breakpoint.line;
        var sourceURL = breakpoint.sourceURL;

        this._addBreakpoint(sourceURL, line);
      }
    }

    /**
     * Register a change handler that is invoked when the breakpoints UI
     * needs to be updated for a file.
     */
  }, {
    key: 'onNeedUIUpdate',
    value: function onNeedUIUpdate(callback) {
      return this._emitter.on(BREAKPOINT_NEED_UI_UPDATE, callback);
    }

    /**
     * Register a change handler that is invoked when a breakpoint is changed
     * by user action, like user explicitly added, deleted a breakpoint.
     */
  }, {
    key: 'onUserChange',
    value: function onUserChange(callback) {
      return this._emitter.on(BREAKPOINT_USER_CHANGED, callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
      this._disposables.dispose();
    }
  }]);

  return BreakpointStore;
})();

module.exports = BreakpointStore;