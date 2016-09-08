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

var _nuclideUiLibBindObservableAsProps2;

function _nuclideUiLibBindObservableAsProps() {
  return _nuclideUiLibBindObservableAsProps2 = require('../../../nuclide-ui/lib/bindObservableAsProps');
}

var _commonsAtomViewableFromReactElement2;

function _commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement2 = require('../../../commons-atom/viewableFromReactElement');
}

var _getActiveTaskRunner2;

function _getActiveTaskRunner() {
  return _getActiveTaskRunner2 = require('../getActiveTaskRunner');
}

var _reduxActions2;

function _reduxActions() {
  return _reduxActions2 = _interopRequireWildcard(require('../redux/Actions'));
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

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
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
      var activeTaskRunner = (0, (_getActiveTaskRunner2 || _getActiveTaskRunner()).getActiveTaskRunner)(store.getState());
      return activeTaskRunner && activeTaskRunner.getIcon();
    }
  };

  // Delay the inital render. This way we (probably) won't wind up rendering the wrong task
  // runner before the correct one is registered.
  var props = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.interval(300).first()
  // $FlowFixMe: We need to teach Flow about Symbol.observable
  .switchMap(function () {
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.from(store);
  }).map(function (state) {
    var activeTaskRunner = (0, (_getActiveTaskRunner2 || _getActiveTaskRunner()).getActiveTaskRunner)(state);
    return _extends({}, staticProps, {
      taskRunnerInfo: Array.from(state.taskRunners.values()),
      getExtraUi: getExtraUiFactory(activeTaskRunner),
      progress: state.runningTaskInfo && state.runningTaskInfo.progress,
      activeTaskId: state.activeTaskId,
      taskIsRunning: state.runningTaskInfo != null,
      taskLists: state.taskLists
    });
  });
  var StatefulToolbar = (0, (_nuclideUiLibBindObservableAsProps2 || _nuclideUiLibBindObservableAsProps()).bindObservableAsProps)(props, (_Toolbar2 || _Toolbar()).Toolbar);
  // $FlowFixMe: bindObservableAsProps needs to be typed better.
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