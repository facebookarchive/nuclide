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

exports.createPanelItem = createPanelItem;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _nuclideUiBindObservableAsProps;

function _load_nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps = require('../../../nuclide-ui/bindObservableAsProps');
}

var _commonsAtomViewableFromReactElement;

function _load_commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement = require('../../../commons-atom/viewableFromReactElement');
}

var _reduxActions;

function _load_reduxActions() {
  return _reduxActions = _interopRequireWildcard(require('../redux/Actions'));
}

var _reduxSelectors;

function _load_reduxSelectors() {
  return _reduxSelectors = require('../redux/Selectors');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('./Toolbar');
}

var _lodashMemoize;

function _load_lodashMemoize() {
  return _lodashMemoize = _interopRequireDefault(require('lodash.memoize'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

function createPanelItem(store) {
  var staticProps = {
    runTask: function runTask(taskId) {
      store.dispatch((_reduxActions || _load_reduxActions()).runTask(taskId));
    },
    selectTask: function selectTask(taskId) {
      store.dispatch((_reduxActions || _load_reduxActions()).selectTask(taskId));
    },
    stopTask: function stopTask() {
      store.dispatch((_reduxActions || _load_reduxActions()).stopTask());
    },
    getActiveTaskRunnerIcon: function getActiveTaskRunnerIcon() {
      var activeTaskRunner = (0, (_reduxSelectors || _load_reduxSelectors()).getActiveTaskRunner)(store.getState());
      return activeTaskRunner && activeTaskRunner.getIcon();
    }
  };

  // Delay the inital render. This way we (probably) won't wind up rendering the wrong task
  // runner before the correct one is registered.
  var props = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.interval(300).first()
  // $FlowFixMe: We need to teach Flow about Symbol.observable
  .switchMap(function () {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(store);
  }).map(function (state) {
    var activeTaskRunner = (0, (_reduxSelectors || _load_reduxSelectors()).getActiveTaskRunner)(state);
    return _extends({}, staticProps, {
      taskRunnerInfo: Array.from(state.taskRunners.values()),
      getExtraUi: getExtraUiFactory(activeTaskRunner),
      progress: state.runningTaskInfo && state.runningTaskInfo.progress,
      activeTaskId: (0, (_reduxSelectors || _load_reduxSelectors()).getActiveTaskId)(state),
      taskIsRunning: state.runningTaskInfo != null,
      taskLists: state.taskLists
    });
  });
  var StatefulToolbar = (0, (_nuclideUiBindObservableAsProps || _load_nuclideUiBindObservableAsProps()).bindObservableAsProps)(props, (_Toolbar || _load_Toolbar()).Toolbar);
  return (0, (_commonsAtomViewableFromReactElement || _load_commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom || _load_reactForAtom()).React.createElement(StatefulToolbar, null));
}

/**
 * Since `getExtraUi` may create a React class dynamically, we want to ensure that we only ever call
 * it once. To do that, we memoize the function and cache the result.
 */
var extraUiFactories = new WeakMap();
function getExtraUiFactory(taskRunner) {
  var getExtraUi = extraUiFactories.get(taskRunner);
  if (getExtraUi != null) {
    return getExtraUi;
  }
  if (taskRunner == null) {
    return null;
  }
  if (taskRunner.getExtraUi == null) {
    return null;
  }
  getExtraUi = (0, (_lodashMemoize || _load_lodashMemoize()).default)(taskRunner.getExtraUi.bind(taskRunner));
  extraUiFactories.set(taskRunner, getExtraUi);
  return getExtraUi;
}