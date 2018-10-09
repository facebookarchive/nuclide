"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SettingsModal;

var React = _interopRequireWildcard(require("react"));

function _BoundSettingsControl() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/BoundSettingsControl"));

  _BoundSettingsControl = function () {
    return data;
  };

  return data;
}

function _HR() {
  const data = require("../../../../../nuclide-commons-ui/HR");

  _HR = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
function SettingsModal(props) {
  const hasProviderSettings = props.config.some(config => config.settings.length > 0);
  return React.createElement("div", {
    className: "nuclide-diagnostics-ui-settings-modal settings-view"
  }, React.createElement("section", {
    className: "settings-panel"
  }, React.createElement(_BoundSettingsControl().default, {
    keyPath: _featureConfig().default.formatKeyPath('atom-ide-diagnostics-ui.showDirectoryColumn')
  }), React.createElement(_BoundSettingsControl().default, {
    keyPath: _featureConfig().default.formatKeyPath('atom-ide-diagnostics-ui.autoVisibility')
  })), hasProviderSettings ? React.createElement(_HR().HR, null) : null, props.config.map(p => React.createElement(SettingsSection, Object.assign({
    key: p.providerName
  }, p))));
}

function SettingsSection(props) {
  return React.createElement("section", {
    className: "settings-panel"
  }, React.createElement("h1", {
    className: "section-heading"
  }, props.providerName), props.settings.map(keyPath => React.createElement(_BoundSettingsControl().default, {
    key: keyPath,
    keyPath: keyPath
  })));
}