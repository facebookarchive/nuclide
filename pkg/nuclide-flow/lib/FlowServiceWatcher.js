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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _FlowServiceFactory = require('./FlowServiceFactory');

var FlowServiceWatcher = (function () {
  function FlowServiceWatcher() {
    var _this = this;

    _classCallCheck(this, FlowServiceWatcher);

    this._subscription = (0, _FlowServiceFactory.getServerStatusUpdates)().filter(function (_ref) {
      var status = _ref.status;
      return status === 'failed';
    }).subscribe(function (_ref2) {
      var pathToRoot = _ref2.pathToRoot;

      _this._handleFailure(pathToRoot);
    });
  }

  _createClass(FlowServiceWatcher, [{
    key: 'dispose',
    value: function dispose() {
      this._subscription.unsubscribe();
    }
  }, {
    key: '_handleFailure',
    value: function _handleFailure(pathToRoot) {
      var failureMessage = 'Flow has failed in \'' + pathToRoot + '\'.<br/><br/>' + 'Flow features will be disabled for the remainder of this Nuclide session. ' + 'You may re-enable them by clicking below or by running the "Restart Flow Server" command ' + 'from the command palette later.';
      var notification = atom.notifications.addError(failureMessage, {
        dismissable: true,
        buttons: [{
          className: 'icon icon-zap',
          onDidClick: function onDidClick() {
            notification.dismiss();
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-flow:restart-flow-server');
          },
          text: 'Restart Flow Server'
        }]
      });
    }
  }]);

  return FlowServiceWatcher;
})();

exports.FlowServiceWatcher = FlowServiceWatcher;