'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPanelItem = createPanelItem;

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../../nuclide-ui/bindObservableAsProps');
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../../commons-atom/viewableFromReactElement');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('../redux/Actions'));
}

var _Selectors;

function _load_Selectors() {
  return _Selectors = require('../redux/Selectors');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('./Toolbar');
}

var _lodash;

function _load_lodash() {
  return _lodash = _interopRequireDefault(require('lodash.memoize'));
}

var _reactForAtom = require('react-for-atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function createPanelItem(store) {
  const staticProps = {
    runTask: taskId => {
      store.dispatch((_Actions || _load_Actions()).runTask(taskId));
    },
    selectTask: taskId => {
      store.dispatch((_Actions || _load_Actions()).selectTask(taskId));
    },
    stopTask: () => {
      store.dispatch((_Actions || _load_Actions()).stopTask());
    },
    getActiveTaskRunnerIcon: () => {
      const activeTaskRunner = (0, (_Selectors || _load_Selectors()).getActiveTaskRunner)(store.getState());
      return activeTaskRunner && activeTaskRunner.getIcon();
    }
  };

  // Delay the inital render. This way we (probably) won't wind up rendering the wrong task
  // runner before the correct one is registered.
  const props = _rxjsBundlesRxMinJs.Observable.interval(300).first()
  // $FlowFixMe: We need to teach Flow about Symbol.observable
  .switchMap(() => _rxjsBundlesRxMinJs.Observable.from(store)).map(state => {
    const activeTaskRunner = (0, (_Selectors || _load_Selectors()).getActiveTaskRunner)(state);
    return Object.assign({}, staticProps, {
      taskRunnerInfo: Array.from(state.taskRunners.values()),
      getExtraUi: getExtraUiFactory(activeTaskRunner),
      progress: state.runningTaskInfo && state.runningTaskInfo.progress,
      activeTaskId: (0, (_Selectors || _load_Selectors()).getActiveTaskId)(state),
      taskIsRunning: state.runningTaskInfo != null,
      taskLists: state.taskLists
    });
  });
  const StatefulToolbar = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_Toolbar || _load_Toolbar()).Toolbar);
  return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_reactForAtom.React.createElement(StatefulToolbar, null));
}

/**
 * Since `getExtraUi` may create a React class dynamically, we want to ensure that we only ever call
 * it once. To do that, we memoize the function and cache the result.
 */
const extraUiFactories = new WeakMap();
function getExtraUiFactory(taskRunner) {
  let getExtraUi = extraUiFactories.get(taskRunner);
  if (getExtraUi != null) {
    return getExtraUi;
  }
  if (taskRunner == null) {
    return null;
  }
  if (taskRunner.getExtraUi == null) {
    return null;
  }
  getExtraUi = (0, (_lodash || _load_lodash()).default)(taskRunner.getExtraUi.bind(taskRunner));
  extraUiFactories.set(taskRunner, getExtraUi);
  return getExtraUi;
}