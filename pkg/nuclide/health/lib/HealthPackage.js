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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

// Imports from non-Nuclide modules.

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

// Imports from other Nuclide packages.

var _analytics = require('../../analytics');

var _atomHelpers = require('../../atom-helpers');

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

// Imports from within this Nuclide package.

var _createHealthGadget = require('./createHealthGadget');

var _createHealthGadget2 = _interopRequireDefault(_createHealthGadget);

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

var paneItemState$ = null;

var subscriptions = null;

function activate(state) {
  paneItemState$ = new _rx2['default'].BehaviorSubject(null);
  subscriptions = new _atom.CompositeDisposable();
  subscriptions.add(_featureConfig2['default'].onDidChange('nuclide-health', function (event) {
    currentConfig = event.newValue;
    // If user changes any config, update the health - and reset the polling cycles.
    updateViews();
    updateAnalytics();
  }), atom.workspace.onDidChangeActivePaneItem(disposeActiveEditorDisposables), _atomHelpers.atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem(timeActiveEditorKeys));
  currentConfig = _featureConfig2['default'].get('nuclide-health');
  timeActiveEditorKeys();
  updateViews();
  updateAnalytics();
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
}

function consumeToolBar(getToolBar) {
  var toolBar = getToolBar('nuclide-health');
  toolBar.addButton({
    icon: 'dashboard',
    callback: 'nuclide-health:toggle',
    tooltip: 'Toggle Nuclide health stats',
    priority: 900
  });
  subscriptions.add(new _atom.Disposable(function () {
    toolBar.removeItems();
  }));
}

