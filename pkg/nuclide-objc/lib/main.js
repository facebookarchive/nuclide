Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _ObjectiveCColonIndenter;

function _load_ObjectiveCColonIndenter() {
  return _ObjectiveCColonIndenter = _interopRequireDefault(require('./ObjectiveCColonIndenter'));
}

var _ObjectiveCBracketBalancer;

function _load_ObjectiveCBracketBalancer() {
  return _ObjectiveCBracketBalancer = _interopRequireDefault(require('./ObjectiveCBracketBalancer'));
}

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._indentFeature = new (_ObjectiveCColonIndenter || _load_ObjectiveCColonIndenter()).default();
    this._indentFeature.enable();

    this._bracketFeature = new (_ObjectiveCBracketBalancer || _load_ObjectiveCBracketBalancer()).default();
    this._configSubscription = (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.observe('nuclide-objc.enableAutomaticSquareBracketInsertion', function (enabled) {
      return enabled ? _this._bracketFeature.enable() : _this._bracketFeature.disable();
    });
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._configSubscription.dispose();
      this._bracketFeature.disable();
      this._indentFeature.disable();
    }
  }]);

  return Activation;
})();

var activation = undefined;

function activate(state) {
  if (!activation) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}