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

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeToolBar = consumeToolBar;
exports.consumeGadgetsService = consumeGadgetsService;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

// Imports from non-Nuclide modules.

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

// Imports from other Nuclide packages.

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomDebounced2;

function _commonsAtomDebounced() {
  return _commonsAtomDebounced2 = require('../../commons-atom/debounced');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _commonsAtomSudaToolBar2;

function _commonsAtomSudaToolBar() {
  return _commonsAtomSudaToolBar2 = require('../../commons-atom/suda-tool-bar');
}

// Imports from within this Nuclide package.

var _createHealthGadget2;

function _createHealthGadget() {
  return _createHealthGadget2 = _interopRequireDefault(require('./createHealthGadget'));
}

// We may as well declare these outside of Activation because most of them really are nullable.
var currentConfig = {};
var viewTimeout = null;
var analyticsTimeout = null;
var analyticsBuffer = [];

// Variables for tracking where and when a key was pressed, and the time before it had an effect.
var activeEditorSubscriptions = null;
var keyEditorId = 0;
var keyDownTime = 0;
var keyLatency = 0;
var lastKeyLatency = 0;
var keyLatencyHistogram = null;

var paneItemState$ = null;

var subscriptions = null;

function activate(state) {
  paneItemState$ = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.BehaviorSubject(null);
  subscriptions = new (_atom2 || _atom()).CompositeDisposable();
  subscriptions.add((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.onDidChange('nuclide-health', function (event) {
    currentConfig = event.newValue;
    // If user changes any config, update the health - and reset the polling cycles.
    updateViews();
    updateAnalytics();
  }), atom.workspace.onDidChangeActivePaneItem(disposeActiveEditorDisposables), (0, (_commonsAtomDebounced2 || _commonsAtomDebounced()).onWorkspaceDidStopChangingActivePaneItem)(timeActiveEditorKeys));
  currentConfig = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-health');
  timeActiveEditorKeys();
  updateViews();
  updateAnalytics();

  keyLatencyHistogram = new (_nuclideAnalytics2 || _nuclideAnalytics()).HistogramTracker('keypress-latency',
  /* maxValue */500,
  /* buckets */25,
  /* intervalSeconds */60);
}

function deactivate() {
  subscriptions.dispose();
  paneItemState$ = null;
  if (viewTimeout !== null) {
    clearTimeout(viewTimeout);
    viewTimeout = null;
  }
  if (analyticsTimeout !== null) {
    clearTimeout(analyticsTimeout);
    analyticsTimeout = null;
  }
  if (activeEditorSubscriptions) {
    activeEditorSubscriptions.dispose();
    activeEditorSubscriptions = null;
  }
  if (keyLatencyHistogram != null) {
    keyLatencyHistogram.dispose();
    keyLatencyHistogram = null;
  }
}

function consumeToolBar(getToolBar) {
  var toolBar = getToolBar('nuclide-health');
  toolBar.addButton({
    icon: 'dashboard',
    callback: 'nuclide-health:toggle',
    tooltip: 'Toggle Nuclide health stats',
    priority: (0, (_commonsAtomSudaToolBar2 || _commonsAtomSudaToolBar()).farEndPriority)(400)
  });
  var disposable = new (_atom2 || _atom()).Disposable(function () {
    toolBar.removeItems();
  });
  subscriptions.add(disposable);
  return disposable;
}

function consumeGadgetsService(gadgetsApi) {
  (0, (_assert2 || _assert()).default)(paneItemState$);
  var gadget = (0, (_createHealthGadget2 || _createHealthGadget()).default)(paneItemState$);
  subscriptions.add(gadgetsApi.registerGadget(gadget));
}

function disposeActiveEditorDisposables() {
  // Clear out any events & timing data from previous text editor.
  if (activeEditorSubscriptions != null) {
    activeEditorSubscriptions.dispose();
    activeEditorSubscriptions = null;
  }
}

function timeActiveEditorKeys() {
  disposeActiveEditorDisposables();
  activeEditorSubscriptions = new (_atom2 || _atom()).CompositeDisposable();

  // If option is enabled, start timing latency of keys on the new text editor.
  if (!paneItemState$) {
    return;
  }

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
      keyEditorId = editor.id;
      keyDownTime = Date.now();
    }
  };

  // Stop the clock when the (same) editor has changed content.
  var stopKeyClock = function stopKeyClock() {
    if (editor && editor.id && keyEditorId === editor.id && keyDownTime) {
      keyLatency = Date.now() - keyDownTime;
      if (keyLatencyHistogram != null) {
        keyLatencyHistogram.track(keyLatency);
      }
      // Reset so that subsequent non-key-initiated buffer updates don't produce silly big numbers.
      keyDownTime = 0;
    }
  };

  // Add the listener to keydown.
  view.addEventListener('keydown', startKeyClock);

  activeEditorSubscriptions.add(
  // Remove the listener in a home-made disposable for when this editor is no-longer active.
  new (_atom2 || _atom()).Disposable(function () {
    return view.removeEventListener('keydown', startKeyClock);
  }),

  // stopKeyClock is fast so attaching it to onDidChange here is OK.
  // onDidStopChanging would be another option - any cost is deferred, but with far less fidelity.
  editor.onDidChange(stopKeyClock));
}

