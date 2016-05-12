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

var _nuclideAtomHelpers2;

function _nuclideAtomHelpers() {
  return _nuclideAtomHelpers2 = require('../../nuclide-atom-helpers');
}

var _executeRnRequests2;

function _executeRnRequests() {
  return _executeRnRequests2 = require('./executeRnRequests');
}

var _rxjs2;

function _rxjs() {
  return _rxjs2 = require('rxjs');
}

var logger = undefined;
function getLogger() {
  if (!logger) {
    logger = require('../../nuclide-logging').getLogger();
  }
  return logger;
}

var ChildManager = (function () {
  function ChildManager(onReply, emitter) {
    _classCallCheck(this, ChildManager);

    this._onReply = onReply;
    this._emitter = emitter;
    this._rnRequests = new (_rxjs2 || _rxjs()).Subject();
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
          var _ref = (0, (_nuclideAtomHelpers2 || _nuclideAtomHelpers()).formatEnoentNotification)({
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