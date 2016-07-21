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

exports.createPanelEpic = createPanelEpic;
exports.destroyPanelEpic = destroyPanelEpic;
exports.registerTaskRunnerEpic = registerTaskRunnerEpic;
exports.runTaskEpic = runTaskEpic;
exports.setProjectRootEpic = setProjectRootEpic;
exports.setToolbarVisibilityEpic = setToolbarVisibilityEpic;
exports.stopTaskEpic = stopTaskEpic;
exports.toggleToolbarVisibilityEpic = toggleToolbarVisibilityEpic;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../../commons-node/event');
}

var _commonsNodeOnce2;

function _commonsNodeOnce() {
  return _commonsNodeOnce2 = _interopRequireDefault(require('../../../commons-node/once'));
}

var _nuclideUiLibBindObservableAsProps2;

function _nuclideUiLibBindObservableAsProps() {
  return _nuclideUiLibBindObservableAsProps2 = require('../../../nuclide-ui/lib/bindObservableAsProps');
}

var _uiToolbar2;

function _uiToolbar() {
  return _uiToolbar2 = require('../ui/Toolbar');
}

var _getActiveTaskRunner2;

function _getActiveTaskRunner() {
  return _getActiveTaskRunner2 = require('../getActiveTaskRunner');
}

var _getTask2;

function _getTask() {
  return _getTask2 = require('../getTask');
}

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

// We expect a store here because we want to subscribe to it. The one we get as an argument if we
// return a function here doesn't have Symbol.observable.

function createPanelEpic(actions) {
  return actions.ofType((_Actions2 || _Actions()).CREATE_PANEL).map(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).CREATE_PANEL);

    // Ideally we would just use the store that's passed to the epic (and not have to include
    // it with the action), however that store doesn't have the full functionality (see
    // @reactjs/redux#1834)
    var store = action.payload.store;

    var staticProps = {
      runTask: function runTask(task) {
        store.dispatch((_Actions2 || _Actions()).runTask(task));
      },
      selectTask: function selectTask(task) {
        store.dispatch((_Actions2 || _Actions()).selectTask(task));
      },
      stopTask: function stopTask() {
        store.dispatch((_Actions2 || _Actions()).stopTask());
      },
      getActiveTaskRunnerIcon: function getActiveTaskRunnerIcon() {
        var activeTaskRunner = (0, (_getActiveTaskRunner2 || _getActiveTaskRunner()).getActiveTaskRunner)(store.getState());
        return activeTaskRunner && activeTaskRunner.getIcon();
      }
    };

    var props = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.from(store)
    // Delay the inital render. This way we (probably) won't wind up rendering the wrong task
    // runner before the correct one is registered.
    .cache(1).skipUntil((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.interval(300).first()).map(function (state) {
      var activeTaskRunner = (0, (_getActiveTaskRunner2 || _getActiveTaskRunner()).getActiveTaskRunner)(state);
      return _extends({}, staticProps, {
        taskRunnerInfo: Array.from(state.taskRunners.values()),
        getExtraUi: activeTaskRunner != null && activeTaskRunner.getExtraUi != null ? activeTaskRunner.getExtraUi.bind(activeTaskRunner) : null,
        progress: state.taskStatus && state.taskStatus.progress,
        visible: state.visible,
        activeTaskId: state.activeTaskId,
        taskIsRunning: state.taskStatus != null,
        tasks: state.tasks
      });
    });

    var StatefulToolbar = (0, (_nuclideUiLibBindObservableAsProps2 || _nuclideUiLibBindObservableAsProps()).bindObservableAsProps)(props, (_uiToolbar2 || _uiToolbar()).Toolbar);
    var container = document.createElement('div');
    // $FlowIssue: bindObservableAsProps doesn't handle props exactly right.
    (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(StatefulToolbar, null), container);
    var panel = atom.workspace.addTopPanel({ item: container });

    return {
      type: (_Actions2 || _Actions()).PANEL_CREATED,
      payload: { panel: panel }
    };
  });
}

function destroyPanelEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).DESTROY_PANEL).switchMap(function (action) {
    var _store$getState = store.getState();

    var panel = _store$getState.panel;

    if (panel == null) {
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
    }
    var item = panel.getItem();
    (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(item);
    panel.destroy();
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({ type: (_Actions2 || _Actions()).PANEL_DESTROYED });
  });
}

function registerTaskRunnerEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).REGISTER_TASK_RUNNER).flatMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).REGISTER_TASK_RUNNER);
    var taskRunner = action.payload.taskRunner;

    // Set the project root on the new task runner.
    var setProjectRoot = taskRunner.setProjectRoot;

    if (typeof setProjectRoot === 'function') {
      var projectRoot = store.getState().projectRoot;
      setProjectRoot.call(taskRunner, projectRoot);
    }

    var tasksToAction = function tasksToAction(tasks) {
      return {
        type: (_Actions2 || _Actions()).TASKS_UPDATED,
        payload: {
          taskRunnerId: taskRunner.id,
          tasks: tasks
        }
      };
    };
    var unregistrationEvents = actions.filter(function (a) {
      return a.type === (_Actions2 || _Actions()).UNREGISTER_TASK_RUNNER && a.payload.id === taskRunner.id;
    });
    return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(taskRunner.observeTasks.bind(taskRunner)).map(tasksToAction).takeUntil(unregistrationEvents);
  });
}

function runTaskEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).RUN_TASK).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).RUN_TASK);
    var taskToRun = action.payload.taskId || store.getState().activeTaskId;

    // Don't do anything if there's no active task.
    if (taskToRun == null) {
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
    }

    // Don't do anything if a task is already running.
    if (store.getState().taskStatus != null) {
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
    }

    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.concat(taskIdsAreEqual(store.getState().activeTaskId, taskToRun) ? (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty() : (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of((_Actions2 || _Actions()).selectTask(taskToRun)), (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.defer(function () {
      var state = store.getState();
      var activeTaskRunner = (0, (_getActiveTaskRunner2 || _getActiveTaskRunner()).getActiveTaskRunner)(state);

      if (activeTaskRunner == null) {
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
      }

      var task = (0, (_getTask2 || _getTask()).getTask)(taskToRun, state.tasks);
      (0, (_assert2 || _assert()).default)(task != null);

      if (!task.enabled) {
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
      }

      return createTaskObservable(activeTaskRunner, task, function () {
        return store.getState();
      })
      // Stop listening once the task is done.
      .takeUntil(actions.ofType((_Actions2 || _Actions()).TASK_COMPLETED, (_Actions2 || _Actions()).TASK_ERRORED, (_Actions2 || _Actions()).TASK_STOPPED));
    }));
  });
}

function setProjectRootEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).SET_PROJECT_ROOT).do(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).SET_PROJECT_ROOT);
    var projectRoot = action.payload.projectRoot;

    // Set the project root on all registered task runners.
    store.getState().taskRunners.forEach(function (taskRunner) {
      if (typeof taskRunner.setProjectRoot === 'function') {
        taskRunner.setProjectRoot(projectRoot);
      }
    });
  })
  // This is just for side-effects
  .ignoreElements();
}

function setToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).SET_TOOLBAR_VISIBILITY).map(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_Actions2 || _Actions()).SET_TOOLBAR_VISIBILITY);
    var visible = action.payload.visible;

    return {
      type: (_Actions2 || _Actions()).TOOLBAR_VISIBILITY_UPDATED,
      payload: { visible: visible }
    };
  });
}

function stopTaskEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).STOP_TASK).switchMap(function (action) {
    var _store$getState2 = store.getState();

    var taskStatus = _store$getState2.taskStatus;

    var taskInfo = taskStatus == null ? null : taskStatus.info;
    if (taskInfo == null) {
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
    }
    taskInfo.cancel();
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
      type: (_Actions2 || _Actions()).TASK_STOPPED,
      payload: { taskInfo: taskInfo }
    });
  });
}

function toggleToolbarVisibilityEpic(actions, store) {
  return actions.ofType((_Actions2 || _Actions()).TOGGLE_TOOLBAR_VISIBILITY).map(function (action) {
    return (_Actions2 || _Actions()).setToolbarVisibility(!store.getState().visible);
  });
}

/**
 * Run a task and transform its output into domain-specific actions.
 */
function createTaskObservable(taskRunner, task, getState) {
  var finished = undefined;
  // $FlowFixMe(matthewwithanm): Type this.
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.using(function () {
    var taskInfo = taskRunner.runTask(task.type);
    // We may call cancel multiple times so let's make sure it's idempotent.
    taskInfo = _extends({}, taskInfo, { cancel: (0, (_commonsNodeOnce2 || _commonsNodeOnce()).default)(taskInfo.cancel) });
    finished = false;
    return {
      taskInfo: taskInfo,
      unsubscribe: function unsubscribe() {
        if (!finished) {
          taskInfo.cancel();
        }
      }
    };
  }, function (_ref) {
    var taskInfo = _ref.taskInfo;
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(taskInfo);
  }).switchMap(function (taskInfo) {
    var progressStream = taskInfo.observeProgress == null ? (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty() : (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(taskInfo.observeProgress.bind(taskInfo));

    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
      type: (_Actions2 || _Actions()).TASK_STARTED,
      payload: { taskInfo: taskInfo }
    }).concat(progressStream.map(function (progress) {
      return {
        type: (_Actions2 || _Actions()).TASK_PROGRESS,
        payload: { progress: progress }
      };
    })).merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(taskInfo.onDidError.bind(taskInfo)).map(function (err) {
      throw err;
    })).takeUntil((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(taskInfo.onDidComplete.bind(taskInfo))).concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
      type: (_Actions2 || _Actions()).TASK_COMPLETED,
      payload: { taskInfo: taskInfo }
    }));
  }).catch(function (error) {
    atom.notifications.addError('The task "' + task.label + '" failed', {
      description: error.message,
      dismissable: true
    });

    var _getState = getState();

    var taskStatus = _getState.taskStatus;

    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
      type: (_Actions2 || _Actions()).TASK_ERRORED,
      payload: {
        error: error,
        taskInfo: taskStatus == null ? null : taskStatus.info
      }
    });
  }).finally(function () {
    finished = true;
  }).share();
}

function taskIdsAreEqual(a, b) {
  if (a == null || b == null) {
    return false;
  }
  return a.type === b.type && a.taskRunnerId === b.taskRunnerId;
}