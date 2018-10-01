"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getToolbarProps;

function _observable() {
  const data = require("../../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
function getToolbarProps(store) {
  const staticProps = {
    runTask: taskMeta => {
      store.dispatch(Actions().runTask(taskMeta));
    },
    selectTaskRunner: taskRunner => {
      store.dispatch(Actions().selectTaskRunner(taskRunner, true));
    },
    stopRunningTask: () => {
      store.dispatch(Actions().stopTask());
    }
  }; // $FlowFixMe: We need to teach Flow about Symbol.observable

  const states = _RxMin.Observable.from(store).distinctUntilChanged(); // We don't want to refresh the UI with a "pending" state while we wait for the initial tasks to
  // become ready; that would cause too many updates in quick succession. So we make the parts of
  // the state related to the selected task "sticky." Other parts of the state, however, we always
  // need to update immediately (e.g. progress).


  const stickyProps = states.filter(state => state.initialPackagesActivated && state.readyTaskRunners.count() === state.taskRunners.count()).startWith(store.getState()).map(state => ({
    taskRunners: state.taskRunners,
    statesForTaskRunners: state.statesForTaskRunners,
    activeTaskRunner: state.activeTaskRunner,
    iconComponent: state.activeTaskRunner ? state.activeTaskRunner.getIcon() : null,
    extraUiComponent: getExtraUiComponent(state.activeTaskRunner)
  })).distinctUntilChanged(_shallowequal().default);
  const alwaysUpToDateProps = states.map(state => Object.assign({}, staticProps, {
    toolbarDisabled: !state.initialPackagesActivated || state.readyTaskRunners.count() !== state.taskRunners.count(),
    progress: state.runningTask ? state.runningTask.progress : null,
    taskIsRunning: state.runningTask != null,
    runningTaskIsCancelable: state.runningTask ? state.runningTask.metadata.cancelable !== false : undefined
  }));

  const props = _RxMin.Observable.combineLatest(stickyProps, alwaysUpToDateProps, (a, b) => Object.assign({}, a, b)).let((0, _observable().throttle)(() => _observable().nextAnimationFrame));

  return props;
} // Since `getExtraUi` may create a React class dynamically, the classes are cached


const extraUiComponentCache = new WeakMap();

function getExtraUiComponent(taskRunner) {
  if (!taskRunner) {
    return null;
  }

  let extraUi = extraUiComponentCache.get(taskRunner);

  if (extraUi != null) {
    return extraUi;
  }

  if (!taskRunner.getExtraUi) {
    return null;
  }

  extraUi = taskRunner.getExtraUi();
  extraUiComponentCache.set(taskRunner, extraUi);
  return extraUi;
}