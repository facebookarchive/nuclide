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

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _ObjectiveCColonIndenter2;

function _ObjectiveCColonIndenter() {
  return _ObjectiveCColonIndenter2 = _interopRequireDefault(require('./ObjectiveCColonIndenter'));
}

var _ObjectiveCBracketBalancer2;

function _ObjectiveCBracketBalancer() {
  return _ObjectiveCBracketBalancer2 = _interopRequireDefault(require('./ObjectiveCBracketBalancer'));
}

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._indentFeature = new (_ObjectiveCColonIndenter2 || _ObjectiveCColonIndenter()).default();
    this._indentFeature.enable();

    this._bracketFeature = new (_ObjectiveCBracketBalancer2 || _ObjectiveCBracketBalancer()).default();
    this._configSubscription = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.observe('nuclide-objc.enableAutomaticSquareBracketInsertion', function (enabled) {
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