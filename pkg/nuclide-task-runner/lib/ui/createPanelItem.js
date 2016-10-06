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

var _nuclideUiBindObservableAsProps2;

function _nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps2 = require('../../../nuclide-ui/bindObservableAsProps');
}

var _commonsAtomViewableFromReactElement2;

function _commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement2 = require('../../../commons-atom/viewableFromReactElement');
}

var _reduxActions2;

function _reduxActions() {
  return _reduxActions2 = _interopRequireWildcard(require('../redux/Actions'));
}

var _reduxSelectors2;

function _reduxSelectors() {
  return _reduxSelectors2 = require('../redux/Selectors');
}

var _Toolbar2;

function _Toolbar() {
  return _Toolbar2 = require('./Toolbar');
}

var _lodashMemoize2;

function _lodashMemoize() {
  return _lodashMemoize2 = _interopRequireDefault(require('lodash.memoize'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

function createPanelItem(store) {
  var staticProps = {
    runTask: function runTask(taskId) {
      store.dispatch((_reduxActions2 || _reduxActions()).runTask(taskId));
    },
    selectTask: function selectTask(taskId) {
      store.dispatch((_reduxActions2 || _reduxActions()).selectTask(taskId));
    },
    stopTask: function stopTask() {
      store.dispatch((_reduxActions2 || _reduxActions()).stopTask());
    },
    getActiveTaskRunnerIcon: function getActiveTaskRunnerIcon() {
      var activeTaskRunner = (0, (_reduxSelectors2 || _reduxSelectors()).getActiveTaskRunner)(store.getState());
      return activeTaskRunner && activeTaskRunner.getIcon();
    }
  };

  // Delay the inital render. This way we (probably) won't wind up rendering the wrong task
  // runner before the correct one is registered.
  var props = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.interval(300).first()
  // $FlowFixMe: We need to teach Flow about Symbol.observable
  .switchMap(function () {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(store);
  }).map(function (state) {
    var activeTaskRunner = (0, (_reduxSelectors2 || _reduxSelectors()).getActiveTaskRunner)(state);
    return _extends({}, staticProps, {
      taskRunnerInfo: Array.from(state.taskRunners.values()),
      getExtraUi: getExtraUiFactory(activeTaskRunner),
      progress: state.runningTaskInfo && state.runningTaskInfo.progress,
      activeTaskId: (0, (_reduxSelectors2 || _reduxSelectors()).getActiveTaskId)(state),
      taskIsRunning: state.runningTaskInfo != null,
      taskLists: state.taskLists
    });
  });
  var StatefulToolbar = (0, (_nuclideUiBindObservableAsProps2 || _nuclideUiBindObservableAsProps()).bindObservableAsProps)(props, (_Toolbar2 || _Toolbar()).Toolbar);
  return (0, (_commonsAtomViewableFromReactElement2 || _commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom2 || _reactForAtom()).React.createElement(StatefulToolbar, null));
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
  getExtraUi = (0, (_lodashMemoize2 || _lodashMemoize()).default)(taskRunner.getExtraUi.bind(taskRunner));
  extraUiFactories.set(taskRunner, getExtraUi);
  return getExtraUi;
}