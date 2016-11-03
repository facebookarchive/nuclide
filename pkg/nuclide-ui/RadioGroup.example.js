'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RadioGroupExamples = undefined;

var _reactForAtom = require('react-for-atom');

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _RadioGroup;

function _load_RadioGroup() {
  return _RadioGroup = _interopRequireDefault(require('./RadioGroup'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const labels = ['choose', 'from', 'one of', 'several', 'options'];let RadioGroupExample = class RadioGroupExample extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.onSelectedChange = this.onSelectedChange.bind(this);
    this.state = {
      selectedIndex: 0
    };
  }

  onSelectedChange(selectedIndex) {
    this.setState({
      selectedIndex: selectedIndex
    });
  }

  render() {
    return _reactForAtom.React.createElement(
      (_Block || _load_Block()).Block,
      null,
      _reactForAtom.React.createElement((_RadioGroup || _load_RadioGroup()).default, {
        selectedIndex: this.state.selectedIndex,
        optionLabels: labels,
        onSelectedChange: this.onSelectedChange
      })
    );
  }
};
const RadioGroupExamples = exports.RadioGroupExamples = {
  sectionName: 'RadioGroup',
  description: '',
  examples: [{
    title: '',
    component: RadioGroupExample
  }]
};