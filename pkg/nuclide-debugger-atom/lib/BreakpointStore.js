var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _Multimap2;

function _Multimap() {
  return _Multimap2 = _interopRequireDefault(require('./Multimap'));
}

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
    this._breakpoints = new (_Multimap2 || _Multimap()).default();
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
        case (_Constants2 || _Constants()).default.Actions.DELETE_BREAKPOINT:
          this._deleteBreakpoint(data.path, data.line);
          break;
        case (_Constants2 || _Constants()).default.Actions.TOGGLE_BREAKPOINT:
          this._toggleBreakpoint(data.path, data.line);
          break;
        default:
          return;
      }
    }
  }, {
    key: '_addBreakpoint',
    value: function _addBreakpoint(path, line) {
      this._breakpoints.set(path, line);
      this._emitter.emit('change', path);
    }
  }, {
    key: '_deleteBreakpoint',
    value: function _deleteBreakpoint(path, line) {
      if (this._breakpoints.delete(path, line)) {
        this._emitter.emit('change', path);
      }
    }
  }, {
    key: '_toggleBreakpoint',
    value: function _toggleBreakpoint(path, line) {
      if (this._breakpoints.hasEntry(path, line)) {
        this._deleteBreakpoint(path, line);
      } else {
        this._addBreakpoint(path, line);
      }
    }
  }, {
    key: 'getBreakpointsForPath',
    value: function getBreakpointsForPath(path) {
      return this._breakpoints.get(path);
    }
  }, {
    key: 'getAllBreakpoints',
    value: function getAllBreakpoints() {
      return this._breakpoints;
    }
  }, {
    key: 'getSerializedBreakpoints',
    value: function getSerializedBreakpoints() {
      var breakpoints = [];
      this._breakpoints.forEach(function (line, sourceURL) {
        breakpoints.push({ line: line, sourceURL: sourceURL });
      });
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
     * Register a change handler that is invoked whenever the store changes.
     */
  }, {
    key: 'onChange',
    value: function onChange(callback) {
      return this._emitter.on('change', callback);
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