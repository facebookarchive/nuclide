Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _ArcToolbarModel2;

function _ArcToolbarModel() {
  return _ArcToolbarModel2 = require('./ArcToolbarModel');
}

var _nuclideUiLibCombobox2;

function _nuclideUiLibCombobox() {
  return _nuclideUiLibCombobox2 = require('../../nuclide-ui/lib/Combobox');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var ARC_BUILD_TARGET_WIDTH_PX = 120;

function handleRequestOptionsError(error) {
  var requestErrorMessage = 'Failed to get targets from arc';
  (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error(requestErrorMessage, error);
  atom.notifications.addError(requestErrorMessage, { detail: error.message });
}

function formatRequestOptionsErrorMessage() {
  return 'Arc build steps could not load!';
}

var ArcToolbarSection = (function (_React$Component) {
  _inherits(ArcToolbarSection, _React$Component);

  function ArcToolbarSection(props) {
    _classCallCheck(this, ArcToolbarSection);

    _get(Object.getPrototypeOf(ArcToolbarSection.prototype), 'constructor', this).call(this, props);
    this._arcBuild = this._arcBuild.bind(this);
    this._requestOptions = this._requestOptions.bind(this);
    this._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);
  }

  _createClass(ArcToolbarSection, [{
    key: 'render',
    value: function render() {
      var model = this.props.model;

      if (!model.isArcSupported()) {
        return null;
      }
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'inline-block' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibCombobox2 || _nuclideUiLibCombobox()).Combobox, {
          className: 'nuclide-arc-toolbar-combobox inline-block',
          ref: 'buildTarget',
          formatRequestOptionsErrorMessage: formatRequestOptionsErrorMessage,
          onRequestOptionsError: handleRequestOptionsError,
          requestOptions: this._requestOptions,
          size: 'sm',
          loadingMessage: 'Updating target names...',
          initialTextInput: model.getActiveBuildTarget(),
          onChange: this._handleBuildTargetChange,
          placeholderText: 'build step',
          width: ARC_BUILD_TARGET_WIDTH_PX
        })
      );
    }
  }, {
    key: '_requestOptions',
    value: function _requestOptions(inputText) {
      return this.props.model.loadBuildTargets();
    }
  }, {
    key: '_handleBuildTargetChange',
    value: function _handleBuildTargetChange(value) {
      this.props.model.updateBuildTarget(value);
    }
  }, {
    key: '_arcBuild',
    value: function _arcBuild() {
      this.props.model.arcBuild();
    }
  }]);

  return ArcToolbarSection;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = ArcToolbarSection;
module.exports = exports.default;