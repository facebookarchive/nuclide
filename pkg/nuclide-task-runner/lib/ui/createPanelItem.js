'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPanelItem = createPanelItem;

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../../commons-atom/viewableFromReactElement');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../redux/Actions'));
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('./Toolbar');
}

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function createPanelItem(store) {
  const staticProps = {
    runTask: taskMeta => {
      store.dispatch((_Actions || _load_Actions()).runTask(taskMeta));
    },
    selectTaskRunner: taskRunner => {
      store.dispatch((_Actions || _load_Actions()).selectTaskRunner(taskRunner, true));
    },
    stopRunningTask: () => {
      store.dispatch((_Actions || _load_Actions()).stopTask());
    }
  };

  // $FlowFixMe: We need to teach Flow about Symbol.observable
  const states = _rxjsBundlesRxMinJs.Observable.from(store).distinctUntilChanged();

  // We don't want to refresh the UI with a "pending" state while we wait for the initial tasks to
  // become ready; that would cause too many updates in quick succession. So we make the parts of
  // the state related to the selected task "sticky." Other parts of the state, however, we always
  // need to update immediately (e.g. progress).
  const stickyProps = states.filter(state => state.taskRunnersReady && !state.isUpdatingTaskRunners).startWith(store.getState()).map(state => ({
    taskRunners: state.taskRunners,
    statesForTaskRunners: state.statesForTaskRunners,
    activeTaskRunner: state.activeTaskRunner,
    iconComponent: state.activeTaskRunner ? state.activeTaskRunner.getIcon() : null,
    extraUiComponent: getExtraUiComponent(state.activeTaskRunner)
  })).distinctUntilChanged((_shallowequal || _load_shallowequal()).default);

  const alwaysUpToDateProps = states.map(state => Object.assign({}, staticProps, {
    toolbarDisabled: !state.taskRunnersReady || state.isUpdatingTaskRunners,
    progress: state.runningTask ? state.runningTask.progress : null,
    taskIsRunning: state.runningTask != null,
    runningTaskIsCancelable: state.runningTask ? state.runningTask.metadata.cancelable !== false : undefined
  }));

  const props = (0, (_observable || _load_observable()).throttle)(_rxjsBundlesRxMinJs.Observable.combineLatest(stickyProps, alwaysUpToDateProps, (a, b) => Object.assign({}, a, b)), () => (_observable || _load_observable()).nextAnimationFrame);

  const StatefulToolbar = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_Toolbar || _load_Toolbar()).Toolbar);
  return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.createElement(StatefulToolbar, null));
}

// Since `getExtraUi` may create a React class dynamically, the classes are cached
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