function updateViews() {
  if (!paneItemState$) {
    return;
  }

  var stats = getHealthStats();
  analyticsBuffer.push(stats);
  paneItemState$.next({ stats: stats, activeHandleObjects: getActiveHandles() });
  if (currentConfig.viewTimeout) {
    if (viewTimeout !== null) {
      clearTimeout(viewTimeout);
    }
    viewTimeout = setTimeout(updateViews, currentConfig.viewTimeout * 1000);
  }
}

function updateAnalytics() {
  if (analyticsBuffer.length > 0) {
    (function () {
      // Aggregates the buffered stats up by suffixing avg, min, max to their names.
      var aggregateStats = {};

      // All analyticsBuffer entries have the same keys; we use the first entry to know what they are.
      Object.keys(analyticsBuffer[0]).forEach(function (statsKey) {
        if (statsKey === 'lastKeyLatency') {
          return;
          // This field is only used to for a sticky value in the status bar, and is not to be sent.
        }

        var aggregates = aggregate(analyticsBuffer.map(function (stats) {
          return stats[statsKey];
        }), statsKey === 'keyLatency');
        // skipZeros: Don't use empty key latency values in aggregates.
        Object.keys(aggregates).forEach(function (aggregatesKey) {
          var value = aggregates[aggregatesKey];
          if (value !== null && value !== undefined) {
            aggregateStats[statsKey + '_' + aggregatesKey] = value.toFixed(2);
          }
        });
      });
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-health', aggregateStats);
      analyticsBuffer = [];
    })();
  }

  if (currentConfig.analyticsTimeout) {
    if (analyticsTimeout !== null) {
      clearTimeout(analyticsTimeout);
    }
    analyticsTimeout = setTimeout(updateAnalytics, currentConfig.analyticsTimeout * 60 * 1000);
  }
}

function aggregate(values) {
  var skipZeros = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  // Some values (like memory usage) might be very high & numerous, so avoid summing them all up.
  if (skipZeros) {
    values = values.filter(function (value) {
      return value !== 0;
    });
    if (values.length === 0) {
      return { avg: null, min: null, max: null };
    }
  }
  var avg = values.reduce(function (prevValue, currValue, index) {
    return prevValue + (currValue - prevValue) / (index + 1);
  }, 0);
  var min = Math.min.apply(Math, _toConsumableArray(values));
  var max = Math.max.apply(Math, _toConsumableArray(values));
  return { avg: avg, min: min, max: max };
}

function getHealthStats() {
  var stats = process.memoryUsage(); // RSS, heap and usage.

  if (keyLatency) {
    lastKeyLatency = keyLatency;
  }

  var result = _extends({}, stats, {
    heapPercentage: 100 * stats.heapUsed / stats.heapTotal, // Just for convenience.
    cpuPercentage: (_os2 || _os()).default.loadavg()[0], // 1 minute CPU average.
    lastKeyLatency: lastKeyLatency,
    keyLatency: keyLatency,
    activeHandles: getActiveHandles().length,
    activeRequests: getActiveRequests().length
  });

  keyLatency = 0; // We only want to ever record a key latency time once, and so we reset it.

  return result;
}

// These two functions are to defend against undocumented Node functions.
function getActiveHandles() {
  if (process._getActiveHandles) {
    return process._getActiveHandles();
  }
  return [];
}

function getActiveRequests() {
  if (process._getActiveRequests) {
    return process._getActiveRequests();
  }
  return [];
}