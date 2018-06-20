'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Tooltip;

function _load_Tooltip() {
  return _Tooltip = _interopRequireDefault(require('./Tooltip'));
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../modules/nuclide-commons-ui/Dropdown');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// following values must match LanguageStatusPreference exactly
const dropdownLabels = new Map([['green', 'show always'], ['yellow', 'show on progress'], ['red', 'show only on errors'], ['null', 'hide']]); /**
                                                                                                                                               * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                               * All rights reserved.
                                                                                                                                               *
                                                                                                                                               * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                               * the root directory of this source tree.
                                                                                                                                               *
                                                                                                                                               * 
                                                                                                                                               * @format
                                                                                                                                               */

const dropdownItems = Array.from(dropdownLabels).map(([value, label]) => ({ value, label }));

class SettingsTooltipComponent extends _react.PureComponent {
  render() {
    const relevantProviders = [...this.props.settings.entries()].filter(([provider, _]) => this.props.providers.includes(provider)).sort(([a], [b]) => a.priority === b.priority ? a.name.localeCompare(b.name) : b.priority - a.priority);
    this._styleTooltip();
    const servers = relevantProviders.map(([provider, kind]) => {
      return _react.createElement(
        'div',
        {
          className: 'nuclide-language-status-settings-item',
          key: provider.name },
        provider.name,
        ':',
        ' ',
        _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          onChange: newKind => this._updateSettings(provider, newKind),
          className: 'nuclide-language-status-settings-dropdown',
          isFlat: true,
          options: dropdownItems,
          value: kind
        })
      );
    });
    return _react.createElement(
      'div',
      { className: 'nuclide-language-status-tooltip-content' },
      _react.createElement(
        'div',
        { className: 'nuclide-language-status-settings-header' },
        'Language Status Settings:'
      ),
      servers
    );
  }

  _styleTooltip() {
    const { tooltipRoot } = this.props;
    if (tooltipRoot != null) {
      tooltipRoot.classList.add('nuclide-language-status-tooltip-settings');
    }
  }

  _updateSettings(provider, newKind) {
    const newSettings = new Map(this.props.settings);
    newSettings.set(provider, newKind);
    this.props.onUpdateSettings(newSettings);
  }
}

const SettingsTooltip = (0, (_Tooltip || _load_Tooltip()).default)(SettingsTooltipComponent);
exports.default = SettingsTooltip;