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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _events2;

function _events() {
  return _events2 = require('events');
}

var _Constants2;

function _Constants() {
  return _Constants2 = require('./Constants');
}

var ATTACH_TARGET_LIST_CHANGE_EVENT = 'ATTACH_TARGET_LIST_CHANGE_EVENT';

var LaunchAttachStore = (function () {
  function LaunchAttachStore(dispatcher) {
    _classCallCheck(this, LaunchAttachStore);

    this._dispatcher = dispatcher;
    this._dispatcherToken = this._dispatcher.register(this._handleActions.bind(this));
    this._eventEmitter = new (_events2 || _events()).EventEmitter();
    this._attachTargetInfos = [];
  }

  _createClass(LaunchAttachStore, [{
    key: 'dispose',
    value: function dispose() {
      this._dispatcher.unregister(this._dispatcherToken);
    }
  }, {
    key: 'onAttachTargetListChanged',
    value: function onAttachTargetListChanged(callback) {
      var _this = this;

      this._eventEmitter.on(ATTACH_TARGET_LIST_CHANGE_EVENT, callback);
      return new (_atom2 || _atom()).Disposable(function () {
        return _this._eventEmitter.removeListener(ATTACH_TARGET_LIST_CHANGE_EVENT, callback);
      });
    }
  }, {
    key: '_handleActions',
    value: function _handleActions(args) {
      switch (args.actionType) {
        case (_Constants2 || _Constants()).LaunchAttachActionCode.UPDATE_ATTACH_TARGET_LIST:
          this._attachTargetInfos = args.data;
          this._eventEmitter.emit(ATTACH_TARGET_LIST_CHANGE_EVENT);
          break;
      }
    }
  }, {
    key: 'getAttachTargetInfos',
    value: function getAttachTargetInfos() {
      return this._attachTargetInfos;
    }
  }]);

  return LaunchAttachStore;
})();

exports.LaunchAttachStore = LaunchAttachStore;