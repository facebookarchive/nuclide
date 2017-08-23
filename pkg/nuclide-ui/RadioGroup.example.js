'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RadioGroupExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _RadioGroup;

function _load_RadioGroup() {
  return _RadioGroup = _interopRequireDefault(require('./RadioGroup'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const labels = ['choose', 'from', 'one of', 'several', 'options']; /**
                                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                                    * All rights reserved.
                                                                    *
                                                                    * This source code is licensed under the license found in the LICENSE file in
                                                                    * the root directory of this source tree.
                                                                    *
                                                                    * 
                                                                    * @format
                                                                    */

class RadioGroupExample extends _react.default.Component {

  constructor(props) {
    super(props);

    this.onSelectedChange = selectedIndex => {
      this.setState({
        selectedIndex
      });
    };

    this.state = {
      selectedIndex: 0
    };
  }

  render() {
    return _react.default.createElement(
      (_Block || _load_Block()).Block,
      null,
      _react.default.createElement((_RadioGroup || _load_RadioGroup()).default, {
        selectedIndex: this.state.selectedIndex,
        optionLabels: labels,
        onSelectedChange: this.onSelectedChange
      })
    );
  }
}

const RadioGroupExamples = exports.RadioGroupExamples = {
  sectionName: 'RadioGroup',
  description: '',
  examples: [{
    title: '',
    component: RadioGroupExample
  }]
};