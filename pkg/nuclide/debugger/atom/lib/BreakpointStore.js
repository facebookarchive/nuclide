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
//# sourceMappingURL=data:application/json;base64,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bCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0VtaXR0ZXJ9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgTXVsdGltYXAgPSByZXF1aXJlKCcuL011bHRpbWFwJyk7XG5cbmV4cG9ydCB0eXBlIFNlcmlhbGl6ZWRCcmVha3BvaW50ID0ge1xuICBsaW5lOiBudW1iZXIsXG4gIHNvdXJjZVVSTDogc3RyaW5nLFxufTtcblxuLyoqXG4gKiBTdG9yZXMgdGhlIGN1cnJlbnRseSBzZXQgYnJlYWtwb2ludHMgYXMgKHBhdGgsIGxpbmUpIHBhaXJzLlxuICpcbiAqIE11dGF0aW9ucyB0byB0aGlzIG9iamVjdCBmaXJlcyBvZmYgaGlnaCBsZXZlbCBldmVudHMgdG8gbGlzdGVuZXJzIHN1Y2ggYXMgVUlcbiAqIGNvbnRyb2xsZXJzLCBnaXZpbmcgdGhlbSBhIGNoYW5jZSB0byB1cGRhdGUuXG4gKi9cbmNsYXNzIEJyZWFrcG9pbnRTdG9yZSB7XG4gIF9icmVha3BvaW50czogTXVsdGltYXA8c3RyaW5nLCBudW1iZXI+O1xuICBfZW1pdHRlcjogYXRvbSRFbWl0dGVyO1xuXG4gIGNvbnN0cnVjdG9yKGluaXRpYWxCcmVha3BvaW50czogP0FycmF5PFNlcmlhbGl6ZWRCcmVha3BvaW50Pikge1xuICAgIHRoaXMuX2JyZWFrcG9pbnRzID0gbmV3IE11bHRpbWFwKCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgaWYgKGluaXRpYWxCcmVha3BvaW50cykge1xuICAgICAgdGhpcy5fZGVzZXJpYWxpemVCcmVha3BvaW50cyhpbml0aWFsQnJlYWtwb2ludHMpO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZW1pdHRlci5kaXNwb3NlKCk7XG4gIH1cblxuICBhZGRCcmVha3BvaW50KHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fYnJlYWtwb2ludHMuc2V0KHBhdGgsIGxpbmUpO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnY2hhbmdlJywgcGF0aCk7XG4gIH1cblxuICBkZWxldGVCcmVha3BvaW50KHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuX2JyZWFrcG9pbnRzLmRlbGV0ZShwYXRoLCBsaW5lKSkge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnLCBwYXRoKTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGVCcmVha3BvaW50KHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuX2JyZWFrcG9pbnRzLmhhc0VudHJ5KHBhdGgsIGxpbmUpKSB7XG4gICAgICB0aGlzLmRlbGV0ZUJyZWFrcG9pbnQocGF0aCwgbGluZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkQnJlYWtwb2ludChwYXRoLCBsaW5lKTtcbiAgICB9XG4gIH1cblxuICBnZXRCcmVha3BvaW50c0ZvclBhdGgocGF0aDogc3RyaW5nKTogU2V0PG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50cy5nZXQocGF0aCk7XG4gIH1cblxuICBnZXRBbGxCcmVha3BvaW50cygpOiBNdWx0aW1hcDxzdHJpbmcsIG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50cztcbiAgfVxuXG4gIGdldFNlcmlhbGl6ZWRCcmVha3BvaW50cygpOiBBcnJheTxTZXJpYWxpemVkQnJlYWtwb2ludD4ge1xuICAgIGNvbnN0IGJyZWFrcG9pbnRzID0gW107XG4gICAgdGhpcy5fYnJlYWtwb2ludHMuZm9yRWFjaCgobGluZSwgc291cmNlVVJMKSA9PiB7XG4gICAgICBicmVha3BvaW50cy5wdXNoKHtsaW5lLCBzb3VyY2VVUkx9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gYnJlYWtwb2ludHM7XG4gIH1cblxuICBfZGVzZXJpYWxpemVCcmVha3BvaW50cyhicmVha3BvaW50czogQXJyYXk8U2VyaWFsaXplZEJyZWFrcG9pbnQ+KTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBicmVha3BvaW50IG9mIGJyZWFrcG9pbnRzKSB7XG4gICAgICBjb25zdCB7bGluZSwgc291cmNlVVJMfSA9IGJyZWFrcG9pbnQ7XG4gICAgICB0aGlzLmFkZEJyZWFrcG9pbnQoc291cmNlVVJMLCBsaW5lKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBjaGFuZ2UgaGFuZGxlciB0aGF0IGlzIGludm9rZWQgd2hlbmV2ZXIgdGhlIHN0b3JlIGNoYW5nZXMuXG4gICAqL1xuICBvbkNoYW5nZShjYWxsYmFjazogKHBhdGg6IHN0cmluZykgPT4gdm9pZCk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2NoYW5nZScsIGNhbGxiYWNrKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyZWFrcG9pbnRTdG9yZTtcbiJdfQ==