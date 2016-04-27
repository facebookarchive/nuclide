Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var Emitter = _require.Emitter;

var Multimap = require('./Multimap');

/**
 * Stores the currently set breakpoints as (path, line) pairs.
 *
 * Mutations to this object fires off high level events to listeners such as UI
 * controllers, giving them a chance to update.
 */

var BreakpointStore = (function () {
  function BreakpointStore(initialBreakpoints) {
    _classCallCheck(this, BreakpointStore);

    this._breakpoints = new Multimap();
    this._emitter = new Emitter();
    if (initialBreakpoints) {
      this._deserializeBreakpoints(initialBreakpoints);
    }
  }

  _createClass(BreakpointStore, [{
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
    }
  }, {
    key: 'addBreakpoint',
    value: function addBreakpoint(path, line) {
      this._breakpoints.set(path, line);
      this._emitter.emit('change', path);
    }
  }, {
    key: 'deleteBreakpoint',
    value: function deleteBreakpoint(path, line) {
      if (this._breakpoints['delete'](path, line)) {
        this._emitter.emit('change', path);
      }
    }
  }, {
    key: 'toggleBreakpoint',
    value: function toggleBreakpoint(path, line) {
      if (this._breakpoints.hasEntry(path, line)) {
        this.deleteBreakpoint(path, line);
      } else {
        this.addBreakpoint(path, line);
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
        var _line = breakpoint.line;
        var _sourceURL = breakpoint.sourceURL;

        this.addBreakpoint(_sourceURL, _line);
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
  }]);

  return BreakpointStore;
})();

module.exports = BreakpointStore;