function consumeGadgetsService(gadgetsApi) {
  (0, _assert2['default'])(paneItemState$);
  var gadget = (0, _createHealthGadget2['default'])(paneItemState$);
  return gadgetsApi.registerGadget(gadget);
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
  activeEditorSubscriptions = new _atom.CompositeDisposable();

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
      // Reset so that subsequent non-key-initiated buffer updates don't produce silly big numbers.
      keyDownTime = 0;
    }
  };

  // Add the listener to keydown.
  view.addEventListener('keydown', startKeyClock);

  activeEditorSubscriptions.add(
  // Remove the listener in a home-made disposable for when this editor is no-longer active.
  new _atom.Disposable(function () {
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
  paneItemState$.onNext({ stats: stats, activeHandleObjects: getActiveHandles() });
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
      (0, _analytics.track)('nuclide-health', aggregateStats);
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
    cpuPercentage: _os2['default'].loadavg()[0], // 1 minute CPU average.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhlYWx0aFBhY2thZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFlc0IsUUFBUTs7OztvQkFDZ0IsTUFBTTs7a0JBQ3JDLElBQUk7Ozs7a0JBQ0osSUFBSTs7Ozs7O3lCQUdDLGlCQUFpQjs7MkJBQ0wsb0JBQW9COzs2QkFDMUIsc0JBQXNCOzs7Ozs7a0NBR2pCLHNCQUFzQjs7Ozs7QUFHckQsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLElBQUksV0FBb0IsR0FBRyxJQUFJLENBQUM7QUFDaEMsSUFBSSxnQkFBeUIsR0FBRyxJQUFJLENBQUM7QUFDckMsSUFBSSxlQUFtQyxHQUFHLEVBQUUsQ0FBQzs7O0FBRzdDLElBQUkseUJBQStDLEdBQUcsSUFBSSxDQUFDO0FBQzNELElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNwQixJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDcEIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQzs7QUFFdkIsSUFBSSxjQUFtQyxHQUFHLElBQUksQ0FBQzs7QUFFL0MsSUFBSSxhQUFrQyxHQUFJLElBQUksQUFBTSxDQUFDOztBQUU5QyxTQUFTLFFBQVEsQ0FBQyxLQUFjLEVBQUU7QUFDdkMsZ0JBQWMsR0FBRyxJQUFJLGdCQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5QyxlQUFhLEdBQUcsK0JBQXlCLENBQUM7QUFDMUMsZUFBYSxDQUFDLEdBQUcsQ0FDZiwyQkFBYyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsVUFBQSxLQUFLLEVBQUk7QUFDbkQsaUJBQWEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDOztBQUUvQixlQUFXLEVBQUUsQ0FBQztBQUNkLG1CQUFlLEVBQUUsQ0FBQztHQUNuQixDQUFDLEVBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyw4QkFBOEIsQ0FBQyxFQUN4RSwrQkFBa0Isd0NBQXdDLENBQUMsb0JBQW9CLENBQUMsQ0FDakYsQ0FBQztBQUNGLGVBQWEsR0FBRywyQkFBYyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNwRCxzQkFBb0IsRUFBRSxDQUFDO0FBQ3ZCLGFBQVcsRUFBRSxDQUFDO0FBQ2QsaUJBQWUsRUFBRSxDQUFDO0NBQ25COztBQUVNLFNBQVMsVUFBVSxHQUFHO0FBQzNCLGVBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QixnQkFBYyxHQUFHLElBQUksQ0FBQztBQUN0QixNQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7QUFDeEIsZ0JBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMxQixlQUFXLEdBQUcsSUFBSSxDQUFDO0dBQ3BCO0FBQ0QsTUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7QUFDN0IsZ0JBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQy9CLG9CQUFnQixHQUFHLElBQUksQ0FBQztHQUN6QjtBQUNELE1BQUkseUJBQXlCLEVBQUU7QUFDN0IsNkJBQXlCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDcEMsNkJBQXlCLEdBQUcsSUFBSSxDQUFDO0dBQ2xDO0NBQ0Y7O0FBRU0sU0FBUyxjQUFjLENBQUMsVUFBcUMsRUFBUTtBQUMxRSxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM3QyxTQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2hCLFFBQUksRUFBRSxXQUFXO0FBQ2pCLFlBQVEsRUFBRSx1QkFBdUI7QUFDakMsV0FBTyxFQUFFLDZCQUE2QjtBQUN0QyxZQUFRLEVBQUUsR0FBRztHQUNkLENBQUMsQ0FBQztBQUNILGVBQWEsQ0FBQyxHQUFHLENBQUMscUJBQWUsWUFBTTtBQUNyQyxXQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7R0FDdkIsQ0FBQyxDQUFDLENBQUM7Q0FDTDs7QUFFTSxTQUFTLHFCQUFxQixDQUFDLFVBQTBCLEVBQWU7QUFDN0UsMkJBQVUsY0FBYyxDQUFDLENBQUM7QUFDMUIsTUFBTSxNQUFjLEdBQUkscUNBQW1CLGNBQWMsQ0FBQyxBQUFNLENBQUM7QUFDakUsU0FBTyxVQUFVLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQzFDOztBQUVELFNBQVMsOEJBQThCLEdBQVM7O0FBRTlDLE1BQUkseUJBQXlCLElBQUksSUFBSSxFQUFFO0FBQ3JDLDZCQUF5QixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BDLDZCQUF5QixHQUFHLElBQUksQ0FBQztHQUNsQztDQUNGOztBQUVELFNBQVMsb0JBQW9CLEdBQVM7QUFDcEMsZ0NBQThCLEVBQUUsQ0FBQztBQUNqQywyQkFBeUIsR0FBRywrQkFBeUIsQ0FBQzs7O0FBR3RELE1BQUksQ0FBQyxjQUFjLEVBQUU7QUFDbkIsV0FBTztHQUNSOzs7QUFHRCxNQUFNLE1BQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ2pFLE1BQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxXQUFPO0dBQ1I7QUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QyxNQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsV0FBTztHQUNSOzs7QUFHRCxNQUFNLGFBQWEsR0FBRyxTQUFoQixhQUFhLEdBQVM7QUFDMUIsUUFBSSxNQUFNLEVBQUU7QUFDVixpQkFBVyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7QUFDeEIsaUJBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDMUI7R0FDRixDQUFDOzs7QUFHRixNQUFNLFlBQVksR0FBRyxTQUFmLFlBQVksR0FBUztBQUN6QixRQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsRUFBRSxJQUFJLFdBQVcsS0FBSyxNQUFNLENBQUMsRUFBRSxJQUFJLFdBQVcsRUFBRTtBQUNuRSxnQkFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxXQUFXLENBQUM7O0FBRXRDLGlCQUFXLEdBQUcsQ0FBQyxDQUFDO0tBQ2pCO0dBQ0YsQ0FBQzs7O0FBR0YsTUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQzs7QUFFaEQsMkJBQXlCLENBQUMsR0FBRzs7QUFFM0IsdUJBQWU7V0FBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQztHQUFBLENBQUM7Ozs7QUFJeEUsUUFBTSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FDakMsQ0FBQztDQUNIOztBQUVELFNBQVMsV0FBVyxHQUFTO0FBQzNCLE1BQUksQ0FBQyxjQUFjLEVBQUU7QUFDbkIsV0FBTztHQUNSOztBQUVELE1BQU0sS0FBSyxHQUFHLGNBQWMsRUFBRSxDQUFDO0FBQy9CLGlCQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVCLGdCQUFjLENBQUMsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFMLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRSxFQUFDLENBQUMsQ0FBQztBQUN4RSxNQUFJLGFBQWEsQ0FBQyxXQUFXLEVBQUU7QUFDN0IsUUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO0FBQ3hCLGtCQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDM0I7QUFDRCxlQUFXLEdBQUcsVUFBVSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDO0dBQ3pFO0NBQ0Y7O0FBRUQsU0FBUyxlQUFlLEdBQVM7QUFDL0IsTUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTs7O0FBRTlCLFVBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQzs7O0FBRzFCLFlBQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ2xELFlBQUksUUFBUSxLQUFLLGdCQUFnQixFQUFFO0FBQ2pDLGlCQUFPOztTQUVSOztBQUVELFlBQU0sVUFBVSxHQUFHLFNBQVMsQ0FDMUIsZUFBZSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7aUJBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQztTQUFBLENBQUMsRUFDNUMsUUFBUSxLQUFLLFlBQVksQ0FDM0IsQ0FBQzs7QUFDRixjQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLGFBQWEsRUFBSTtBQUMvQyxjQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDeEMsY0FBSSxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7QUFDekMsMEJBQWMsQ0FBSSxRQUFRLFNBQUksYUFBYSxDQUFHLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUNuRTtTQUNGLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztBQUNILDRCQUFNLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ3hDLHFCQUFlLEdBQUcsRUFBRSxDQUFDOztHQUN0Qjs7QUFFRCxNQUFJLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyxRQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRTtBQUM3QixrQkFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDaEM7QUFDRCxvQkFBZ0IsR0FBRyxVQUFVLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7R0FDNUY7Q0FDRjs7QUFFRCxTQUFTLFNBQVMsQ0FDaEIsTUFBcUIsRUFFdUI7TUFENUMsU0FBa0IseURBQUcsS0FBSzs7O0FBRzFCLE1BQUksU0FBUyxFQUFFO0FBQ2IsVUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLO2FBQUksS0FBSyxLQUFLLENBQUM7S0FBQSxDQUFDLENBQUM7QUFDN0MsUUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN2QixhQUFPLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztLQUMxQztHQUNGO0FBQ0QsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFLO0FBQ3pELFdBQU8sU0FBUyxHQUFHLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQSxJQUFLLEtBQUssR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFDO0dBQzFELEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDTixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxNQUFBLENBQVIsSUFBSSxxQkFBUSxNQUFNLEVBQUMsQ0FBQztBQUNoQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxNQUFBLENBQVIsSUFBSSxxQkFBUSxNQUFNLEVBQUMsQ0FBQztBQUNoQyxTQUFPLEVBQUMsR0FBRyxFQUFILEdBQUcsRUFBRSxHQUFHLEVBQUgsR0FBRyxFQUFFLEdBQUcsRUFBSCxHQUFHLEVBQUMsQ0FBQztDQUN4Qjs7QUFFRCxTQUFTLGNBQWMsR0FBZ0I7QUFDckMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVwQyxNQUFJLFVBQVUsRUFBRTtBQUNkLGtCQUFjLEdBQUcsVUFBVSxDQUFDO0dBQzdCOztBQUVELE1BQU0sTUFBTSxnQkFDUCxLQUFLO0FBQ1Isa0JBQWMsRUFBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsU0FBUyxBQUFDO0FBQ3hELGlCQUFhLEVBQUUsZ0JBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzlCLGtCQUFjLEVBQWQsY0FBYztBQUNkLGNBQVUsRUFBVixVQUFVO0FBQ1YsaUJBQWEsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLE1BQU07QUFDeEMsa0JBQWMsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLE1BQU07SUFDM0MsQ0FBQzs7QUFFRixZQUFVLEdBQUcsQ0FBQyxDQUFDOztBQUVmLFNBQU8sTUFBTSxDQUFDO0NBQ2Y7OztBQUdELFNBQVMsZ0JBQWdCLEdBQWtCO0FBQ3pDLE1BQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO0FBQzdCLFdBQU8sT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7R0FDcEM7QUFDRCxTQUFPLEVBQUUsQ0FBQztDQUNYOztBQUVELFNBQVMsaUJBQWlCLEdBQWtCO0FBQzFDLE1BQUksT0FBTyxDQUFDLGtCQUFrQixFQUFFO0FBQzlCLFdBQU8sT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUM7R0FDckM7QUFDRCxTQUFPLEVBQUUsQ0FBQztDQUNYIiwiZmlsZSI6IkhlYWx0aFBhY2thZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7R2FkZ2V0c1NlcnZpY2UsIEdhZGdldH0gZnJvbSAnLi4vLi4vZ2FkZ2V0cy1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtIZWFsdGhTdGF0c30gZnJvbSAnLi90eXBlcyc7XG5cbi8vIEltcG9ydHMgZnJvbSBub24tTnVjbGlkZSBtb2R1bGVzLlxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG4vLyBJbXBvcnRzIGZyb20gb3RoZXIgTnVjbGlkZSBwYWNrYWdlcy5cbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2F0b21FdmVudERlYm91bmNlfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vZmVhdHVyZS1jb25maWcnO1xuXG4vLyBJbXBvcnRzIGZyb20gd2l0aGluIHRoaXMgTnVjbGlkZSBwYWNrYWdlLlxuaW1wb3J0IGNyZWF0ZUhlYWx0aEdhZGdldCBmcm9tICcuL2NyZWF0ZUhlYWx0aEdhZGdldCc7XG5cbi8vIFdlIG1heSBhcyB3ZWxsIGRlY2xhcmUgdGhlc2Ugb3V0c2lkZSBvZiBBY3RpdmF0aW9uIGJlY2F1c2UgbW9zdCBvZiB0aGVtIHJlYWxseSBhcmUgbnVsbGFibGUuXG5sZXQgY3VycmVudENvbmZpZyA9IHt9O1xubGV0IHZpZXdUaW1lb3V0OiA/bnVtYmVyID0gbnVsbDtcbmxldCBhbmFseXRpY3NUaW1lb3V0OiA/bnVtYmVyID0gbnVsbDtcbmxldCBhbmFseXRpY3NCdWZmZXI6IEFycmF5PEhlYWx0aFN0YXRzPiA9IFtdO1xuXG4vLyBWYXJpYWJsZXMgZm9yIHRyYWNraW5nIHdoZXJlIGFuZCB3aGVuIGEga2V5IHdhcyBwcmVzc2VkLCBhbmQgdGhlIHRpbWUgYmVmb3JlIGl0IGhhZCBhbiBlZmZlY3QuXG5sZXQgYWN0aXZlRWRpdG9yU3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGUgPSBudWxsO1xubGV0IGtleUVkaXRvcklkID0gMDtcbmxldCBrZXlEb3duVGltZSA9IDA7XG5sZXQga2V5TGF0ZW5jeSA9IDA7XG5sZXQgbGFzdEtleUxhdGVuY3kgPSAwO1xuXG5sZXQgcGFuZUl0ZW1TdGF0ZSQ6ID9SeC5CZWhhdmlvclN1YmplY3QgPSBudWxsO1xuXG5sZXQgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZSA9IChudWxsOiBhbnkpO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgcGFuZUl0ZW1TdGF0ZSQgPSBuZXcgUnguQmVoYXZpb3JTdWJqZWN0KG51bGwpO1xuICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgZmVhdHVyZUNvbmZpZy5vbkRpZENoYW5nZSgnbnVjbGlkZS1oZWFsdGgnLCBldmVudCA9PiB7XG4gICAgICBjdXJyZW50Q29uZmlnID0gZXZlbnQubmV3VmFsdWU7XG4gICAgICAvLyBJZiB1c2VyIGNoYW5nZXMgYW55IGNvbmZpZywgdXBkYXRlIHRoZSBoZWFsdGggLSBhbmQgcmVzZXQgdGhlIHBvbGxpbmcgY3ljbGVzLlxuICAgICAgdXBkYXRlVmlld3MoKTtcbiAgICAgIHVwZGF0ZUFuYWx5dGljcygpO1xuICAgIH0pLFxuICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oZGlzcG9zZUFjdGl2ZUVkaXRvckRpc3Bvc2FibGVzKSxcbiAgICBhdG9tRXZlbnREZWJvdW5jZS5vbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtKHRpbWVBY3RpdmVFZGl0b3JLZXlzKSxcbiAgKTtcbiAgY3VycmVudENvbmZpZyA9IGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLWhlYWx0aCcpO1xuICB0aW1lQWN0aXZlRWRpdG9yS2V5cygpO1xuICB1cGRhdGVWaWV3cygpO1xuICB1cGRhdGVBbmFseXRpY3MoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICBwYW5lSXRlbVN0YXRlJCA9IG51bGw7XG4gIGlmICh2aWV3VGltZW91dCAhPT0gbnVsbCkge1xuICAgIGNsZWFyVGltZW91dCh2aWV3VGltZW91dCk7XG4gICAgdmlld1RpbWVvdXQgPSBudWxsO1xuICB9XG4gIGlmIChhbmFseXRpY3NUaW1lb3V0ICE9PSBudWxsKSB7XG4gICAgY2xlYXJUaW1lb3V0KGFuYWx5dGljc1RpbWVvdXQpO1xuICAgIGFuYWx5dGljc1RpbWVvdXQgPSBudWxsO1xuICB9XG4gIGlmIChhY3RpdmVFZGl0b3JTdWJzY3JpcHRpb25zKSB7XG4gICAgYWN0aXZlRWRpdG9yU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgYWN0aXZlRWRpdG9yU3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgY29uc3QgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtaGVhbHRoJyk7XG4gIHRvb2xCYXIuYWRkQnV0dG9uKHtcbiAgICBpY29uOiAnZGFzaGJvYXJkJyxcbiAgICBjYWxsYmFjazogJ251Y2xpZGUtaGVhbHRoOnRvZ2dsZScsXG4gICAgdG9vbHRpcDogJ1RvZ2dsZSBOdWNsaWRlIGhlYWx0aCBzdGF0cycsXG4gICAgcHJpb3JpdHk6IDkwMCxcbiAgfSk7XG4gIHN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7XG4gIH0pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVHYWRnZXRzU2VydmljZShnYWRnZXRzQXBpOiBHYWRnZXRzU2VydmljZSk6IElEaXNwb3NhYmxlIHtcbiAgaW52YXJpYW50KHBhbmVJdGVtU3RhdGUkKTtcbiAgY29uc3QgZ2FkZ2V0OiBHYWRnZXQgPSAoY3JlYXRlSGVhbHRoR2FkZ2V0KHBhbmVJdGVtU3RhdGUkKTogYW55KTtcbiAgcmV0dXJuIGdhZGdldHNBcGkucmVnaXN0ZXJHYWRnZXQoZ2FkZ2V0KTtcbn1cblxuZnVuY3Rpb24gZGlzcG9zZUFjdGl2ZUVkaXRvckRpc3Bvc2FibGVzKCk6IHZvaWQge1xuICAvLyBDbGVhciBvdXQgYW55IGV2ZW50cyAmIHRpbWluZyBkYXRhIGZyb20gcHJldmlvdXMgdGV4dCBlZGl0b3IuXG4gIGlmIChhY3RpdmVFZGl0b3JTdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICBhY3RpdmVFZGl0b3JTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmVFZGl0b3JTdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0aW1lQWN0aXZlRWRpdG9yS2V5cygpOiB2b2lkIHtcbiAgZGlzcG9zZUFjdGl2ZUVkaXRvckRpc3Bvc2FibGVzKCk7XG4gIGFjdGl2ZUVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gIC8vIElmIG9wdGlvbiBpcyBlbmFibGVkLCBzdGFydCB0aW1pbmcgbGF0ZW5jeSBvZiBrZXlzIG9uIHRoZSBuZXcgdGV4dCBlZGl0b3IuXG4gIGlmICghcGFuZUl0ZW1TdGF0ZSQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBFbnN1cmUgdGhlIGVkaXRvciBpcyB2YWxpZCBhbmQgdGhlcmUgaXMgYSB2aWV3IHRvIGF0dGFjaCB0aGUga2V5cHJlc3MgdGltaW5nIHRvLlxuICBjb25zdCBlZGl0b3I6ID9UZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICBpZiAoIWVkaXRvcikge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB2aWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcik7XG4gIGlmICghdmlldykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBjbG9jayB3aGVuIGEga2V5IGlzIHByZXNzZWQuIEZ1bmN0aW9uIGlzIG5hbWVkIHNvIGl0IGNhbiBiZSBkaXNwb3NlZCB3ZWxsLlxuICBjb25zdCBzdGFydEtleUNsb2NrID0gKCkgPT4ge1xuICAgIGlmIChlZGl0b3IpIHtcbiAgICAgIGtleUVkaXRvcklkID0gZWRpdG9yLmlkO1xuICAgICAga2V5RG93blRpbWUgPSBEYXRlLm5vdygpO1xuICAgIH1cbiAgfTtcblxuICAvLyBTdG9wIHRoZSBjbG9jayB3aGVuIHRoZSAoc2FtZSkgZWRpdG9yIGhhcyBjaGFuZ2VkIGNvbnRlbnQuXG4gIGNvbnN0IHN0b3BLZXlDbG9jayA9ICgpID0+IHtcbiAgICBpZiAoZWRpdG9yICYmIGVkaXRvci5pZCAmJiBrZXlFZGl0b3JJZCA9PT0gZWRpdG9yLmlkICYmIGtleURvd25UaW1lKSB7XG4gICAgICBrZXlMYXRlbmN5ID0gRGF0ZS5ub3coKSAtIGtleURvd25UaW1lO1xuICAgICAgLy8gUmVzZXQgc28gdGhhdCBzdWJzZXF1ZW50IG5vbi1rZXktaW5pdGlhdGVkIGJ1ZmZlciB1cGRhdGVzIGRvbid0IHByb2R1Y2Ugc2lsbHkgYmlnIG51bWJlcnMuXG4gICAgICBrZXlEb3duVGltZSA9IDA7XG4gICAgfVxuICB9O1xuXG4gIC8vIEFkZCB0aGUgbGlzdGVuZXIgdG8ga2V5ZG93bi5cbiAgdmlldy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc3RhcnRLZXlDbG9jayk7XG5cbiAgYWN0aXZlRWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgLy8gUmVtb3ZlIHRoZSBsaXN0ZW5lciBpbiBhIGhvbWUtbWFkZSBkaXNwb3NhYmxlIGZvciB3aGVuIHRoaXMgZWRpdG9yIGlzIG5vLWxvbmdlciBhY3RpdmUuXG4gICAgbmV3IERpc3Bvc2FibGUoKCkgPT4gdmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc3RhcnRLZXlDbG9jaykpLFxuXG4gICAgLy8gc3RvcEtleUNsb2NrIGlzIGZhc3Qgc28gYXR0YWNoaW5nIGl0IHRvIG9uRGlkQ2hhbmdlIGhlcmUgaXMgT0suXG4gICAgLy8gb25EaWRTdG9wQ2hhbmdpbmcgd291bGQgYmUgYW5vdGhlciBvcHRpb24gLSBhbnkgY29zdCBpcyBkZWZlcnJlZCwgYnV0IHdpdGggZmFyIGxlc3MgZmlkZWxpdHkuXG4gICAgZWRpdG9yLm9uRGlkQ2hhbmdlKHN0b3BLZXlDbG9jayksXG4gICk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVZpZXdzKCk6IHZvaWQge1xuICBpZiAoIXBhbmVJdGVtU3RhdGUkKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3Qgc3RhdHMgPSBnZXRIZWFsdGhTdGF0cygpO1xuICBhbmFseXRpY3NCdWZmZXIucHVzaChzdGF0cyk7XG4gIHBhbmVJdGVtU3RhdGUkLm9uTmV4dCh7c3RhdHMsIGFjdGl2ZUhhbmRsZU9iamVjdHM6IGdldEFjdGl2ZUhhbmRsZXMoKX0pO1xuICBpZiAoY3VycmVudENvbmZpZy52aWV3VGltZW91dCkge1xuICAgIGlmICh2aWV3VGltZW91dCAhPT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHZpZXdUaW1lb3V0KTtcbiAgICB9XG4gICAgdmlld1RpbWVvdXQgPSBzZXRUaW1lb3V0KHVwZGF0ZVZpZXdzLCBjdXJyZW50Q29uZmlnLnZpZXdUaW1lb3V0ICogMTAwMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlQW5hbHl0aWNzKCk6IHZvaWQge1xuICBpZiAoYW5hbHl0aWNzQnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICAvLyBBZ2dyZWdhdGVzIHRoZSBidWZmZXJlZCBzdGF0cyB1cCBieSBzdWZmaXhpbmcgYXZnLCBtaW4sIG1heCB0byB0aGVpciBuYW1lcy5cbiAgICBjb25zdCBhZ2dyZWdhdGVTdGF0cyA9IHt9O1xuXG4gICAgLy8gQWxsIGFuYWx5dGljc0J1ZmZlciBlbnRyaWVzIGhhdmUgdGhlIHNhbWUga2V5czsgd2UgdXNlIHRoZSBmaXJzdCBlbnRyeSB0byBrbm93IHdoYXQgdGhleSBhcmUuXG4gICAgT2JqZWN0LmtleXMoYW5hbHl0aWNzQnVmZmVyWzBdKS5mb3JFYWNoKHN0YXRzS2V5ID0+IHtcbiAgICAgIGlmIChzdGF0c0tleSA9PT0gJ2xhc3RLZXlMYXRlbmN5Jykge1xuICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIFRoaXMgZmllbGQgaXMgb25seSB1c2VkIHRvIGZvciBhIHN0aWNreSB2YWx1ZSBpbiB0aGUgc3RhdHVzIGJhciwgYW5kIGlzIG5vdCB0byBiZSBzZW50LlxuICAgICAgfVxuXG4gICAgICBjb25zdCBhZ2dyZWdhdGVzID0gYWdncmVnYXRlKFxuICAgICAgICBhbmFseXRpY3NCdWZmZXIubWFwKHN0YXRzID0+IHN0YXRzW3N0YXRzS2V5XSksXG4gICAgICAgIChzdGF0c0tleSA9PT0gJ2tleUxhdGVuY3knKSwgLy8gc2tpcFplcm9zOiBEb24ndCB1c2UgZW1wdHkga2V5IGxhdGVuY3kgdmFsdWVzIGluIGFnZ3JlZ2F0ZXMuXG4gICAgICApO1xuICAgICAgT2JqZWN0LmtleXMoYWdncmVnYXRlcykuZm9yRWFjaChhZ2dyZWdhdGVzS2V5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhZ2dyZWdhdGVzW2FnZ3JlZ2F0ZXNLZXldO1xuICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGFnZ3JlZ2F0ZVN0YXRzW2Ake3N0YXRzS2V5fV8ke2FnZ3JlZ2F0ZXNLZXl9YF0gPSB2YWx1ZS50b0ZpeGVkKDIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0cmFjaygnbnVjbGlkZS1oZWFsdGgnLCBhZ2dyZWdhdGVTdGF0cyk7XG4gICAgYW5hbHl0aWNzQnVmZmVyID0gW107XG4gIH1cblxuICBpZiAoY3VycmVudENvbmZpZy5hbmFseXRpY3NUaW1lb3V0KSB7XG4gICAgaWYgKGFuYWx5dGljc1RpbWVvdXQgIT09IG51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dChhbmFseXRpY3NUaW1lb3V0KTtcbiAgICB9XG4gICAgYW5hbHl0aWNzVGltZW91dCA9IHNldFRpbWVvdXQodXBkYXRlQW5hbHl0aWNzLCBjdXJyZW50Q29uZmlnLmFuYWx5dGljc1RpbWVvdXQgKiA2MCAqIDEwMDApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFnZ3JlZ2F0ZShcbiAgdmFsdWVzOiBBcnJheTxudW1iZXI+LFxuICBza2lwWmVyb3M6IGJvb2xlYW4gPSBmYWxzZSxcbik6IHthdmc6ID9udW1iZXI7IG1pbjogP251bWJlcjsgbWF4OiA/bnVtYmVyfSB7XG4gIC8vIFNvbWUgdmFsdWVzIChsaWtlIG1lbW9yeSB1c2FnZSkgbWlnaHQgYmUgdmVyeSBoaWdoICYgbnVtZXJvdXMsIHNvIGF2b2lkIHN1bW1pbmcgdGhlbSBhbGwgdXAuXG4gIGlmIChza2lwWmVyb3MpIHtcbiAgICB2YWx1ZXMgPSB2YWx1ZXMuZmlsdGVyKHZhbHVlID0+IHZhbHVlICE9PSAwKTtcbiAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHthdmc6IG51bGwsIG1pbjogbnVsbCwgbWF4OiBudWxsfTtcbiAgICB9XG4gIH1cbiAgY29uc3QgYXZnID0gdmFsdWVzLnJlZHVjZSgocHJldlZhbHVlLCBjdXJyVmFsdWUsIGluZGV4KSA9PiB7XG4gICAgcmV0dXJuIHByZXZWYWx1ZSArIChjdXJyVmFsdWUgLSBwcmV2VmFsdWUpIC8gKGluZGV4ICsgMSk7XG4gIH0sIDApO1xuICBjb25zdCBtaW4gPSBNYXRoLm1pbiguLi52YWx1ZXMpO1xuICBjb25zdCBtYXggPSBNYXRoLm1heCguLi52YWx1ZXMpO1xuICByZXR1cm4ge2F2ZywgbWluLCBtYXh9O1xufVxuXG5mdW5jdGlvbiBnZXRIZWFsdGhTdGF0cygpOiBIZWFsdGhTdGF0cyB7XG4gIGNvbnN0IHN0YXRzID0gcHJvY2Vzcy5tZW1vcnlVc2FnZSgpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSU1MsIGhlYXAgYW5kIHVzYWdlLlxuXG4gIGlmIChrZXlMYXRlbmN5KSB7XG4gICAgbGFzdEtleUxhdGVuY3kgPSBrZXlMYXRlbmN5O1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIC4uLnN0YXRzLFxuICAgIGhlYXBQZXJjZW50YWdlOiAoMTAwICogc3RhdHMuaGVhcFVzZWQgLyBzdGF0cy5oZWFwVG90YWwpLCAgIC8vIEp1c3QgZm9yIGNvbnZlbmllbmNlLlxuICAgIGNwdVBlcmNlbnRhZ2U6IG9zLmxvYWRhdmcoKVswXSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEgbWludXRlIENQVSBhdmVyYWdlLlxuICAgIGxhc3RLZXlMYXRlbmN5LFxuICAgIGtleUxhdGVuY3ksXG4gICAgYWN0aXZlSGFuZGxlczogZ2V0QWN0aXZlSGFuZGxlcygpLmxlbmd0aCxcbiAgICBhY3RpdmVSZXF1ZXN0czogZ2V0QWN0aXZlUmVxdWVzdHMoKS5sZW5ndGgsXG4gIH07XG5cbiAga2V5TGF0ZW5jeSA9IDA7IC8vIFdlIG9ubHkgd2FudCB0byBldmVyIHJlY29yZCBhIGtleSBsYXRlbmN5IHRpbWUgb25jZSwgYW5kIHNvIHdlIHJlc2V0IGl0LlxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIFRoZXNlIHR3byBmdW5jdGlvbnMgYXJlIHRvIGRlZmVuZCBhZ2FpbnN0IHVuZG9jdW1lbnRlZCBOb2RlIGZ1bmN0aW9ucy5cbmZ1bmN0aW9uIGdldEFjdGl2ZUhhbmRsZXMoKTogQXJyYXk8T2JqZWN0PiB7XG4gIGlmIChwcm9jZXNzLl9nZXRBY3RpdmVIYW5kbGVzKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuX2dldEFjdGl2ZUhhbmRsZXMoKTtcbiAgfVxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGdldEFjdGl2ZVJlcXVlc3RzKCk6IEFycmF5PE9iamVjdD4ge1xuICBpZiAocHJvY2Vzcy5fZ2V0QWN0aXZlUmVxdWVzdHMpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5fZ2V0QWN0aXZlUmVxdWVzdHMoKTtcbiAgfVxuICByZXR1cm4gW107XG59XG4iXX0=