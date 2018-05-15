'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.
















































































































































getFilterPattern = getFilterPattern;var _AtomInput;function _load_AtomInput() {return _AtomInput = require('./AtomInput');}var _classnames;function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _Button;function _load_Button() {return _Button = require('./Button');}var _ButtonGroup;function _load_ButtonGroup() {return _ButtonGroup = require('./ButtonGroup');}var _escapeStringRegexp;function _load_escapeStringRegexp() {return _escapeStringRegexp = _interopRequireDefault(require('escape-string-regexp'));}var _react = _interopRequireWildcard(require('react'));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}class RegExpFilter extends _react.Component {constructor(props) {super(props);this._handleReToggleButtonClick = () => {this.props.onChange({ text: this._currentValue.text, isRegExp: !this._currentValue.isRegExp });};this._handleTextChange = text => {if (text === this._currentValue.text) {return;}this.props.onChange({ text, isRegExp: this._currentValue.isRegExp });};this._currentValue = props.value;}componentWillReceiveProps(props) {// We need to store this so that we can use it in the event handlers.
    this._currentValue = props.value;}render() {const { value: { text, isRegExp, invalid } } = this.props;const size = this.props.size || 'sm';const buttonSize = getButtonSize(size);const inputWidth = this.props.inputWidth == null ? 200 : this.props.inputWidth;const inputClassName = (0, (_classnames || _load_classnames()).default)('nuclide-ui-regexp-filter-input', this.props.inputClassName);return _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, { className: 'inline-block' }, _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, { ref: el => {this._input = el;}, invalid: invalid, className: inputClassName, size: size, width: inputWidth, placeholderText: 'Filter', onDidChange: this._handleTextChange, value: text }), _react.createElement((_Button || _load_Button()).Button, { className: 'nuclide-ui-regexp-filter-button', size: buttonSize, selected: isRegExp, onClick: this._handleReToggleButtonClick, tooltip: { title: 'Use Regex' } }, '.*'));}focus() {if (this._input == null) {return;}this._input.focus();}}exports.default = RegExpFilter; /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *  strict-local
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function getButtonSize(size) {switch (size) {case 'xs':return (_Button || _load_Button()).ButtonSizes.EXTRA_SMALL;case 'sm':return (_Button || _load_Button()).ButtonSizes.SMALL;case 'lg':return (_Button || _load_Button()).ButtonSizes.LARGE;default:size;throw new Error(`Invalid size: ${size}`);}}function getFilterPattern(text, isRegExp) {if (text === '') {return { pattern: null, invalid: false };}const source = isRegExp ? text : (0, (_escapeStringRegexp || _load_escapeStringRegexp()).default)(text);try {return { pattern: new RegExp(source, 'i'), invalid: false };

  } catch (err) {
    return {
      pattern: null,
      invalid: true };

  }
}