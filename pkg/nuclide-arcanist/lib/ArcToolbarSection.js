'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _ArcToolbarModel;

function _load_ArcToolbarModel() {
  return _ArcToolbarModel = require('./ArcToolbarModel');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

let ArcToolbarSection = class ArcToolbarSection extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._arcBuild = this._arcBuild.bind(this);
    this._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);
    this._reloadBuildTargets = this._reloadBuildTargets.bind(this);
  }

  componentDidMount() {
    this.props.model.viewActivated();
  }

  componentWillUnmount() {
    this.props.model.viewDeactivated();
  }

  getOptions() {
    const model = this.props.model;

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
    return _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
      icon: 'sync',
      size: (_Button || _load_Button()).ButtonSizes.SMALL,
      onClick: this._reloadBuildTargets,
      tooltip: { title: 'Reload build steps', delay: 100, placement: 'bottom' }
    });
  }

  render() {
    const model = this.props.model;

    if (!model.isArcSupported()) {
      return null;
    }
    return _reactForAtom.React.createElement(
      'div',
      { className: 'inline-block' },
      _reactForAtom.React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        _reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
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

  _reloadBuildTargets() {
    this.props.model.updateBuildTargets();
  }

  _handleBuildTargetChange(value) {
    this.props.model.setActiveBuildTarget(value);
  }

  _arcBuild() {
    this.props.model.arcBuild();
  }
};
exports.default = ArcToolbarSection;
module.exports = exports['default'];