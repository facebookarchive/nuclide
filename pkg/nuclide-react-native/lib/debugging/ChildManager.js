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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomFormatEnoentNotification2;

function _commonsAtomFormatEnoentNotification() {
  return _commonsAtomFormatEnoentNotification2 = _interopRequireDefault(require('../../../commons-atom/format-enoent-notification'));
}

var _executeRnRequests2;

function _executeRnRequests() {
  return _executeRnRequests2 = require('./executeRnRequests');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var logger = undefined;
function getLogger() {
  if (!logger) {
    logger = require('../../../nuclide-logging').getLogger();
  }
  return logger;
}

var ChildManager = (function () {
  function ChildManager(onReply, emitter) {
    _classCallCheck(this, ChildManager);

    this._onReply = onReply;
    this._emitter = emitter;
    this._rnRequests = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subject();
    this._executorResponses = (0, (_executeRnRequests2 || _executeRnRequests()).executeRnRequests)(this._rnRequests);
  }

  _createClass(ChildManager, [{
    key: '_createChild',
    value: function _createChild() {
      var _this = this;

      if (this._executorSubscription != null) {
        return;
      }

      this._executorSubscription = this._executorResponses.subscribe(function (response) {
        switch (response.kind) {
          case 'result':
            _this._onReply(response.replyId, response.result);
            return;
          case 'error':
            getLogger().error(response.message);
            return;
          case 'pid':
            _this._emitter.emit('eval_application_script', response.pid);
            return;
        }
      }, function (err) {
        if (err.code === 'ENOENT') {
          var _ref = (0, (_commonsAtomFormatEnoentNotification2 || _commonsAtomFormatEnoentNotification()).default)({
            feature: 'React Native debugging',
            toolName: 'node',
            pathSetting: 'nuclide-react-native.pathToNode'
          });

          var message = _ref.message;
          var meta = _ref.meta;

          atom.notifications.addError(message, meta);
          return;
        }
        getLogger().error(err);
      });
    }
  }, {
    key: 'killChild',
    value: function killChild() {
      if (!this._executorSubscription) {
        return;
      }
      this._executorSubscription.unsubscribe();
      this._executorSubscription = null;
    }
  }, {
    key: 'handleMessage',
    value: function handleMessage(request) {
      if (request.replyID) {
        // getting cross-talk from another executor (probably Chrome)
        return;
      }

      // Make sure we have a worker to run the JS.
      this._createChild();

      this._rnRequests.next(request);
    }
  }]);

  return ChildManager;
})();

exports.default = ChildManager;
module.exports = exports.default;