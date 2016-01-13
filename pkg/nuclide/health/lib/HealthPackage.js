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

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeStatusBar = consumeStatusBar;
exports.consumeGadgetsService = consumeGadgetsService;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// Imports from non-Nuclide modules.

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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

var _uiHealthStatusBarComponent = require('./ui/HealthStatusBarComponent');

var _uiHealthStatusBarComponent2 = _interopRequireDefault(_uiHealthStatusBarComponent);

// We may as well declare these outside of Activation because most of them really are nullable.
var currentConfig = {};
var statusBarItem = undefined;
var paneItem = undefined;
var viewTimeout = null;
var analyticsTimeout = null;
var analyticsBuffer = [];
var gadgets = null;

// Variables for tracking where and when a key was pressed, and the time before it had an effect.
var activeEditorDisposables = null;
var keyEditorId = 0;
var keyDownTime = 0;
var keyLatency = 0;
var lastKeyLatency = 0;

var paneItemState$ = null;

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this.disposables = new _atom.CompositeDisposable();
  }

  _createClass(Activation, [{
    key: 'activate',
    value: function activate() {
      paneItemState$ = new _rx2['default'].BehaviorSubject(null);
      this.disposables.add(_featureConfig2['default'].onDidChange('nuclide-health', function (event) {
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
  }, {
    key: 'dispose',
    value: function dispose() {
      this.disposables.dispose();
      paneItemState$ = null;
      if (viewTimeout !== null) {
        clearTimeout(viewTimeout);
        viewTimeout = null;
      }
      if (analyticsTimeout !== null) {
        clearTimeout(analyticsTimeout);
        analyticsTimeout = null;
      }
      if (activeEditorDisposables) {
        activeEditorDisposables.dispose();
        activeEditorDisposables = null;
      }
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (!activation) {
    activation = new Activation(state);
    activation.activate();
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}

function consumeStatusBar(statusBar) {
  statusBarItem = document.createElement('div');
  statusBarItem.className = 'inline-block nuclide-health';
  var tile = statusBar.addRightTile({
    item: statusBarItem,
    priority: -99 });
  // Quite far right.
  if (activation) {
    activation.disposables.add(atom.tooltips.add(statusBarItem, { title: 'Click the icon to display and configure Nuclide health stats.' }), new _atom.Disposable(function () {
      tile.destroy();
      if (statusBarItem) {
        var parentNode = statusBarItem.parentNode;
        if (parentNode) {
          parentNode.removeChild(statusBarItem);
        }
        _reactForAtom2['default'].unmountComponentAtNode(statusBarItem);
        statusBarItem = null;
      }
    }));
  }
}

function consumeGadgetsService(gadgetsApi) {
  (0, _assert2['default'])(paneItemState$);
  gadgets = gadgetsApi;
  var gadget = (0, _createHealthGadget2['default'])(paneItemState$);
  return gadgetsApi.registerGadget(gadget);
}

function disposeActiveEditorDisposables() {
  // Clear out any events & timing data from previous text editor.
  if (activeEditorDisposables != null) {
    activeEditorDisposables.dispose();
    activeEditorDisposables = null;
  }
}

function timeActiveEditorKeys() {
  disposeActiveEditorDisposables();
  activeEditorDisposables = new _atom.CompositeDisposable();

  // If option is enabled, start timing latency of keys on the new text editor.
  if (!currentConfig.showKeyLatency && !paneItem) {
    return;
  }

  // Ensure the editor is valid and there is a view to attatch the keypress timing to.
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

  activeEditorDisposables.add(
  // Remove the listener in a home-made disposable for when this editor is no-longer active.
  new _atom.Disposable(function () {
    return view.removeEventListener('keydown', startKeyClock);
  }),

  // stopKeyClock is fast so attatching it to onDidChange here is OK.
  // onDidStopChanging would be another option - any cost is deferred, but with far less fidelity.
  editor.onDidChange(stopKeyClock));
}

function updateViews() {
  if (!paneItemState$) {
    return;
  }

  var stats = getHealthStats();
  analyticsBuffer.push(stats);
  updateStatusBar(stats);
  paneItemState$.onNext({ stats: stats, activeHandleObjects: getActiveHandles() });
  if (currentConfig.viewTimeout) {
    if (viewTimeout !== null) {
      clearTimeout(viewTimeout);
    }
    viewTimeout = setTimeout(updateViews, currentConfig.viewTimeout * 1000);
  }
}

function updateStatusBar(stats) {
  if (!statusBarItem) {
    return;
  }
  var props = {};
  if (currentConfig.showCpu) {
    props.cpuPercentage = stats.cpuPercentage;
  }
  if (currentConfig.showHeap) {
    props.heapPercentage = stats.heapPercentage;
  }
  if (currentConfig.showMemory) {
    props.memory = stats.rss;
  }
  if (currentConfig.showKeyLatency) {
    props.lastKeyLatency = stats.lastKeyLatency;
  }
  if (currentConfig.showActiveHandles) {
    props.activeHandles = stats.activeHandles;
  }
  if (currentConfig.showActiveRequests) {
    props.activeRequests = stats.activeRequests;
  }

  var openHealthPane = function openHealthPane() {
    return gadgets && gadgets.showGadget('nuclide-health');
  };

  _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(_uiHealthStatusBarComponent2['default'], _extends({}, props, {
    onClickIcon: openHealthPane
  })), statusBarItem);
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
//# sourceMappingURL=data:application/json;base64,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QUFDMUMsTUFBSSxPQUFPLENBQUMsa0JBQWtCLEVBQUU7QUFDOUIsV0FBTyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztHQUNyQztBQUNELFNBQU8sRUFBRSxDQUFDO0NBQ1giLCJmaWxlIjoiSGVhbHRoUGFja2FnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtHYWRnZXRzU2VydmljZSwgR2FkZ2V0fSBmcm9tICcuLi8uLi9nYWRnZXRzLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0hlYWx0aFN0YXRzLCBTdGF0c1ZpZXdQcm9wc30gZnJvbSAnLi90eXBlcyc7XG5cbi8vIEltcG9ydHMgZnJvbSBub24tTnVjbGlkZSBtb2R1bGVzLlxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuLy8gSW1wb3J0cyBmcm9tIG90aGVyIE51Y2xpZGUgcGFja2FnZXMuXG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHthdG9tRXZlbnREZWJvdW5jZX0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL2ZlYXR1cmUtY29uZmlnJztcblxuLy8gSW1wb3J0cyBmcm9tIHdpdGhpbiB0aGlzIE51Y2xpZGUgcGFja2FnZS5cbmltcG9ydCBjcmVhdGVIZWFsdGhHYWRnZXQgZnJvbSAnLi9jcmVhdGVIZWFsdGhHYWRnZXQnO1xuaW1wb3J0IEhlYWx0aFN0YXR1c0JhckNvbXBvbmVudCBmcm9tICcuL3VpL0hlYWx0aFN0YXR1c0JhckNvbXBvbmVudCc7XG5cbi8vIFdlIG1heSBhcyB3ZWxsIGRlY2xhcmUgdGhlc2Ugb3V0c2lkZSBvZiBBY3RpdmF0aW9uIGJlY2F1c2UgbW9zdCBvZiB0aGVtIHJlYWxseSBhcmUgbnVsbGFibGUuXG5sZXQgY3VycmVudENvbmZpZyA9IHt9O1xubGV0IHN0YXR1c0Jhckl0ZW06ID9FbGVtZW50O1xubGV0IHBhbmVJdGVtOiA/SFRNTEVsZW1lbnQ7XG5sZXQgdmlld1RpbWVvdXQ6ID9udW1iZXIgPSBudWxsO1xubGV0IGFuYWx5dGljc1RpbWVvdXQ6ID9udW1iZXIgPSBudWxsO1xubGV0IGFuYWx5dGljc0J1ZmZlcjogQXJyYXk8SGVhbHRoU3RhdHM+ID0gW107XG5sZXQgZ2FkZ2V0czogP0dhZGdldHNTZXJ2aWNlID0gbnVsbDtcblxuLy8gVmFyaWFibGVzIGZvciB0cmFja2luZyB3aGVyZSBhbmQgd2hlbiBhIGtleSB3YXMgcHJlc3NlZCwgYW5kIHRoZSB0aW1lIGJlZm9yZSBpdCBoYWQgYW4gZWZmZWN0LlxubGV0IGFjdGl2ZUVkaXRvckRpc3Bvc2FibGVzOiA/Q29tcG9zaXRlRGlzcG9zYWJsZSA9IG51bGw7XG5sZXQga2V5RWRpdG9ySWQgPSAwO1xubGV0IGtleURvd25UaW1lID0gMDtcbmxldCBrZXlMYXRlbmN5ID0gMDtcbmxldCBsYXN0S2V5TGF0ZW5jeSA9IDA7XG5cbmxldCBwYW5lSXRlbVN0YXRlJDogP1J4LkJlaGF2aW9yU3ViamVjdCA9IG51bGw7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBkaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgcGFuZUl0ZW1TdGF0ZSQgPSBuZXcgUnguQmVoYXZpb3JTdWJqZWN0KG51bGwpO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgZmVhdHVyZUNvbmZpZy5vbkRpZENoYW5nZSgnbnVjbGlkZS1oZWFsdGgnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY3VycmVudENvbmZpZyA9IGV2ZW50Lm5ld1ZhbHVlO1xuICAgICAgICAvLyBJZiB1c2VyIGNoYW5nZXMgYW55IGNvbmZpZywgdXBkYXRlIHRoZSBoZWFsdGggLSBhbmQgcmVzZXQgdGhlIHBvbGxpbmcgY3ljbGVzLlxuICAgICAgICB1cGRhdGVWaWV3cygpO1xuICAgICAgICB1cGRhdGVBbmFseXRpY3MoKTtcbiAgICAgIH0pLFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShkaXNwb3NlQWN0aXZlRWRpdG9yRGlzcG9zYWJsZXMpLFxuICAgICAgYXRvbUV2ZW50RGVib3VuY2Uub25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSh0aW1lQWN0aXZlRWRpdG9yS2V5cyksXG4gICAgKTtcbiAgICBjdXJyZW50Q29uZmlnID0gZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtaGVhbHRoJyk7XG4gICAgdGltZUFjdGl2ZUVkaXRvcktleXMoKTtcbiAgICB1cGRhdGVWaWV3cygpO1xuICAgIHVwZGF0ZUFuYWx5dGljcygpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBwYW5lSXRlbVN0YXRlJCA9IG51bGw7XG4gICAgaWYgKHZpZXdUaW1lb3V0ICE9PSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodmlld1RpbWVvdXQpO1xuICAgICAgdmlld1RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoYW5hbHl0aWNzVGltZW91dCAhPT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KGFuYWx5dGljc1RpbWVvdXQpO1xuICAgICAgYW5hbHl0aWNzVGltZW91dCA9IG51bGw7XG4gICAgfVxuICAgIGlmIChhY3RpdmVFZGl0b3JEaXNwb3NhYmxlcykge1xuICAgICAgYWN0aXZlRWRpdG9yRGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgICAgYWN0aXZlRWRpdG9yRGlzcG9zYWJsZXMgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgICBhY3RpdmF0aW9uLmFjdGl2YXRlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyOiBhbnkpOiB2b2lkIHtcbiAgc3RhdHVzQmFySXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBzdGF0dXNCYXJJdGVtLmNsYXNzTmFtZSA9ICdpbmxpbmUtYmxvY2sgbnVjbGlkZS1oZWFsdGgnO1xuICBjb25zdCB0aWxlID0gc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7XG4gICAgaXRlbTogc3RhdHVzQmFySXRlbSxcbiAgICBwcmlvcml0eTogLTk5LCAvLyBRdWl0ZSBmYXIgcmlnaHQuXG4gIH0pO1xuICBpZiAoYWN0aXZhdGlvbikge1xuICAgIGFjdGl2YXRpb24uZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS50b29sdGlwcy5hZGQoXG4gICAgICAgIHN0YXR1c0Jhckl0ZW0sXG4gICAgICAgIHt0aXRsZTogJ0NsaWNrIHRoZSBpY29uIHRvIGRpc3BsYXkgYW5kIGNvbmZpZ3VyZSBOdWNsaWRlIGhlYWx0aCBzdGF0cy4nfVxuICAgICAgKSxcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgdGlsZS5kZXN0cm95KCk7XG4gICAgICAgIGlmIChzdGF0dXNCYXJJdGVtKSB7XG4gICAgICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHN0YXR1c0Jhckl0ZW0ucGFyZW50Tm9kZTtcbiAgICAgICAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdGF0dXNCYXJJdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShzdGF0dXNCYXJJdGVtKTtcbiAgICAgICAgICBzdGF0dXNCYXJJdGVtID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lR2FkZ2V0c1NlcnZpY2UoZ2FkZ2V0c0FwaTogR2FkZ2V0c1NlcnZpY2UpOiBEaXNwb3NhYmxlIHtcbiAgaW52YXJpYW50KHBhbmVJdGVtU3RhdGUkKTtcbiAgZ2FkZ2V0cyA9IGdhZGdldHNBcGk7XG4gIGNvbnN0IGdhZGdldDogR2FkZ2V0ID0gKGNyZWF0ZUhlYWx0aEdhZGdldChwYW5lSXRlbVN0YXRlJCk6IGFueSk7XG4gIHJldHVybiBnYWRnZXRzQXBpLnJlZ2lzdGVyR2FkZ2V0KGdhZGdldCk7XG59XG5cbmZ1bmN0aW9uIGRpc3Bvc2VBY3RpdmVFZGl0b3JEaXNwb3NhYmxlcygpOiB2b2lkIHtcbiAgLy8gQ2xlYXIgb3V0IGFueSBldmVudHMgJiB0aW1pbmcgZGF0YSBmcm9tIHByZXZpb3VzIHRleHQgZWRpdG9yLlxuICBpZiAoYWN0aXZlRWRpdG9yRGlzcG9zYWJsZXMgIT0gbnVsbCkge1xuICAgIGFjdGl2ZUVkaXRvckRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmVFZGl0b3JEaXNwb3NhYmxlcyA9IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gdGltZUFjdGl2ZUVkaXRvcktleXMoKTogdm9pZCB7XG4gIGRpc3Bvc2VBY3RpdmVFZGl0b3JEaXNwb3NhYmxlcygpO1xuICBhY3RpdmVFZGl0b3JEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgLy8gSWYgb3B0aW9uIGlzIGVuYWJsZWQsIHN0YXJ0IHRpbWluZyBsYXRlbmN5IG9mIGtleXMgb24gdGhlIG5ldyB0ZXh0IGVkaXRvci5cbiAgaWYgKCFjdXJyZW50Q29uZmlnLnNob3dLZXlMYXRlbmN5ICYmICFwYW5lSXRlbSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEVuc3VyZSB0aGUgZWRpdG9yIGlzIHZhbGlkIGFuZCB0aGVyZSBpcyBhIHZpZXcgdG8gYXR0YXRjaCB0aGUga2V5cHJlc3MgdGltaW5nIHRvLlxuICBjb25zdCBlZGl0b3I6ID9UZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICBpZiAoIWVkaXRvcikge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB2aWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcik7XG4gIGlmICghdmlldykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBjbG9jayB3aGVuIGEga2V5IGlzIHByZXNzZWQuIEZ1bmN0aW9uIGlzIG5hbWVkIHNvIGl0IGNhbiBiZSBkaXNwb3NlZCB3ZWxsLlxuICBjb25zdCBzdGFydEtleUNsb2NrID0gKCkgPT4ge1xuICAgIGlmIChlZGl0b3IpIHtcbiAgICAgIGtleUVkaXRvcklkID0gZWRpdG9yLmlkO1xuICAgICAga2V5RG93blRpbWUgPSBEYXRlLm5vdygpO1xuICAgIH1cbiAgfTtcblxuICAvLyBTdG9wIHRoZSBjbG9jayB3aGVuIHRoZSAoc2FtZSkgZWRpdG9yIGhhcyBjaGFuZ2VkIGNvbnRlbnQuXG4gIGNvbnN0IHN0b3BLZXlDbG9jayA9ICgpID0+IHtcbiAgICBpZiAoZWRpdG9yICYmIGVkaXRvci5pZCAmJiBrZXlFZGl0b3JJZCA9PT0gZWRpdG9yLmlkICYmIGtleURvd25UaW1lKSB7XG4gICAgICBrZXlMYXRlbmN5ID0gRGF0ZS5ub3coKSAtIGtleURvd25UaW1lO1xuICAgICAgLy8gUmVzZXQgc28gdGhhdCBzdWJzZXF1ZW50IG5vbi1rZXktaW5pdGlhdGVkIGJ1ZmZlciB1cGRhdGVzIGRvbid0IHByb2R1Y2Ugc2lsbHkgYmlnIG51bWJlcnMuXG4gICAgICBrZXlEb3duVGltZSA9IDA7XG4gICAgfVxuICB9O1xuXG4gIC8vIEFkZCB0aGUgbGlzdGVuZXIgdG8ga2V5ZG93bi5cbiAgdmlldy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc3RhcnRLZXlDbG9jayk7XG5cbiAgYWN0aXZlRWRpdG9yRGlzcG9zYWJsZXMuYWRkKFxuICAgIC8vIFJlbW92ZSB0aGUgbGlzdGVuZXIgaW4gYSBob21lLW1hZGUgZGlzcG9zYWJsZSBmb3Igd2hlbiB0aGlzIGVkaXRvciBpcyBuby1sb25nZXIgYWN0aXZlLlxuICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHN0YXJ0S2V5Q2xvY2spKSxcblxuICAgIC8vIHN0b3BLZXlDbG9jayBpcyBmYXN0IHNvIGF0dGF0Y2hpbmcgaXQgdG8gb25EaWRDaGFuZ2UgaGVyZSBpcyBPSy5cbiAgICAvLyBvbkRpZFN0b3BDaGFuZ2luZyB3b3VsZCBiZSBhbm90aGVyIG9wdGlvbiAtIGFueSBjb3N0IGlzIGRlZmVycmVkLCBidXQgd2l0aCBmYXIgbGVzcyBmaWRlbGl0eS5cbiAgICBlZGl0b3Iub25EaWRDaGFuZ2Uoc3RvcEtleUNsb2NrKSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVmlld3MoKTogdm9pZCB7XG4gIGlmICghcGFuZUl0ZW1TdGF0ZSQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBzdGF0cyA9IGdldEhlYWx0aFN0YXRzKCk7XG4gIGFuYWx5dGljc0J1ZmZlci5wdXNoKHN0YXRzKTtcbiAgdXBkYXRlU3RhdHVzQmFyKHN0YXRzKTtcbiAgcGFuZUl0ZW1TdGF0ZSQub25OZXh0KHtzdGF0cywgYWN0aXZlSGFuZGxlT2JqZWN0czogZ2V0QWN0aXZlSGFuZGxlcygpfSk7XG4gIGlmIChjdXJyZW50Q29uZmlnLnZpZXdUaW1lb3V0KSB7XG4gICAgaWYgKHZpZXdUaW1lb3V0ICE9PSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodmlld1RpbWVvdXQpO1xuICAgIH1cbiAgICB2aWV3VGltZW91dCA9IHNldFRpbWVvdXQodXBkYXRlVmlld3MsIGN1cnJlbnRDb25maWcudmlld1RpbWVvdXQgKiAxMDAwKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVTdGF0dXNCYXIoc3RhdHM6IEhlYWx0aFN0YXRzKTogdm9pZCB7XG4gIGlmICghc3RhdHVzQmFySXRlbSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBwcm9wczogU3RhdHNWaWV3UHJvcHMgPSB7fTtcbiAgaWYgKGN1cnJlbnRDb25maWcuc2hvd0NwdSkge1xuICAgIHByb3BzLmNwdVBlcmNlbnRhZ2UgPSBzdGF0cy5jcHVQZXJjZW50YWdlO1xuICB9XG4gIGlmIChjdXJyZW50Q29uZmlnLnNob3dIZWFwKSB7XG4gICAgcHJvcHMuaGVhcFBlcmNlbnRhZ2UgPSBzdGF0cy5oZWFwUGVyY2VudGFnZTtcbiAgfVxuICBpZiAoY3VycmVudENvbmZpZy5zaG93TWVtb3J5KSB7XG4gICAgcHJvcHMubWVtb3J5ID0gc3RhdHMucnNzO1xuICB9XG4gIGlmIChjdXJyZW50Q29uZmlnLnNob3dLZXlMYXRlbmN5KSB7XG4gICAgcHJvcHMubGFzdEtleUxhdGVuY3kgPSBzdGF0cy5sYXN0S2V5TGF0ZW5jeTtcbiAgfVxuICBpZiAoY3VycmVudENvbmZpZy5zaG93QWN0aXZlSGFuZGxlcykge1xuICAgIHByb3BzLmFjdGl2ZUhhbmRsZXMgPSBzdGF0cy5hY3RpdmVIYW5kbGVzO1xuICB9XG4gIGlmIChjdXJyZW50Q29uZmlnLnNob3dBY3RpdmVSZXF1ZXN0cykge1xuICAgIHByb3BzLmFjdGl2ZVJlcXVlc3RzID0gc3RhdHMuYWN0aXZlUmVxdWVzdHM7XG4gIH1cblxuICBjb25zdCBvcGVuSGVhbHRoUGFuZSA9ICgpID0+IGdhZGdldHMgJiYgZ2FkZ2V0cy5zaG93R2FkZ2V0KCdudWNsaWRlLWhlYWx0aCcpO1xuXG4gIFJlYWN0LnJlbmRlcihcbiAgICA8SGVhbHRoU3RhdHVzQmFyQ29tcG9uZW50XG4gICAgICB7Li4ucHJvcHN9XG4gICAgICBvbkNsaWNrSWNvbj17b3BlbkhlYWx0aFBhbmV9XG4gICAgLz4sXG4gICAgc3RhdHVzQmFySXRlbVxuICApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVBbmFseXRpY3MoKTogdm9pZCB7XG4gIGlmIChhbmFseXRpY3NCdWZmZXIubGVuZ3RoID4gMCkge1xuICAgIC8vIEFnZ3JlZ2F0ZXMgdGhlIGJ1ZmZlcmVkIHN0YXRzIHVwIGJ5IHN1ZmZpeGluZyBhdmcsIG1pbiwgbWF4IHRvIHRoZWlyIG5hbWVzLlxuICAgIGNvbnN0IGFnZ3JlZ2F0ZVN0YXRzID0ge307XG5cbiAgICAvLyBBbGwgYW5hbHl0aWNzQnVmZmVyIGVudHJpZXMgaGF2ZSB0aGUgc2FtZSBrZXlzOyB3ZSB1c2UgdGhlIGZpcnN0IGVudHJ5IHRvIGtub3cgd2hhdCB0aGV5IGFyZS5cbiAgICBPYmplY3Qua2V5cyhhbmFseXRpY3NCdWZmZXJbMF0pLmZvckVhY2goc3RhdHNLZXkgPT4ge1xuICAgICAgaWYgKHN0YXRzS2V5ID09PSAnbGFzdEtleUxhdGVuY3knKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gVGhpcyBmaWVsZCBpcyBvbmx5IHVzZWQgdG8gZm9yIGEgc3RpY2t5IHZhbHVlIGluIHRoZSBzdGF0dXMgYmFyLCBhbmQgaXMgbm90IHRvIGJlIHNlbnQuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFnZ3JlZ2F0ZXMgPSBhZ2dyZWdhdGUoXG4gICAgICAgIGFuYWx5dGljc0J1ZmZlci5tYXAoc3RhdHMgPT4gc3RhdHNbc3RhdHNLZXldKSxcbiAgICAgICAgKHN0YXRzS2V5ID09PSAna2V5TGF0ZW5jeScpLCAvLyBza2lwWmVyb3M6IERvbid0IHVzZSBlbXB0eSBrZXkgbGF0ZW5jeSB2YWx1ZXMgaW4gYWdncmVnYXRlcy5cbiAgICAgICk7XG4gICAgICBPYmplY3Qua2V5cyhhZ2dyZWdhdGVzKS5mb3JFYWNoKGFnZ3JlZ2F0ZXNLZXkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGFnZ3JlZ2F0ZXNbYWdncmVnYXRlc0tleV07XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYWdncmVnYXRlU3RhdHNbYCR7c3RhdHNLZXl9XyR7YWdncmVnYXRlc0tleX1gXSA9IHZhbHVlLnRvRml4ZWQoMik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRyYWNrKCdudWNsaWRlLWhlYWx0aCcsIGFnZ3JlZ2F0ZVN0YXRzKTtcbiAgICBhbmFseXRpY3NCdWZmZXIgPSBbXTtcbiAgfVxuXG4gIGlmIChjdXJyZW50Q29uZmlnLmFuYWx5dGljc1RpbWVvdXQpIHtcbiAgICBpZiAoYW5hbHl0aWNzVGltZW91dCAhPT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KGFuYWx5dGljc1RpbWVvdXQpO1xuICAgIH1cbiAgICBhbmFseXRpY3NUaW1lb3V0ID0gc2V0VGltZW91dCh1cGRhdGVBbmFseXRpY3MsIGN1cnJlbnRDb25maWcuYW5hbHl0aWNzVGltZW91dCAqIDYwICogMTAwMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWdncmVnYXRlKFxuICB2YWx1ZXM6IEFycmF5PG51bWJlcj4sXG4gIHNraXBaZXJvczogYm9vbGVhbiA9IGZhbHNlLFxuKToge2F2ZzogP251bWJlciwgbWluOiA/bnVtYmVyLCBtYXg6ID9udW1iZXJ9IHtcbiAgLy8gU29tZSB2YWx1ZXMgKGxpa2UgbWVtb3J5IHVzYWdlKSBtaWdodCBiZSB2ZXJ5IGhpZ2ggJiBudW1lcm91cywgc28gYXZvaWQgc3VtbWluZyB0aGVtIGFsbCB1cC5cbiAgaWYgKHNraXBaZXJvcykge1xuICAgIHZhbHVlcyA9IHZhbHVlcy5maWx0ZXIodmFsdWUgPT4gdmFsdWUgIT09IDApO1xuICAgIGlmICh2YWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4ge2F2ZzogbnVsbCwgbWluOiBudWxsLCBtYXg6IG51bGx9O1xuICAgIH1cbiAgfVxuICBjb25zdCBhdmcgPSB2YWx1ZXMucmVkdWNlKChwcmV2VmFsdWUsIGN1cnJWYWx1ZSwgaW5kZXgpID0+IHtcbiAgICByZXR1cm4gcHJldlZhbHVlICsgKGN1cnJWYWx1ZSAtIHByZXZWYWx1ZSkgLyAoaW5kZXggKyAxKTtcbiAgfSwgMCk7XG4gIGNvbnN0IG1pbiA9IE1hdGgubWluKC4uLnZhbHVlcyk7XG4gIGNvbnN0IG1heCA9IE1hdGgubWF4KC4uLnZhbHVlcyk7XG4gIHJldHVybiB7YXZnLCBtaW4sIG1heH07XG59XG5cbmZ1bmN0aW9uIGdldEhlYWx0aFN0YXRzKCk6IEhlYWx0aFN0YXRzIHtcbiAgY29uc3Qgc3RhdHMgPSBwcm9jZXNzLm1lbW9yeVVzYWdlKCk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJTUywgaGVhcCBhbmQgdXNhZ2UuXG5cbiAgaWYgKGtleUxhdGVuY3kpIHtcbiAgICBsYXN0S2V5TGF0ZW5jeSA9IGtleUxhdGVuY3k7XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSB7XG4gICAgLi4uc3RhdHMsXG4gICAgaGVhcFBlcmNlbnRhZ2U6ICgxMDAgKiBzdGF0cy5oZWFwVXNlZCAvIHN0YXRzLmhlYXBUb3RhbCksICAgLy8gSnVzdCBmb3IgY29udmVuaWVuY2UuXG4gICAgY3B1UGVyY2VudGFnZTogb3MubG9hZGF2ZygpWzBdLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMSBtaW51dGUgQ1BVIGF2ZXJhZ2UuXG4gICAgbGFzdEtleUxhdGVuY3ksXG4gICAga2V5TGF0ZW5jeSxcbiAgICBhY3RpdmVIYW5kbGVzOiBnZXRBY3RpdmVIYW5kbGVzKCkubGVuZ3RoLFxuICAgIGFjdGl2ZVJlcXVlc3RzOiBnZXRBY3RpdmVSZXF1ZXN0cygpLmxlbmd0aCxcbiAgfTtcblxuICBrZXlMYXRlbmN5ID0gMDsgLy8gV2Ugb25seSB3YW50IHRvIGV2ZXIgcmVjb3JkIGEga2V5IGxhdGVuY3kgdGltZSBvbmNlLCBhbmQgc28gd2UgcmVzZXQgaXQuXG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gVGhlc2UgdHdvIGZ1bmN0aW9ucyBhcmUgdG8gZGVmZW5kIGFnYWluc3QgdW5kb2N1bWVudGVkIE5vZGUgZnVuY3Rpb25zLlxuZnVuY3Rpb24gZ2V0QWN0aXZlSGFuZGxlcygpOiBBcnJheTxPYmplY3Q+IHtcbiAgaWYgKHByb2Nlc3MuX2dldEFjdGl2ZUhhbmRsZXMpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5fZ2V0QWN0aXZlSGFuZGxlcygpO1xuICB9XG4gIHJldHVybiBbXTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aXZlUmVxdWVzdHMoKTogQXJyYXk8T2JqZWN0PiB7XG4gIGlmIChwcm9jZXNzLl9nZXRBY3RpdmVSZXF1ZXN0cykge1xuICAgIHJldHVybiBwcm9jZXNzLl9nZXRBY3RpdmVSZXF1ZXN0cygpO1xuICB9XG4gIHJldHVybiBbXTtcbn1cbiJdfQ==