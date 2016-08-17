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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomSyncAtomCommands2;

function _commonsAtomSyncAtomCommands() {
  return _commonsAtomSyncAtomCommands2 = _interopRequireDefault(require('../../commons-atom/sync-atom-commands'));
}

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _commonsNodeReduxObservable2;

function _commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable2 = require('../../commons-node/redux-observable');
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _createEmptyAppState2;

function _createEmptyAppState() {
  return _createEmptyAppState2 = require('./createEmptyAppState');
}

var _reduxActions2;

function _reduxActions() {
  return _reduxActions2 = _interopRequireWildcard(require('./redux/Actions'));
}

var _reduxEpics2;

function _reduxEpics() {
  return _reduxEpics2 = _interopRequireWildcard(require('./redux/Epics'));
}

var _reduxReducers2;

function _reduxReducers() {
  return _reduxReducers2 = _interopRequireWildcard(require('./redux/Reducers'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _redux2;

function _redux() {
  return _redux2 = require('redux');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    var initialState = _extends({}, (0, (_createEmptyAppState2 || _createEmptyAppState()).createEmptyAppState)(), rawState || {});

    var epics = Object.keys(_reduxEpics2 || _reduxEpics()).map(function (k) {
      return (_reduxEpics2 || _reduxEpics())[k];
    }).filter(function (epic) {
      return typeof epic === 'function';
    });
    var rootEpic = (0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).combineEpics).apply(undefined, _toConsumableArray(epics));
    this._store = (0, (_redux2 || _redux()).createStore)((_reduxReducers2 || _reduxReducers()).app, initialState, (0, (_redux2 || _redux()).applyMiddleware)((0, (_commonsNodeReduxObservable2 || _commonsNodeReduxObservable()).createEpicMiddleware)(rootEpic), trackingMiddleware));
    var states = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.from(this._store);
    this._actionCreators = (0, (_redux2 || _redux()).bindActionCreators)(_reduxActions2 || _reduxActions(), this._store.dispatch);

    // Add the panel.
    // TODO: Defer this. We can subscribe to store and do this the first time visible === true
    this._actionCreators.createPanel(this._store);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
      _this._actionCreators.destroyPanel();
    }), atom.commands.add('atom-workspace', {
      'nuclide-task-runner:toggle-toolbar-visibility': function nuclideTaskRunnerToggleToolbarVisibility(event) {
        var visible = event.detail == null ? undefined : event.detail.visible;
        if (typeof visible === 'boolean') {
          _this._actionCreators.setToolbarVisibility(visible);
        } else {
          _this._actionCreators.toggleToolbarVisibility();
        }
      },
      'nuclide-task-runner:run-selected-task': function nuclideTaskRunnerRunSelectedTask(event) {
        var detail = event != null ? event.detail : null;
        var taskId = detail != null && detail.taskRunnerId && detail.type ? detail : null;
        _this._actionCreators.runTask(taskId);
      }
    }),

    // Add a command for each task type. If there's more than one of the same type enabled, the
    // first is used.
    // TODO: Instead, prompt user for which to use and remember their choice.
    (0, (_commonsAtomSyncAtomCommands2 || _commonsAtomSyncAtomCommands()).default)(states.debounceTime(500).map(function (state) {
      return state.taskLists;
    }).distinctUntilChanged().map(function (taskLists) {
      var _Array$prototype;

      var allTasks = (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, _toConsumableArray(Array.from(taskLists.values())));
      var types = allTasks.filter(function (taskMeta) {
        return taskMeta.enabled;
      }).map(function (taskMeta) {
        return taskMeta.type;
      });
      return new Set(types);
    }), function (taskType) {
      return {
        'atom-workspace': _defineProperty({}, 'nuclide-task-runner:' + taskType, function () {
          var state = _this._store.getState();
          var activeTaskId = state.activeTaskId;
          var taskRunners = state.taskRunners;

          var taskRunnerIds = Array.from(taskRunners.keys());
          // Give precedence to the task runner of the selected task.
          if (activeTaskId != null) {
            (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayRemove)(taskRunnerIds, activeTaskId.taskRunnerId);
            taskRunnerIds.unshift(activeTaskId.taskRunnerId);
          }
          for (var taskRunnerId of taskRunnerIds) {
            var taskList = state.taskLists.get(taskRunnerId);
            if (taskList == null) {
              continue;
            }
            for (var taskMeta of taskList) {
              if (taskMeta.enabled && taskMeta.type === taskType) {
                _this._actionCreators.runTask(taskMeta);
                return;
              }
            }
          }
        })
      };
    }),

    // Add a toggle command for each task runner.
    (0, (_commonsAtomSyncAtomCommands2 || _commonsAtomSyncAtomCommands()).default)(states.debounceTime(500).map(function (state) {
      return state.taskRunners;
    }).distinctUntilChanged().map(function (taskRunners) {
      return new Set(taskRunners.values());
    }), function (taskRunner) {
      return {
        'atom-workspace': _defineProperty({}, 'nuclide-task-runner:toggle-' + taskRunner.name + '-toolbar', function () {
          _this._actionCreators.toggleToolbarVisibility(taskRunner.id);
        })
      };
    }, function (taskRunner) {
      return taskRunner.id;
    }));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeCurrentWorkingDirectory',
    value: function consumeCurrentWorkingDirectory(api) {
      var _this2 = this;

      this._disposables.add(api.observeCwd(function (directory) {
        _this2._actionCreators.setProjectRoot(directory);
      }));
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var _this3 = this;

      var toolBar = getToolBar('nuclide-task-runner');

      var _toolBar$addButton = toolBar.addButton({
        callback: 'nuclide-task-runner:toggle-toolbar-visibility',
        tooltip: 'Toggle Task Runner Toolbar',
        iconset: 'ion',
        icon: 'play',
        priority: 499.5
      });

      var element = _toolBar$addButton.element;

      element.className += ' nuclide-task-runner-tool-bar-button';

      var buttonUpdatesDisposable = new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(
      // $FlowFixMe: Update rx defs to accept ish with Symbol.observable
      (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.from(this._store).subscribe(function (state) {
        if (state.taskRunners.size > 0) {
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
      this._disposables.add(buttonUpdatesDisposable, buttonPresenceDisposable);

      // If tool-bar is disabled, stop updating the button state and remove tool-bar related cleanup
      // from this package's disposal actions.
      return new (_atom2 || _atom()).Disposable(function () {
        buttonUpdatesDisposable.dispose();
        _this3._disposables.remove(buttonUpdatesDisposable);
        _this3._disposables.remove(buttonPresenceDisposable);
      });
    }
  }, {
    key: 'provideTaskRunnerServiceApi',
    value: function provideTaskRunnerServiceApi() {
      var pkg = this;
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        pkg = null;
      }));
      return {
        register: function register(taskRunner) {
          (0, (_assert2 || _assert()).default)(pkg != null, 'Task runner service API used after deactivation');
          pkg._actionCreators.registerTaskRunner(taskRunner);
          return new (_atom2 || _atom()).Disposable(function () {
            if (pkg != null) {
              pkg._actionCreators.unregisterTaskRunner(taskRunner);
            }
          });
        }
      };
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      var state = this._store.getState();
      return {
        previousSessionActiveTaskId: state.activeTaskId || state.previousSessionActiveTaskId,
        visible: state.visible
      };
    }
  }, {
    key: 'getDistractionFreeModeProvider',
    value: function getDistractionFreeModeProvider() {
      var pkg = this;
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        pkg = null;
      }));
      return {
        name: 'nuclide-task-runner',
        isVisible: function isVisible() {
          (0, (_assert2 || _assert()).default)(pkg != null);
          return pkg._store.getState().visible;
        },
        toggle: function toggle() {
          (0, (_assert2 || _assert()).default)(pkg != null);
          pkg._actionCreators.toggleToolbarVisibility();
        }
      };
    }

    // Exported for testing :'(
  }, {
    key: '_getCommands',
    value: function _getCommands() {
      return this._actionCreators;
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);

function trackTaskAction(type, action, state) {
  var task = action.payload.task;
  var taskTrackingData = task != null && task.getTrackingData != null ? task.getTrackingData() : {};
  var error = action.type === (_reduxActions2 || _reduxActions()).TASK_ERRORED ? action.payload.error : null;
  (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackEvent)({
    type: type,
    data: _extends({}, taskTrackingData, {
      taskRunnerId: state.activeTaskId && state.activeTaskId.taskRunnerId,
      taskType: state.activeTaskId && state.activeTaskId.type,
      errorMessage: error != null ? error.message : null,
      stackTrace: error != null ? String(error.stack) : null
    })
  });
}

var trackingMiddleware = function trackingMiddleware(store) {
  return function (next) {
    return function (action) {
      switch (action.type) {
        case (_reduxActions2 || _reduxActions()).TASK_STARTED:
          trackTaskAction('nuclide-task-runner:task-started', action, store.getState());
          break;
        case (_reduxActions2 || _reduxActions()).TASK_STOPPED:
          trackTaskAction('nuclide-task-runner:task-stopped', action, store.getState());
          break;
        case (_reduxActions2 || _reduxActions()).TASK_COMPLETED:
          trackTaskAction('nuclide-task-runner:task-completed', action, store.getState());
          break;
        case (_reduxActions2 || _reduxActions()).TASK_ERRORED:
          trackTaskAction('nuclide-task-runner:task-errored', action, store.getState());
          break;
      }
      return next(action);
    };
  };
};
module.exports = exports.default;