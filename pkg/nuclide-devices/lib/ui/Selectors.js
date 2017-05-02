'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Selectors = undefined;

var _react = _interopRequireDefault(require('react'));

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../nuclide-ui/Dropdown');
}

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

class Selectors extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleDeviceActionSelected = this._handleDeviceActionSelected.bind(this);
  }

  _handleDeviceActionSelected(value) {
    if (value == null) {
      return;
    }
    const index = parseInt(value, 10);
    this.props.deviceActions[index].callback();
  }

  _getHostOptions() {
    return this.props.hosts.map(host => ({ value: host, label: host }));
  }

  _getTypeOptions() {
    const typeOptions = this.props.deviceTypes.map(type => ({
      value: type,
      label: type
    }));
    typeOptions.splice(0, 0, { value: null, label: 'Select...' });
    return typeOptions;
  }

  _getDeviceActionOptions() {
    const actionOptions = this.props.deviceActions.map((action, index) => ({
      value: `${index}`,
      label: action.name
    }));
    if (actionOptions.length > 0) {
      actionOptions.splice(0, 0, { value: null, label: 'Select...' });
    }
    return actionOptions;
  }

  render() {
    const dropdowns = [['Connection:', _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
      className: 'inline-block',
      options: this._getHostOptions(),
      onChange: this.props.setHost,
      value: this.props.host,
      key: 'connection'
    })], ['Device type:', _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
      className: 'inline-block',
      options: this._getTypeOptions(),
      onChange: this.props.setDeviceType,
      value: this.props.deviceType,
      key: 'devicetype'
    })]];

    const deviceActionOptions = this._getDeviceActionOptions();
    if (deviceActionOptions.length > 0) {
      dropdowns.push(['Actions:', _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        className: 'inline-block',
        options: deviceActionOptions,
        onChange: this._handleDeviceActionSelected,
        value: null,
        key: 'actions'
      })]);
    }

    return _react.default.createElement(
      'table',
      null,
      dropdowns.map(([label, dropdown]) => _react.default.createElement(
        'tr',
        { key: label },
        _react.default.createElement(
          'td',
          null,
          _react.default.createElement(
            'label',
            { className: 'inline-block' },
            label
          )
        ),
        _react.default.createElement(
          'td',
          null,
          dropdown
        )
      ))
    );
  }
}
exports.Selectors = Selectors;