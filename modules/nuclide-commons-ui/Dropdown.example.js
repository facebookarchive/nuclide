'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.DropdownExamples = undefined;













var _react = _interopRequireWildcard(require('react'));var _Dropdown;
function _load_Dropdown() {return _Dropdown = require('./Dropdown');}var _SplitButtonDropdown;
function _load_SplitButtonDropdown() {return _SplitButtonDropdown = require('./SplitButtonDropdown');}var _ModalMultiSelect;
function _load_ModalMultiSelect() {return _ModalMultiSelect = require('./ModalMultiSelect');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                               * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                               * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                               * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                               * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                               * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                               * 
                                                                                                                                                                                                                                                                                                                                                               * @format
                                                                                                                                                                                                                                                                                                                                                               */ /* global alert */const DropdownExample = (() => {const options = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }, { value: 3, label: 'Three' }, { value: 4, label: 'Four' }];return () => _react.createElement('div', null,
    _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, { options: options, value: 2 }));


})();

const SplitButtonDropdownExample = (() => {
  const options = [
  { value: 1, label: 'Build', icon: 'tools' },
  { value: 2, label: 'Run', icon: 'triangle-right', selectedLabel: 'Run It!' },
  { value: 3, label: 'Rocket', icon: 'rocket' },
  { type: 'separator' },
  { value: 4, label: 'Squirrel', icon: 'squirrel' },
  { value: 5, label: 'Beaker', icon: 'telescope', disabled: true }];

  return () =>
  _react.createElement('div', null,
    _react.createElement((_SplitButtonDropdown || _load_SplitButtonDropdown()).SplitButtonDropdown, {
      options: options,
      value: 2,
      onConfirm:
      // eslint-disable-next-line no-alert
      x => alert(`You selected ${x}!`) }));




})();

class ModalMultiSelectExample extends _react.Component


{
  constructor(props) {
    super(props);
    this.state = { value: [2] };
  }

  render() {
    const options = [
    { value: 1, label: 'One' },
    { value: 2, label: 'Two' },
    { value: 3, label: 'Three' },
    { value: 4, label: 'Four' }];

    return (
      _react.createElement((_ModalMultiSelect || _load_ModalMultiSelect()).ModalMultiSelect, {
        options: options,
        onChange: value => {
          this.setState({ value });
        },
        value: this.state.value }));


  }}


const DropdownExamples = exports.DropdownExamples = {
  sectionName: 'Dropdowns',
  description: 'For selecting things.',
  examples: [
  {
    title: 'Dropdown',
    component: DropdownExample },

  {
    title: 'Split Button Dropdown',
    component: SplitButtonDropdownExample },

  {
    title: 'Modal Multi-Select',
    component: ModalMultiSelectExample }] };