'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.RadioGroupExamples = undefined;











var _react = _interopRequireWildcard(require('react'));var _Block;
function _load_Block() {return _Block = require('./Block');}var _RadioGroup;
function _load_RadioGroup() {return _RadioGroup = _interopRequireDefault(require('./RadioGroup'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}

const labels = ['choose', 'from', 'one of', 'several', 'options']; /**
                                                                    * Copyright (c) 2017-present, Facebook, Inc.
                                                                    * All rights reserved.
                                                                    *
                                                                    * This source code is licensed under the BSD-style license found in the
                                                                    * LICENSE file in the root directory of this source tree. An additional grant
                                                                    * of patent rights can be found in the PATENTS file in the same directory.
                                                                    *
                                                                    * 
                                                                    * @format
                                                                    */class RadioGroupExample extends _react.Component {constructor(props) {super(props);this.onSelectedChange = selectedIndex => {
      this.setState({
        selectedIndex });

    };this.state = { selectedIndex: 0 };}

  render() {
    return (
      _react.createElement((_Block || _load_Block()).Block, null,
        _react.createElement((_RadioGroup || _load_RadioGroup()).default, {
          selectedIndex: this.state.selectedIndex,
          optionLabels: labels,
          onSelectedChange: this.onSelectedChange })));



  }}


const RadioGroupExamples = exports.RadioGroupExamples = {
  sectionName: 'RadioGroup',
  description: '',
  examples: [
  {
    title: '',
    component: RadioGroupExample }] };