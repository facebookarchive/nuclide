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

exports.activate = activate;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    var ObjectiveCColonIndenterCtr = require('./ObjectiveCColonIndenter');
    this._indentFeature = new ObjectiveCColonIndenterCtr();
    this._indentFeature.enable();

    var ObjectiveCBracketBalancerCtr = require('./ObjectiveCBracketBalancer');
    this._bracketFeature = new ObjectiveCBracketBalancerCtr();
    this._configSubscription = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.observe('nuclide-objc.enableAutomaticSquareBracketInsertion', function (enabled) {
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