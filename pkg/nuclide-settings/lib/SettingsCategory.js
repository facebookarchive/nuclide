"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _SettingsControl() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/SettingsControl"));

  _SettingsControl = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class SettingsCategory extends React.Component {
  render() {
    const children = Object.keys(this.props.packages).sort().map(pkgName => {
      const pkgData = this.props.packages[pkgName];
      const settingsArray = getSortedSettingsArray(pkgData.settings, pkgName);
      const elements = settingsArray.map(settingName => {
        const settingData = pkgData.settings[settingName];
        return React.createElement(ControlGroup, {
          key: settingName
        }, React.createElement(_SettingsControl().default, {
          keyPath: settingData.keyPath,
          value: settingData.value,
          onChange: settingData.onChange,
          schema: settingData.schema
        }));
      }); // We create a control group for the whole group of controls and then another for each
      // individual one. Why? Because that's what Atom does in its settings view.

      return React.createElement(ControlGroup, {
        key: pkgName
      }, React.createElement("section", {
        className: "sub-section"
      }, React.createElement("h2", {
        className: "sub-section-heading"
      }, pkgData.title), React.createElement("div", {
        className: "sub-section-body"
      }, elements)));
    });
    return React.createElement("section", {
      className: "section settings-panel"
    }, React.createElement("h1", {
      className: "block section-heading icon icon-gear"
    }, this.props.name, " Settings"), children);
  }

} // $FlowFixMe(>=0.53.0) Flow suppress


exports.default = SettingsCategory;

function ControlGroup(props) {
  return React.createElement("div", {
    className: "control-group"
  }, React.createElement("div", {
    className: "controls"
  }, props.children));
}

function getSortedSettingsArray(settings, pkgName) {
  // Sort the package's settings by name, then by order.
  const settingsArray = Object.keys(settings);
  settingsArray.sort().sort((a, b) => settings[a].order - settings[b].order);
  return settingsArray;
}