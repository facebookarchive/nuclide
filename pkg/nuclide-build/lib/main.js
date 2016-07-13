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
exports.provideBuildSystemRegistry = provideBuildSystemRegistry;
exports.serialize = serialize;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomSyncAtomCommands2;

function _commonsAtomSyncAtomCommands() {
  return _commonsAtomSyncAtomCommands2 = _interopRequireDefault(require('../../commons-atom/sync-atom-commands'));
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _applyActionMiddleware2;

function _applyActionMiddleware() {
  return _applyActionMiddleware2 = require('./applyActionMiddleware');
}

var _Commands2;

function _Commands() {
  return _Commands2 = require('./Commands');
}

var _createStateStream2;

function _createStateStream() {
  return _createStateStream2 = require('./createStateStream');
}

var _createEmptyAppState2;

function _createEmptyAppState() {
  return _createEmptyAppState2 = require('./createEmptyAppState');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var disposables = null;
var _commands = null;
var _states = null;

function activate(rawState) {
  (0, (_assert2 || _assert()).default)(disposables == null);
  (0, (_assert2 || _assert()).default)(_commands == null);

  var initialState = _extends({}, (0, (_createEmptyAppState2 || _createEmptyAppState()).createEmptyAppState)(), rawState || {});

  var rawActions = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Subject();
  var actions = (0, (_applyActionMiddleware2 || _applyActionMiddleware()).applyActionMiddleware)(rawActions, function () {
    return states.getValue();
  });
  var states = _states = (0, (_createStateStream2 || _createStateStream()).createStateStream)(actions, initialState);
  var dispatch = function dispatch(action) {
    rawActions.next(action);
  };
  var commands = _commands = new (_Commands2 || _Commands()).Commands(dispatch, function () {
    return states.getValue();
  });

  // Add the panel.
  commands.createPanel(states);

  disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
    commands.destroyPanel();
  }), new (_atom2 || _atom()).Disposable(function () {
    _commands = null;
    _states = null;
  }), atom.commands.add('atom-workspace', {
    'nuclide-build:toggle-toolbar-visibility': function nuclideBuildToggleToolbarVisibility(event) {
      var visible = event.detail == null ? undefined : event.detail.visible;
      if (typeof visible === 'boolean') {
        commands.setToolbarVisibility(visible);
      } else {
        commands.toggleToolbarVisibility();
      }
    }
  }),

  // Update the Atom palette commands to match our currently enabled tasks.
  (0, (_commonsAtomSyncAtomCommands2 || _commonsAtomSyncAtomCommands()).default)(states.debounceTime(500).map(function (state) {
    return state.tasks;
  }).distinctUntilChanged().map(function (tasks) {
    return new Set(tasks.filter(function (task) {
      return task.enabled;
    }).map(function (task) {
      return task.type;
    }));
  }), function (taskType) {
    return {
      'atom-workspace': _defineProperty({}, 'nuclide-build:' + taskType, function () {
        commands.runTask(taskType);
      })
    };
  }),

  // Add Atom palette commands for selecting the build system.
  (0, (_commonsAtomSyncAtomCommands2 || _commonsAtomSyncAtomCommands()).default)(states.debounceTime(500).map(function (state) {
    return state.buildSystems;
  }).distinctUntilChanged().map(function (buildSystems) {
    return new Set(buildSystems.values());
  }), function (buildSystem) {
    return {
      'atom-workspace': _defineProperty({}, 'nuclide-build:select-' + buildSystem.name + '-build-system', function () {
        commands.selectBuildSystem(buildSystem.id);
      })
    };
  }),

  // Track Build events.
  new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription((0, (_commonsNodeStream2 || _commonsNodeStream()).compact)(actions.map(function (action) {
    switch (action.type) {
      case (_ActionTypes2 || _ActionTypes()).TASK_STARTED:
        return createTrackingEvent('nuclide-build:task-started', action, states.getValue());
      case (_ActionTypes2 || _ActionTypes()).TASK_STOPPED:
        return createTrackingEvent('nuclide-build:task-stopped', action, states.getValue());
      case (_ActionTypes2 || _ActionTypes()).TASK_COMPLETED:
        return createTrackingEvent('nuclide-build:task-completed', action, states.getValue());
      case (_ActionTypes2 || _ActionTypes()).TASK_ERRORED:
        return createTrackingEvent('nuclide-build:task-errored', action, states.getValue());
      default:
        return null;
    }
  })).subscribe(function (event) {
    (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackEvent)(event);
  })),

  // Update the actions whenever the build system changes. This is a little weird because state
  // changes are triggering commands that trigger state changes. Maybe there's a better place to
  // do this?
  new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(states.map(function (state) {
    return state.activeBuildSystemId;
  }).distinctUntilChanged().subscribe(function () {
    commands.refreshTasks();
  })));
}

