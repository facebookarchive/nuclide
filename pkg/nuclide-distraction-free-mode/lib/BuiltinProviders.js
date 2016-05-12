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

exports.getBuiltinProviders = getBuiltinProviders;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

function getBuiltinProviders() {
  var providers = [];
  if ((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-distraction-free-mode.hideToolBar')) {
    providers.push(toolBarProvider);
  }
  if ((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-distraction-free-mode.hideStatusBar')) {
    providers.push(new StatusBarProvider());
  }
  return providers;
}

var toolBarProvider = {
  name: 'tool-bar',
  isVisible: function isVisible() {
    return Boolean(atom.config.get('tool-bar.visible'));
  },
  toggle: function toggle() {
    atom.config.set('tool-bar.visible', !this.isVisible());
  }
};

var StatusBarProvider = (function () {
  function StatusBarProvider() {
    _classCallCheck(this, StatusBarProvider);

    this.name = 'status-bar';
    this._oldDisplay = null;
  }

  _createClass(StatusBarProvider, [{
    key: 'isVisible',
    value: function isVisible() {
      return this._getStatusBarElement() != null && this._oldDisplay == null;
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var element = this._getStatusBarElement();
      if (element == null) {
        return;
      }
      if (this.isVisible()) {
        this._oldDisplay = element.style.display;
        element.style.display = 'none';
      } else {
        // isVisible is false, so oldDisplay is non-null
        (0, (_assert2 || _assert()).default)(this._oldDisplay != null);
        element.style.display = this._oldDisplay;
        this._oldDisplay = null;
      }
    }
  }, {
    key: '_getStatusBarElement',
    value: function _getStatusBarElement() {
      return document.querySelector('status-bar');
    }
  }]);

  return StatusBarProvider;
})();