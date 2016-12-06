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
exports.FlowServiceWatcher = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let handleFailure = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (pathToRoot) {
    const buttons = [{
      className: 'icon icon-zap',
      onDidClick() {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-flow:restart-flow-server');
        if (buttons.length > 1) {
          this.classList.add('disabled');
        } else {
          notification.dismiss();
        }
      },
      text: 'Restart Flow Server'
    }];
    try {
      // $FlowFB
      const reportButton = yield require('./fb-report-crash').getButton();
      if (reportButton != null) {
        buttons.push(reportButton);
      }
    } catch (e) {}
    const notification = atom.notifications.addError(`Flow has failed in <code>${ pathToRoot }</code>`, {
      description: `Flow features will be disabled for the remainder of this
        Nuclide session. You may re-enable them by clicking below or by running
        the "Restart Flow Server" command from the command palette later.`,
      dismissable: true,
      buttons
    });
  });

  return function handleFailure(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WARN_NOT_INSTALLED_CONFIG = 'nuclide-flow.warnOnNotInstalled';

class FlowServiceWatcher {

  constructor() {
    this._subscription = new _rxjsBundlesRxMinJs.Subscription();

    const serverStatusUpdates = (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getServerStatusUpdates)();

    this._subscription.add(serverStatusUpdates.filter(({ status }) => status === 'failed').subscribe(({ pathToRoot }) => {
      handleFailure(pathToRoot);
    }));

    this._subscription.add(serverStatusUpdates.filter(({ status }) => status === 'not installed').first().subscribe(({ pathToRoot }) => {
      handleNotInstalled(pathToRoot);
    }));
  }

  dispose() {
    this._subscription.unsubscribe();
  }
}

exports.FlowServiceWatcher = FlowServiceWatcher;


function handleNotInstalled(pathToRoot) {
  if (!(_featureConfig || _load_featureConfig()).default.get(WARN_NOT_INSTALLED_CONFIG)) {
    return;
  }
  const title = `Flow was not found when attempting to start it in '${ pathToRoot }'.`;
  const description = 'If you do not want to use Flow, you can ignore this message.<br/><br/>' + 'You can download it from <a href="http://flowtype.org/">flowtype.org</a>. ' + 'Make sure it is installed and on your PATH. ' + 'If this is a remote repository make sure it is available on the remote machine.<br/><br/>' + 'You will not see this message again until you restart Nuclide';
  const notification = atom.notifications.addInfo(title, {
    description,
    dismissable: true,
    buttons: [{
      className: 'icon icon-x',
      onDidClick() {
        notification.dismiss();
        (_featureConfig || _load_featureConfig()).default.set(WARN_NOT_INSTALLED_CONFIG, false);
      },
      text: 'Do not show again (can be reverted in settings)'
    }]
  });
}