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
//# sourceMappingURL=data:application/json;base64,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Jztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7RW1pdHRlcn0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBNdWx0aW1hcCA9IHJlcXVpcmUoJy4vTXVsdGltYXAnKTtcblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZEJyZWFrcG9pbnQgPSB7XG4gIGxpbmU6IG51bWJlcixcbiAgc291cmNlVVJMOiBzdHJpbmcsXG59O1xuXG4vKipcbiAqIFN0b3JlcyB0aGUgY3VycmVudGx5IHNldCBicmVha3BvaW50cyBhcyAocGF0aCwgbGluZSkgcGFpcnMuXG4gKlxuICogTXV0YXRpb25zIHRvIHRoaXMgb2JqZWN0IGZpcmVzIG9mZiBoaWdoIGxldmVsIGV2ZW50cyB0byBsaXN0ZW5lcnMgc3VjaCBhcyBVSVxuICogY29udHJvbGxlcnMsIGdpdmluZyB0aGVtIGEgY2hhbmNlIHRvIHVwZGF0ZS5cbiAqL1xuY2xhc3MgQnJlYWtwb2ludFN0b3JlIHtcbiAgX2JyZWFrcG9pbnRzOiBNdWx0aW1hcDxzdHJpbmcsIG51bWJlcj47XG4gIF9lbWl0dGVyOiBhdG9tJEVtaXR0ZXI7XG5cbiAgY29uc3RydWN0b3IoaW5pdGlhbEJyZWFrcG9pbnRzOiA/QXJyYXk8U2VyaWFsaXplZEJyZWFrcG9pbnQ+KSB7XG4gICAgdGhpcy5fYnJlYWtwb2ludHMgPSBuZXcgTXVsdGltYXAoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICBpZiAoaW5pdGlhbEJyZWFrcG9pbnRzKSB7XG4gICAgICB0aGlzLl9kZXNlcmlhbGl6ZUJyZWFrcG9pbnRzKGluaXRpYWxCcmVha3BvaW50cyk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGFkZEJyZWFrcG9pbnQocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpIHtcbiAgICB0aGlzLl9icmVha3BvaW50cy5zZXQocGF0aCwgbGluZSk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnLCBwYXRoKTtcbiAgfVxuXG4gIGRlbGV0ZUJyZWFrcG9pbnQocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpIHtcbiAgICBpZiAodGhpcy5fYnJlYWtwb2ludHMuZGVsZXRlKHBhdGgsIGxpbmUpKSB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2NoYW5nZScsIHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZUJyZWFrcG9pbnQocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpIHtcbiAgICBpZiAodGhpcy5fYnJlYWtwb2ludHMuaGFzRW50cnkocGF0aCwgbGluZSkpIHtcbiAgICAgIHRoaXMuZGVsZXRlQnJlYWtwb2ludChwYXRoLCBsaW5lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hZGRCcmVha3BvaW50KHBhdGgsIGxpbmUpO1xuICAgIH1cbiAgfVxuXG4gIGdldEJyZWFrcG9pbnRzRm9yUGF0aChwYXRoOiBzdHJpbmcpOiBTZXQ8bnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX2JyZWFrcG9pbnRzLmdldChwYXRoKTtcbiAgfVxuXG4gIGdldEFsbEJyZWFrcG9pbnRzKCk6IE11bHRpbWFwPHN0cmluZywgbnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX2JyZWFrcG9pbnRzO1xuICB9XG5cbiAgZ2V0U2VyaWFsaXplZEJyZWFrcG9pbnRzKCk6IEFycmF5PFNlcmlhbGl6ZWRCcmVha3BvaW50PiB7XG4gICAgY29uc3QgYnJlYWtwb2ludHMgPSBbXTtcbiAgICB0aGlzLl9icmVha3BvaW50cy5mb3JFYWNoKChsaW5lLCBzb3VyY2VVUkwpID0+IHtcbiAgICAgIGJyZWFrcG9pbnRzLnB1c2goe2xpbmUsIHNvdXJjZVVSTH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBicmVha3BvaW50cztcbiAgfVxuXG4gIF9kZXNlcmlhbGl6ZUJyZWFrcG9pbnRzKGJyZWFrcG9pbnRzOiBBcnJheTxTZXJpYWxpemVkQnJlYWtwb2ludD4pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGJyZWFrcG9pbnQgb2YgYnJlYWtwb2ludHMpIHtcbiAgICAgIGNvbnN0IHtsaW5lLCBzb3VyY2VVUkx9ID0gYnJlYWtwb2ludDtcbiAgICAgIHRoaXMuYWRkQnJlYWtwb2ludChzb3VyY2VVUkwsIGxpbmUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGNoYW5nZSBoYW5kbGVyIHRoYXQgaXMgaW52b2tlZCB3aGVuZXZlciB0aGUgc3RvcmUgY2hhbmdlcy5cbiAgICovXG4gIG9uQ2hhbmdlKGNhbGxiYWNrOiAocGF0aDogc3RyaW5nKSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCcmVha3BvaW50U3RvcmU7XG4iXX0=