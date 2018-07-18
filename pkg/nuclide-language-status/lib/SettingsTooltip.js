"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _Tooltip() {
  const data = _interopRequireDefault(require("./Tooltip"));

  _Tooltip = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// following values must match LanguageStatusPreference exactly
const dropdownLabels = new Map([['green', 'show always'], ['yellow', 'show on progress'], ['red', 'show only on errors'], ['null', 'hide']]);
const dropdownItems = Array.from(dropdownLabels).map(([value, label]) => ({
  value,
  label
}));

class SettingsTooltipComponent extends React.PureComponent {
  render() {
    const relevantProviders = [...this.props.settings.entries()].filter(([provider, _]) => this.props.providers.includes(provider)).sort(([a], [b]) => a.priority === b.priority ? a.name.localeCompare(b.name) : b.priority - a.priority);

    this._styleTooltip();

    const servers = relevantProviders.map(([provider, kind]) => {
      return React.createElement("p", {
        className: "nuclide-language-status-settings-item",
        key: provider.name
      }, provider.name, ":", ' ', React.createElement(_Dropdown().Dropdown, {
        onChange: newKind => this._updateSettings(provider, newKind),
        className: "nuclide-language-status-settings-dropdown",
        isFlat: true,
        options: dropdownItems,
        value: kind
      }));
    });
    return React.createElement("div", {
      className: "nuclide-language-status-tooltip-content"
    }, React.createElement("p", null, "Language Status Settings:"), React.createElement("hr", null), servers);
  }

  _styleTooltip() {
    const {
      tooltipRoot
    } = this.props;

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

const SettingsTooltip = (0, _Tooltip().default)(SettingsTooltipComponent);
var _default = SettingsTooltip;
exports.default = _default;