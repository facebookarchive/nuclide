"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeBuildCommands = observeBuildCommands;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../../modules/nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const CHECK_INTERVAL = 30000;
const CONFIG_KEY = 'nuclide-buck.suggestTaskRunner';
const WATCH_CONFIG_ARGS_KEY = 'nuclide-buck.watchConfigArgs';

function readWatchConfig() {
  // $FlowIgnore: type is guarded by write function and package.json.
  const watch = _featureConfig().default.get(WATCH_CONFIG_ARGS_KEY);

  return watch != null ? watch : 'Prompt';
}

function writeWatchConfig(setting) {
  (0, _nuclideAnalytics().track)('buck-watch-config.set', {
    setting
  });

  _featureConfig().default.set(WATCH_CONFIG_ARGS_KEY, setting);
} // Return whether the user elects to automatically update the compilation
// database arguments with detected config settings.


function promptConfigChange(prevConfigArgs, nextConfigArgs) {
  const watchSetting = readWatchConfig();

  if (nextConfigArgs.findIndex(arg => arg.startsWith('client.id')) !== -1 || (0, _collection().arrayEqual)(prevConfigArgs || [], nextConfigArgs) || watchSetting === 'Never') {
    return Promise.resolve(false);
  } else if (watchSetting === 'Always') {
    return Promise.resolve(true);
  } else {
    return new Promise((resolve, reject) => {
      const notification = atom.notifications.addInfo(`You recently ran Buck with config flags \`[${nextConfigArgs.join(' ')}]\` from the command line.<br />` + 'Would you like Nuclide to automatically use the most recent config' + ' for compilation database calls for language services? (to avoid resetting the Buck cache)', {
        dismissable: true,
        icon: 'nuclicon-buck',
        buttons: [{
          text: 'Yes',
          className: 'icon icon-triangle-right',
          onDidClick: () => {
            writeWatchConfig('Always');
            resolve(true);
            notification.dismiss();
          }
        }, {
          text: 'No',
          onDidClick: () => {
            writeWatchConfig('Never');
            resolve(false);
            notification.dismiss();
          }
        }]
      });
      notification.onDidDismiss(() => resolve(false));
    });
  }
}

function promptTaskRunner(args) {
  return new Promise((resolve, reject) => {
    function dismiss() {
      notification.dismiss();

      _featureConfig().default.set(CONFIG_KEY, false);
    }

    (0, _nuclideAnalytics().track)('buck-prompt.shown', {
      buildTarget: args[0]
    });
    const notification = atom.notifications.addInfo(`You recently ran \`buck build ${args.join(' ')}\` from the command line.<br />` + 'Would you like to try building from the Task Runner?', {
      dismissable: true,
      icon: 'nuclicon-buck',
      buttons: [{
        text: 'Try it!',
        className: 'icon icon-triangle-right',
        onDidClick: () => {
          (0, _nuclideAnalytics().track)('buck-prompt.clicked', {
            buildTarget: args[0]
          });
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-task-runner:toggle-buck-toolbar', {
            visible: true
          });
          resolve(true);
          dismiss();
        }
      }, {
        text: "Don't show me this again",
        onDidClick: () => {
          (0, _nuclideAnalytics().track)('buck-prompt.dismissed');
          dismiss();
        }
      }]
    });
    notification.onDidDismiss(() => resolve(false));
  });
}

function observeBuildCommands(buckRoot, currentTaskSettings, currentUnsanitizedTaskSettings) {
  // Check the most recent Buck log at a fixed interval to check for
  // Buck command invocations.
  // We can't use Watchman because these logs are typically ignored.
  const buckService = (0, _nuclideRemoteConnection().getBuckServiceByNuclideUri)(buckRoot);
  return _rxjsCompatUmdMin.Observable.interval(CHECK_INTERVAL).startWith(0).switchMap(() => {
    return _rxjsCompatUmdMin.Observable.fromPromise(buckService.getLastBuildCommandInfo(buckRoot)) // Ignore errors.
    .catch(() => _rxjsCompatUmdMin.Observable.of(null)).filter(Boolean).filter(({
      timestamp
    }) => Date.now() - timestamp <= CHECK_INTERVAL);
  }).switchMap(({
    args
  }) => {
    if (_featureConfig().default.get(CONFIG_KEY) !== true || args.length !== 1 || args[0].startsWith('-') || args[0].startsWith('@')) {
      const configFlag = '--config'; // Attempt to extract only @args files and --config arguments from the command.

      const configArgs = args.filter((arg, index) => arg.startsWith('@mode/') || arg.startsWith(configFlag) || args[index - 1] === configFlag);
      const currentSettings = currentTaskSettings();
      const currentUnsanitizedSettings = currentUnsanitizedTaskSettings();
      return _rxjsCompatUmdMin.Observable.fromPromise(promptConfigChange(currentSettings.compileDbArguments, configArgs)).filter(shouldUpdate => shouldUpdate === true).map(() => Actions().setTaskSettings(Object.assign({}, currentSettings, {
        compileDbArguments: configArgs
      }), currentUnsanitizedSettings));
    }

    return _rxjsCompatUmdMin.Observable.fromPromise(promptTaskRunner(args)).filter(answer => answer === true).map(() => Actions().setBuildTarget(args[0]));
  });
}