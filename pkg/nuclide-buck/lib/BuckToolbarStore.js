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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _flux2;

function _flux() {
  return _flux2 = require('flux');
}

var _BuckToolbarActions2;

function _BuckToolbarActions() {
  return _BuckToolbarActions2 = _interopRequireDefault(require('./BuckToolbarActions'));
}

var BuckToolbarStore = (function () {
  function BuckToolbarStore(dispatcher, initialState) {
    _classCallCheck(this, BuckToolbarStore);

    this._dispatcher = dispatcher;
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._initState(initialState);
    this._setupActions();
  }

  _createClass(BuckToolbarStore, [{
    key: '_initState',
    value: function _initState(initialState) {
      this._isLoadingRule = false;
      this._buildTarget = initialState && initialState.buildTarget || '';
      this._buildRuleType = '';
      this._isReactNativeServerMode = initialState && initialState.isReactNativeServerMode || false;
    }
  }, {
    key: '_setupActions',
    value: function _setupActions() {
      var _this = this;

      this._dispatcher.register(function (action) {
        switch (action.actionType) {
          case (_BuckToolbarActions2 || _BuckToolbarActions()).default.ActionType.UPDATE_PROJECT:
            _this._mostRecentBuckProject = action.project;
            break;
          case (_BuckToolbarActions2 || _BuckToolbarActions()).default.ActionType.UPDATE_BUILD_TARGET:
            _this._buildTarget = action.buildTarget;
            _this.emitChange();
            break;
          case (_BuckToolbarActions2 || _BuckToolbarActions()).default.ActionType.UPDATE_IS_LOADING_RULE:
            _this._isLoadingRule = action.isLoadingRule;
            _this.emitChange();
            break;
          case (_BuckToolbarActions2 || _BuckToolbarActions()).default.ActionType.UPDATE_RULE_TYPE:
            _this._buildRuleType = action.ruleType;
            _this.emitChange();
            break;
          case (_BuckToolbarActions2 || _BuckToolbarActions()).default.ActionType.UPDATE_SIMULATOR:
            _this._simulator = action.simulator;
            break;
          case (_BuckToolbarActions2 || _BuckToolbarActions()).default.ActionType.UPDATE_REACT_NATIVE_SERVER_MODE:
            _this._isReactNativeServerMode = action.serverMode;
            _this.emitChange();
            break;
        }
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
    }
  }, {
    key: 'subscribe',
    value: function subscribe(callback) {
      return this._emitter.on('change', callback);
    }
  }, {
    key: 'emitChange',
    value: function emitChange() {
      this._emitter.emit('change');
    }
  }, {
    key: 'getBuildTarget',
    value: function getBuildTarget() {
      return this._buildTarget;
    }
  }, {
    key: 'getMostRecentBuckProject',
    value: function getMostRecentBuckProject() {
      return this._mostRecentBuckProject;
    }
  }, {
    key: 'isLoadingRule',
    value: function isLoadingRule() {
      return this._isLoadingRule;
    }
  }, {
    key: 'getRuleType',
    value: function getRuleType() {
      return this._buildRuleType;
    }
  }, {
    key: 'canBeReactNativeApp',
    value: function canBeReactNativeApp() {
      return this._buildRuleType === 'apple_bundle' || this._buildRuleType === 'android_binary';
    }
  }, {
    key: 'isReactNativeServerMode',
    value: function isReactNativeServerMode() {
      return this.canBeReactNativeApp() && this._isReactNativeServerMode;
    }
  }, {
    key: 'isInstallableRule',
    value: function isInstallableRule() {
      return this.canBeReactNativeApp() || this._buildRuleType === 'apk_genrule';
    }
  }, {
    key: 'getSimulator',
    value: function getSimulator() {
      return this._simulator;
    }
  }]);

  return BuckToolbarStore;
})();

exports.default = BuckToolbarStore;
module.exports = exports.default;