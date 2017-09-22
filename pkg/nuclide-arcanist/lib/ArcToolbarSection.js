'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _ArcToolbarModel;

function _load_ArcToolbarModel() {
  return _ArcToolbarModel = require('./ArcToolbarModel');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class ArcToolbarSection extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._reloadBuildTargets = () => {
      this.props.model.updateBuildTargets();
    }, this._handleBuildTargetChange = value => {
      this.props.model.setActiveBuildTarget(value);
    }, this._arcBuild = () => {
      this.props.model.arcBuild();
    }, _temp;
  }

  componentDidMount() {
    this.props.model.viewActivated();
  }

  componentWillUnmount() {
    this.props.model.viewDeactivated();
  }

  getOptions() {
    const { model } = this.props;

    if (!model.isArcSupported()) {
      throw new Error('Invariant violation: "model.isArcSupported()"');
    }

    const error = model.getBuildTargetsError();
    if (error != null) {
      return [{ value: null, disabled: true, label: 'Error loading build steps!' }];
    }
    const targets = model.getBuildTargets();
    if (targets == null) {
      return [{ value: null, disabled: true, label: 'Loading build steps...' }];
    }
    return targets.map(target => ({ value: target, label: target }));
  }

  _renderReloadTargetsButton() {
    const error = this.props.model.getBuildTargetsError();
    if (error == null) {
      return null;
    }
    return _react.createElement((_Button || _load_Button()).Button, {
      icon: 'sync',
      size: (_Button || _load_Button()).ButtonSizes.SMALL,
      onClick: this._reloadBuildTargets,
      tooltip: {
        title: 'Reload build steps',
        delay: { show: 500, hide: 0 },
        placement: 'bottom'
      }
    });
  }

  render() {
    const { model } = this.props;
    if (!model.isArcSupported()) {
      return null;
    }
    return _react.createElement(
      'div',
      { className: 'inline-block' },
      _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
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

}
exports.default = ArcToolbarSection;