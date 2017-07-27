'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = observeBuildCommands;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CHECK_INTERVAL = 30000; /**
                               * Copyright (c) 2015-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the license found in the LICENSE file in
                               * the root directory of this source tree.
                               *
                               * 
                               * @format
                               */

const CONFIG_KEY = 'nuclide-buck.suggestTaskRunner';

function observeBuildCommands(store) {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(
  // $FlowFixMe: type symbol-observable
  _rxjsBundlesRxMinJs.Observable.from(store).switchMap(state => {
    const { buckRoot } = state;
    if (buckRoot == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    // Check the most recent Buck log at a fixed interval to check for
    // Buck command invocations.
    // We can't use Watchman because these logs are typically ignored.
    const buckService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(buckRoot);
    return _rxjsBundlesRxMinJs.Observable.interval(CHECK_INTERVAL).switchMap(() => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(buckService.getLastCommandInfo(buckRoot, 1))
      // Ignore errors.
      .catch(() => _rxjsBundlesRxMinJs.Observable.of(null)).switchMap(commandInfo => {
        if (commandInfo == null) {
          return _rxjsBundlesRxMinJs.Observable.empty();
        }
        const { timestamp, command, args } = commandInfo;
        // Only report simple single-target build commands for now.
        if (Date.now() - timestamp > CHECK_INTERVAL || command !== 'build' || args.length !== 1 || args[0].startsWith('-')) {
          return _rxjsBundlesRxMinJs.Observable.empty();
        }
        return _rxjsBundlesRxMinJs.Observable.of(commandInfo);
      });
    });
  })
  // Only show this once per session.
  .take(1).takeUntil((_featureConfig || _load_featureConfig()).default.observeAsStream(CONFIG_KEY).filter(x => x === false)).subscribe(({ args }) => {
    function dismiss() {
      notification.dismiss();
      (_featureConfig || _load_featureConfig()).default.set(CONFIG_KEY, false);
    }
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('buck-prompt.shown', { buildTarget: args[0] });
    const notification = atom.notifications.addInfo(`You recently ran \`buck build ${args.join(' ')}\` from the command line.<br />` + 'Would you like to try building from the Task Runner?', {
      dismissable: true,
      icon: 'nuclicon-buck',
      buttons: [{
        text: 'Try it!',
        className: 'icon icon-triangle-right',
        onDidClick: () => {
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('buck-prompt.clicked', { buildTarget: args[0] });
          store.dispatch((_Actions || _load_Actions()).setBuildTarget(args[0]));
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-task-runner:toggle-buck-toolbar', { visible: true });
          dismiss();
        }
      }, {
        text: "Don't show me this again",
        onDidClick: () => {
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('buck-prompt.dismissed');
          dismiss();
        }
      }]
    });
  }));
}