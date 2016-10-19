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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _ArcToolbarModel;

function _load_ArcToolbarModel() {
  return _ArcToolbarModel = require('./ArcToolbarModel');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup;

function _load_nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _nuclideUiDropdown;

function _load_nuclideUiDropdown() {
  return _nuclideUiDropdown = require('../../nuclide-ui/Dropdown');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var ArcToolbarSection = (function (_React$Component) {
  _inherits(ArcToolbarSection, _React$Component);

  function ArcToolbarSection(props) {
    _classCallCheck(this, ArcToolbarSection);

    _get(Object.getPrototypeOf(ArcToolbarSection.prototype), 'constructor', this).call(this, props);
    this._arcBuild = this._arcBuild.bind(this);
    this._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);
    this._reloadBuildTargets = this._reloadBuildTargets.bind(this);
  }

  _createClass(ArcToolbarSection, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.props.model.viewActivated();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.props.model.viewDeactivated();
    }
  }, {
    key: 'getOptions',
    value: function getOptions() {
      var model = this.props.model;

      (0, (_assert || _load_assert()).default)(model.isArcSupported());
      var error = model.getBuildTargetsError();
      if (error != null) {
        return [{ value: null, disabled: true, label: 'Error loading build steps!' }];
      }
      var targets = model.getBuildTargets();
      if (targets == null) {
        return [{ value: null, disabled: true, label: 'Loading build steps...' }];
      }
      return targets.map(function (target) {
        return { value: target, label: target };
      });
    }
  }, {
    key: '_renderReloadTargetsButton',
    value: function _renderReloadTargetsButton() {
      var error = this.props.model.getBuildTargetsError();
      if (error == null) {
        return null;
      }
      return (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiButton || _load_nuclideUiButton()).Button, {
        icon: 'sync',
        size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
        onClick: this._reloadBuildTargets,
        tooltip: { title: 'Reload build steps', delay: 100, placement: 'bottom' }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var model = this.props.model;

      if (!model.isArcSupported()) {
        return null;
      }
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'inline-block' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiButtonGroup || _load_nuclideUiButtonGroup()).ButtonGroup,
          null,
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiDropdown || _load_nuclideUiDropdown()).Dropdown, {
            className: 'nuclide-arcanist-toolbar-targets-dropdown',
            size: 'sm',
            value: model.getActiveBuildTarget(),
            options: this.getOptions(),
            onChange: this._handleBuildTargetChange
          }),
          this._renderReloadTargetsButton()
        )
      );
    }
  }, {
    key: '_reloadBuildTargets',
    value: function _reloadBuildTargets() {
      this.props.model.updateBuildTargets();
    }
  }, {
    key: '_handleBuildTargetChange',
    value: function _handleBuildTargetChange(value) {
      this.props.model.setActiveBuildTarget(value);
    }
  }, {
    key: '_arcBuild',
    value: function _arcBuild() {
      this.props.model.arcBuild();
    }
  }]);

  return ArcToolbarSection;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = ArcToolbarSection;
module.exports = exports.default;