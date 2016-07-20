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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var handleFailure = _asyncToGenerator(function* (pathToRoot) {
  var buttons = [{
    className: 'icon icon-zap',
    onDidClick: function onDidClick() {
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
    var reportButton = yield require('./fb-report-crash').getButton();
    if (reportButton != null) {
      buttons.push(reportButton);
    }
  } catch (e) {}
  var notification = atom.notifications.addError('Flow has failed in <code>' + pathToRoot + '</code>', {
    description: 'Flow features will be disabled for the remainder of this\n        Nuclide session. You may re-enable them by clicking below or by running\n        the "Restart Flow Server" command from the command palette later.',
    dismissable: true,
    buttons: buttons
  });
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _FlowServiceFactory2;

function _FlowServiceFactory() {
  return _FlowServiceFactory2 = require('./FlowServiceFactory');
}

var WARN_NOT_INSTALLED_CONFIG = 'nuclide-flow.warnOnNotInstalled';

var FlowServiceWatcher = (function () {
  function FlowServiceWatcher() {
    _classCallCheck(this, FlowServiceWatcher);

    this._subscription = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subscription();

    var serverStatusUpdates = (0, (_FlowServiceFactory2 || _FlowServiceFactory()).getServerStatusUpdates)();

    this._subscription.add(serverStatusUpdates.filter(function (_ref) {
      var status = _ref.status;
      return status === 'failed';
    }).subscribe(function (_ref2) {
      var pathToRoot = _ref2.pathToRoot;

      handleFailure(pathToRoot);
    }));

    this._subscription.add(serverStatusUpdates.filter(function (_ref3) {
      var status = _ref3.status;
      return status === 'not installed';
    }).first().subscribe(function (_ref4) {
      var pathToRoot = _ref4.pathToRoot;

      handleNotInstalled(pathToRoot);
    }));
  }

  _createClass(FlowServiceWatcher, [{
    key: 'dispose',
    value: function dispose() {
      this._subscription.unsubscribe();
    }
  }]);

  return FlowServiceWatcher;
})();

exports.FlowServiceWatcher = FlowServiceWatcher;

function handleNotInstalled(pathToRoot) {
  if (!(_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get(WARN_NOT_INSTALLED_CONFIG)) {
    return;
  }
  var title = 'Flow was not found when attempting to start it in \'' + pathToRoot + '\'.';
  var description = 'If you do not want to use Flow, you can ignore this message.<br/><br/>' + 'You can download it from <a href="http://flowtype.org/">flowtype.org</a>. ' + 'Make sure it is installed and on your PATH. ' + 'If this is a remote repository make sure it is available on the remote machine.<br/><br/>' + 'You will not see this message again until you restart Nuclide';
  var notification = atom.notifications.addInfo(title, {
    description: description,
    dismissable: true,
    buttons: [{
      className: 'icon icon-x',
      onDidClick: function onDidClick() {
        notification.dismiss();
        (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.set(WARN_NOT_INSTALLED_CONFIG, false);
      },
      text: 'Do not show again (can be reverted in settings)'
    }]
  });
}