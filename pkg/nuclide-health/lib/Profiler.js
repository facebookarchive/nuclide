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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

var Profiler = (function () {
  function Profiler() {
    _classCallCheck(this, Profiler);

    this._keyEditorId = 0;
    this._keyDownTime = 0;
    this._keyLatency = 0;
    this._lastKeyLatency = 0;

    this._keyLatencyHistogram = new (_nuclideAnalytics2 || _nuclideAnalytics()).HistogramTracker('keypress-latency',
    /* maxValue */500,
    /* buckets */25,
    /* intervalSeconds */60);

    this._timeActiveEditorKeys = this._timeActiveEditorKeys.bind(this);
    this._disposeActiveEditorDisposables = this._disposeActiveEditorDisposables.bind(this);

    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable(atom.workspace.onDidStopChangingActivePaneItem(this._timeActiveEditorKeys), atom.workspace.onDidChangeActivePaneItem(this._disposeActiveEditorDisposables));
  }

  // These two functions are to defend against undocumented Node functions.

  _createClass(Profiler, [{
    key: 'dispose',
    value: function dispose() {
      if (this._activeEditorSubscriptions != null) {
        this._activeEditorSubscriptions.dispose();
      }
      this._keyLatencyHistogram.dispose();
    }
  }, {
    key: 'getStats',
    value: function getStats() {
      var stats = process.memoryUsage(); // RSS, heap and usage.

      // FIXME: `getStats()` really shouldn't have side-effects.
      if (this._keyLatency) {
        this._lastKeyLatency = this._keyLatency;
      }

      var activeHandles = getActiveHandles();
      var activeHandlesByType = getActiveHandlesByType(Array.from(activeHandles));

      var result = _extends({}, stats, {
        heapPercentage: 100 * stats.heapUsed / stats.heapTotal, // Just for convenience.
        cpuPercentage: (_os2 || _os()).default.loadavg()[0], // 1 minute CPU average.
        lastKeyLatency: this._lastKeyLatency,
        keyLatency: this._lastKeyLatency,
        activeHandles: activeHandles.length,
        activeRequests: getActiveRequests().length,
        activeHandlesByType: activeHandlesByType
      });

      // We only want to ever record a key latency time once, and so we reset it.
      this._keyLatency = 0;
      return result;
    }
  }, {
    key: '_disposeActiveEditorDisposables',
    value: function _disposeActiveEditorDisposables() {
      // Clear out any events & timing data from previous text editor.
      if (this._activeEditorSubscriptions != null) {
        this._activeEditorSubscriptions.dispose();
        this._activeEditorSubscriptions = null;
      }
    }
  }, {
    key: '_timeActiveEditorKeys',
    value: function _timeActiveEditorKeys() {
      var _this = this;

      this._disposeActiveEditorDisposables();

      // Ensure the editor is valid and there is a view to attach the keypress timing to.
      var editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return;
      }
      var view = atom.views.getView(editor);
      if (!view) {
        return;
      }

      // Start the clock when a key is pressed. Function is named so it can be disposed well.
      var startKeyClock = function startKeyClock() {
        if (editor) {
          _this._keyEditorId = editor.id;
          _this._keyDownTime = Date.now();
        }
      };

      // Stop the clock when the (same) editor has changed content.
      var stopKeyClock = function stopKeyClock() {
        if (editor && editor.id && _this._keyEditorId === editor.id && _this._keyDownTime) {
          _this._keyLatency = Date.now() - _this._keyDownTime;
          if (_this._keyLatencyHistogram != null) {
            _this._keyLatencyHistogram.track(_this._keyLatency);
          }
          // Reset so that subsequent non-key-initiated buffer updates don't produce silly big
          // numbers.
          _this._keyDownTime = 0;
        }
      };

      // Add the listener to keydown.
      view.addEventListener('keydown', startKeyClock);

      this._activeEditorSubscriptions = new (_atom2 || _atom()).CompositeDisposable(
      // Remove the listener in a home-made disposable for when this editor is no-longer active.
      new (_atom2 || _atom()).Disposable(function () {
        return view.removeEventListener('keydown', startKeyClock);
      }),

      // stopKeyClock is fast so attaching it to onDidChange here is OK. onDidStopChanging would be
      // another option - any cost is deferred, but with far less fidelity.
      editor.onDidChange(stopKeyClock));
    }
  }]);

  return Profiler;
})();

exports.Profiler = Profiler;
function getActiveHandles() {
  if (process._getActiveHandles) {
    return process._getActiveHandles();
  }
  return [];
}

function getActiveHandlesByType(handles) {
  var activeHandlesByType = {
    childprocess: [],
    tlssocket: [],
    other: []
  };
  getTopLevelHandles(handles).filter(function (handle) {
    var type = handle.constructor.name.toLowerCase();
    if (type !== 'childprocess' && type !== 'tlssocket') {
      type = 'other';
    }
    activeHandlesByType[type].push(handle);
  });
  return activeHandlesByType;
}

// Returns a list of handles which are not children of others (i.e. sockets as process pipes).
function getTopLevelHandles(handles) {
  var topLevelHandles = [];
  var seen = new Set();
  handles.forEach(function (handle) {
    if (seen.has(handle)) {
      return;
    }
    seen.add(handle);
    topLevelHandles.push(handle);
    if (handle.constructor.name === 'ChildProcess') {
      seen.add(handle);
      ['stdin', 'stdout', 'stderr', '_channel'].forEach(function (pipe) {
        if (handle[pipe]) {
          seen.add(handle[pipe]);
        }
      });
    }
  });
  return topLevelHandles;
}

function getActiveRequests() {
  if (process._getActiveRequests) {
    return process._getActiveRequests();
  }
  return [];
}

// Variables for tracking where and when a key was pressed, and the time before it had an effect.