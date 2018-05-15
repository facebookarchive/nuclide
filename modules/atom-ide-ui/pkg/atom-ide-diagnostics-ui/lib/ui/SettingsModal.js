'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =

























SettingsModal;var _react = _interopRequireWildcard(require('react'));var _BoundSettingsControl;function _load_BoundSettingsControl() {return _BoundSettingsControl = _interopRequireDefault(require('../../../../../nuclide-commons-ui/BoundSettingsControl'));}var _HR;function _load_HR() {return _HR = require('../../../../../nuclide-commons-ui/HR');}var _featureConfig;function _load_featureConfig() {return _featureConfig = _interopRequireDefault(require('../../../../../nuclide-commons-atom/feature-config'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */function SettingsModal(props) {const hasProviderSettings = props.config.some(config => config.settings.length > 0);return _react.createElement('div', { className: 'nuclide-diagnostics-ui-settings-modal settings-view' }, _react.createElement('section', { className: 'settings-panel' }, _react.createElement((_BoundSettingsControl || _load_BoundSettingsControl()).default, { keyPath: (_featureConfig || _load_featureConfig()).default.formatKeyPath('atom-ide-diagnostics-ui.showDirectoryColumn') }),

      _react.createElement((_BoundSettingsControl || _load_BoundSettingsControl()).default, {
        keyPath: (_featureConfig || _load_featureConfig()).default.formatKeyPath(
        'atom-ide-diagnostics-ui.autoVisibility') })),



    hasProviderSettings ? _react.createElement((_HR || _load_HR()).HR, null) : null,
    props.config.map(p => _react.createElement(SettingsSection, Object.assign({ key: p.providerName }, p))));


}

function SettingsSection(props) {
  return (
    _react.createElement('section', { className: 'settings-panel' },
      _react.createElement('h1', { className: 'section-heading' }, props.providerName),
      props.settings.map(keyPath =>
      _react.createElement((_BoundSettingsControl || _load_BoundSettingsControl()).default, { key: keyPath, keyPath: keyPath }))));



}