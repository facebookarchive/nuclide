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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideAtomHelpers2;

function _nuclideAtomHelpers() {
  return _nuclideAtomHelpers2 = require('../../nuclide-atom-helpers');
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var disposables = null;
var _commands = null;
var _states = null;

function activate(rawState) {
  (0, (_assert2 || _assert()).default)(disposables == null);
  (0, (_assert2 || _assert()).default)(_commands == null);

  var _require = require('./applyActionMiddleware');

  var applyActionMiddleware = _require.applyActionMiddleware;

  var _require2 = require('./Commands');

  var Commands = _require2.Commands;

  var _require3 = require('./createStateStream');

  var createStateStream = _require3.createStateStream;

  var _require4 = require('./createEmptyAppState');

  var createEmptyAppState = _require4.createEmptyAppState;

  var Rx = require('rxjs');

  var initialState = _extends({}, createEmptyAppState(), rawState || {});

  var actions = new Rx.Subject();
  var states = _states = createStateStream(applyActionMiddleware(actions, function () {
    return states.getValue();
  }), initialState);
  var dispatch = function dispatch(action) {
    actions.next(action);
  };
  var commands = _commands = new Commands(dispatch, function () {
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
    'nuclide-build:toggle-toolbar-visibility': function nuclideBuildToggleToolbarVisibility() {
      commands.toggleToolbarVisibility();
    }
  }),

  // Update the Atom palette commands to match our tasks.
  (0, (_nuclideAtomHelpers2 || _nuclideAtomHelpers()).syncAtomCommands)(states.debounceTime(500).map(function (state) {
    return state.tasks;
  }).distinctUntilChanged().map(function (tasks) {
    return new Set(tasks.map(function (task) {
      return task.type;
    }));
  }), function (taskType) {
    return {
      'atom-workspace': _defineProperty({}, 'nuclide-build:' + taskType, function () {
        commands.runTask(taskType);
      })
    };
  }),

  // Update the actions whenever the build system changes. This is a little weird because state
  // changes are triggering commands that trigger state changes. Maybe there's a better place to
  // do this?
  new (_nuclideCommons2 || _nuclideCommons()).DisposableSubscription(states.map(function (state) {
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

  var buttonUpdatesDisposable = new (_nuclideCommons2 || _nuclideCommons()).DisposableSubscription(_states.subscribe(function (state) {
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