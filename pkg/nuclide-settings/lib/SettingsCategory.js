'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _SettingsControl;

function _load_SettingsControl() {
  return _SettingsControl = _interopRequireDefault(require('./SettingsControl'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class SettingsCategory extends _react.Component {
  render() {
    const children = Object.keys(this.props.packages).sort().map(pkgName => {
      const pkgData = this.props.packages[pkgName];
      const settingsArray = getSortedSettingsArray(pkgData.settings, pkgName);
      const elements = settingsArray.map(settingName => {
        const settingData = pkgData.settings[settingName];
        return _react.createElement(
          ControlGroup,
          { key: settingName },
          _react.createElement((_SettingsControl || _load_SettingsControl()).default, {
            keyPath: settingData.keyPath,
            value: settingData.value,
            onChange: settingData.onChange,
            schema: settingData.schema
          })
        );
      });
      // We create a control group for the whole group of controls and then another for each
      // individual one. Why? Because that's what Atom does in its settings view.
      return _react.createElement(
        ControlGroup,
        { key: pkgName },
        _react.createElement(
          'section',
          { className: 'sub-section' },
          _react.createElement(
            'h2',
            { className: 'sub-section-heading' },
            pkgData.title
          ),
          _react.createElement(
            'div',
            { className: 'sub-section-body' },
            elements
          )
        )
      );
    });
    return _react.createElement(
      'section',
      { className: 'section settings-panel' },
      _react.createElement(
        'h1',
        { className: 'block section-heading icon icon-gear' },
        this.props.name,
        ' Settings'
      ),
      children
    );
  }
}

exports.default = SettingsCategory; // $FlowFixMe(>=0.53.0) Flow suppress

function ControlGroup(props) {
  return _react.createElement(
    'div',
    { className: 'control-group' },
    _react.createElement(
      'div',
      { className: 'controls' },
      props.children
    )
  );
}

function getSortedSettingsArray(settings, pkgName) {
  // Sort the package's settings by name, then by order.
  const settingsArray = Object.keys(settings);
  settingsArray.sort().sort((a, b) => settings[a].order - settings[b].order);
  return settingsArray;
}