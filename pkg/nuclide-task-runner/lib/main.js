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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

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

var _commonsAtomPanelRenderer2;

function _commonsAtomPanelRenderer() {
  return _commonsAtomPanelRenderer2 = _interopRequireDefault(require('../../commons-atom/PanelRenderer'));
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _commonsNodeReduxObservable2;

function _commonsNodeReduxObservable() {
  return _commonsNodeReduxObservable2 = require('../../commons-node/redux-observable');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
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

var _reduxSelectors2;

function _reduxSelectors() {
  return _reduxSelectors2 = require('./redux/Selectors');
}

var _reduxReducers2;

function _reduxReducers() {
  return _reduxReducers2 = _interopRequireWildcard(require('./redux/Reducers'));
}

var _uiCreatePanelItem2;

function _uiCreatePanelItem() {
  return _uiCreatePanelItem2 = require('./ui/createPanelItem');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nullthrows2;

function _nullthrows() {
  return _nullthrows2 = _interopRequireDefault(require('nullthrows'));
}

var _redux2;

function _redux() {
  return _redux2 = require('redux');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
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
    var states = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(this._store);
    this._actionCreators = (0, (_redux2 || _redux()).bindActionCreators)(_reduxActions2 || _reduxActions(), this._store.dispatch);
    this._panelRenderer = new (_commonsAtomPanelRenderer2 || _commonsAtomPanelRenderer()).default({
      location: 'top',
      createItem: function createItem() {
        return (0, (_uiCreatePanelItem2 || _uiCreatePanelItem()).createPanelItem)(_this._store);
      }
    });

    this._disposables = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(this._panelRenderer, atom.commands.add('atom-workspace', {
      'nuclide-task-runner:toggle-toolbar-visibility': function nuclideTaskRunnerToggleToolbarVisibility(event) {
        var visible = event.detail != null && typeof event.detail === 'object' ? event.detail.visible : undefined;
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

    // Add a command for each task type. If there's more than one of the same type runnable, the
    // first is used.
    // TODO: Instead, prompt user for which to use and remember their choice.
    (0, (_commonsAtomSyncAtomCommands2 || _commonsAtomSyncAtomCommands()).default)(states.debounceTime(500).map(function (state) {
      return state.taskLists;
    }).distinctUntilChanged().map(function (taskLists) {
      var _Array$prototype;

      var allTasks = (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, _toConsumableArray(Array.from(taskLists.values())));
      var types = allTasks.filter(function (taskMeta) {
        return taskMeta.runnable;
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
              if (taskMeta.runnable && taskMeta.type === taskType) {
                _this._actionCreators.runTask(taskMeta);
                return;
              }
            }
          }
        })
      };
    }),

    // Add a command for each individual task ID.
    (0, (_commonsAtomSyncAtomCommands2 || _commonsAtomSyncAtomCommands()).default)(states.debounceTime(500).map(function (state) {
      return state.taskLists;
    }).distinctUntilChanged().map(function (taskLists) {
      var state = _this._store.getState();
      var taskIds = new Set();
      for (var _ref3 of taskLists) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var taskRunnerId = _ref2[0];
        var taskList = _ref2[1];

        var taskRunnerName = (0, (_nullthrows2 || _nullthrows()).default)(state.taskRunners.get(taskRunnerId)).name;
        for (var taskMeta of taskList) {
          taskIds.add({ taskRunnerId: taskRunnerId, taskRunnerName: taskRunnerName, type: taskMeta.type });
        }
      }
      return taskIds;
    }), function (taskId) {
      return {
        'atom-workspace': _defineProperty({}, 'nuclide-task-runner:' + taskId.taskRunnerName + '-' + taskId.type, function () {
          _this._actionCreators.runTask(taskId);
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
    }), states.map(function (state) {
      return state.visible;
    }).distinctUntilChanged().subscribe(function (visible) {
      _this._panelRenderer.render({ visible: visible });
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

      var buttonUpdatesDisposable = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(
      // $FlowFixMe: Update rx defs to accept ish with Symbol.observable
      (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(this._store).subscribe(function (state) {
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
  var taskTrackingData = task != null && typeof task.getTrackingData === 'function' ? task.getTrackingData() : {};
  var error = action.type === (_reduxActions2 || _reduxActions()).TASK_ERRORED ? action.payload.error : null;
  var activeTaskId = (0, (_reduxSelectors2 || _reduxSelectors()).getActiveTaskId)(state);
  (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackEvent)({
    type: type,
    data: _extends({}, taskTrackingData, {
      taskRunnerId: activeTaskId && activeTaskId.taskRunnerId,
      taskType: activeTaskId && activeTaskId.type,
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