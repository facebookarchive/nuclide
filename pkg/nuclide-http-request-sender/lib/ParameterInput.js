'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParameterInput = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
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

class ParameterInput extends _react.Component {

  constructor(props) {
    super(props);
    this._handleUpdateKey = this._handleUpdateKey.bind(this);
    this._handleUpdateValue = this._handleUpdateValue.bind(this);
    this._handleRemoveParameter = this._handleRemoveParameter.bind(this);
    this._getErrorStyle = this._getErrorStyle.bind(this);
  }

  _handleUpdateKey(newKey) {
    this.props.updateParameter(this.props.index, {
      key: newKey,
      value: this.props.paramValue
    });
  }

  _handleUpdateValue(newValue) {
    this.props.updateParameter(this.props.index, {
      key: this.props.paramKey,
      value: newValue
    });
  }

  _handleRemoveParameter() {
    this.props.removeParameter(this.props.index);
  }

  _getErrorStyle() {
    return this.props.isDuplicate ? {
      borderColor: '#ff6347',
      boxShadow: '0 0 0 1px #ff6347',
      backgroundColor: '#312426'
    } : null;
  }
  render() {
    const style = this._getErrorStyle();
    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'div',
        { className: 'nuclide-parameter-container' },
        _react.createElement(
          'div',
          { className: 'nuclide-parameter-input-container' },
          _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            onDidChange: this._handleUpdateKey,
            initialValue: this.props.paramKey,
            style: style
          }),
          _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            onDidChange: this._handleUpdateValue,
            initialValue: this.props.paramValue,
            style: style
          })
        ),
        _react.createElement(
          (_Button || _load_Button()).Button,
          {
            className: 'nuclide-parameter-button',
            onClick: this._handleRemoveParameter },
          'X'
        )
      )
    );
  }
}
exports.ParameterInput = ParameterInput;