function deactivate() {
  (0, (_assert2 || _assert()).default)(disposables != null);
  disposables.dispose();
  disposables = null;
}

function consumeToolBar(getToolBar) {
  (0, (_assert2 || _assert()).default)(disposables != null);
  var toolBar = getToolBar('nuclide-build');

  var _toolBar$addButton = toolBar.addButton({
    callback: 'nuclide-build:toggle-toolbar-visibility',
    tooltip: 'Toggle Build Toolbar',
    iconset: 'ion',
    icon: 'hammer',
    priority: 499.5
  });

  var element = _toolBar$addButton.element;

  element.className += ' nuclide-build-tool-bar-button';

  (0, (_assert2 || _assert()).default)(_states != null);

  var buttonUpdatesDisposable = new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(_states.subscribe(function (state) {
    if (state.buildSystems.size > 0) {
      element.removeAttribute('hidden');
    } else {
      element.setAttribute('hidden', 'hidden');
    }
  }));

  // Remove the button from the toolbar.
  var buttonPresenceDisposable = new (_atom2 || _atom()).Disposable(function () {
    toolBar.removeItems();
  });

  // If this package is disabled, stop updating the button and remove it from the toolbar.
  disposables.add(buttonUpdatesDisposable, buttonPresenceDisposable);

  // If tool-bar is disabled, stop updating the button state and remove tool-bar related cleanup
  // from this package's disposal actions.
  return new (_atom2 || _atom()).Disposable(function () {
    buttonUpdatesDisposable.dispose();
    if (disposables != null) {
      disposables.remove(buttonUpdatesDisposable);
      disposables.remove(buttonPresenceDisposable);
    }
  });
}

function provideBuildSystemRegistry() {
  return {
    register: function register(buildSystem) {
      if (_commands != null) {
        _commands.registerBuildSystem(buildSystem);
      }
      return new (_atom2 || _atom()).Disposable(function () {
        if (_commands != null) {
          _commands.unregisterBuildSystem(buildSystem);
        }
      });
    }
  };
}

function serialize() {
  (0, (_assert2 || _assert()).default)(_states != null);
  var state = _states.getValue();
  return {
    previousSessionActiveBuildSystemId: state.activeBuildSystemId || state.previousSessionActiveBuildSystemId,
    previousSessionActiveTaskType: state.activeTaskType || state.previousSessionActiveTaskType,
    visible: state.visible
  };
}

function getDistractionFreeModeProvider() {
  return {
    name: 'nuclide-build',
    isVisible: function isVisible() {
      return (0, (_assert2 || _assert()).default)(_states != null), _states.getValue().visible;
    },
    toggle: function toggle() {
      (0, (_assert2 || _assert()).default)(_commands != null);
      _commands.toggleToolbarVisibility();
    }
  };
}

// Exported for testing :'(
var _getCommands = function _getCommands() {
  return _commands;
};

exports._getCommands = _getCommands;
function createTrackingEvent(type, action, state) {
  var taskInfo = action.payload.taskInfo;
  var taskTrackingData = taskInfo != null && taskInfo.getTrackingData != null ? taskInfo.getTrackingData() : {};
  var error = action.type === (_ActionTypes2 || _ActionTypes()).TASK_ERRORED ? action.payload.error : null;
  return {
    type: type,
    data: _extends({}, taskTrackingData, {
      buildSystemId: state.activeBuildSystemId,
      taskType: state.activeTaskType,
      errorMessage: error != null ? error.message : null,
      stackTrace: error != null ? String(error.stack) : null
    })
  };
}