"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RadioGroupExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _RadioGroup() {
  const data = _interopRequireDefault(require("./RadioGroup"));

  _RadioGroup = function () {
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
const labels = ['choose', 'from', 'one of', 'several', 'options'];

class RadioGroupExample extends React.Component {
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
    return React.createElement(_Block().Block, null, React.createElement(_RadioGroup().default, {
      selectedIndex: this.state.selectedIndex,
      optionLabels: labels,
      onSelectedChange: this.onSelectedChange
    }));
  }

}

const RadioGroupExamples = {
  sectionName: 'RadioGroup',
  description: '',
  examples: [{
    title: '',
    component: RadioGroupExample
  }]
};
exports.RadioGroupExamples = RadioGroupExamples;