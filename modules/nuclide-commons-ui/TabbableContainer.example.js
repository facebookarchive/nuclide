"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TabbableContainerExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _AtomInput() {
  const data = require("./AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("./Button");

  _Button = function () {
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

function _TabbableContainer() {
  const data = _interopRequireDefault(require("./TabbableContainer"));

  _TabbableContainer = function () {
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
const labels = ['radio 1', 'radio 2', 'radio 3'];

class FormExample extends React.Component {
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
    return React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
      disabled: false,
      initialValue: "input field 1",
      placeholderText: "placeholder text"
    })), React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
      disabled: false,
      initialValue: "input field 2",
      placeholderText: "placeholder text"
    })), React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
      disabled: false,
      initialValue: "input field 3",
      placeholderText: "placeholder text"
    })), React.createElement(_Block().Block, null, React.createElement(_RadioGroup().default, {
      selectedIndex: this.state.selectedIndex,
      optionLabels: labels,
      onSelectedChange: this.onSelectedChange
    })), React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
      disabled: false,
      initialValue: "input field 4",
      placeholderText: "placeholder text"
    })), React.createElement(_Block().Block, null, React.createElement(_Button().Button, {
      className: "inline-block",
      size: "SMALL"
    }, "button 1"), React.createElement(_Button().Button, {
      className: "inline-block",
      size: "SMALL"
    }, "button 2"), React.createElement(_Button().Button, {
      className: "inline-block",
      size: "SMALL"
    }, "button 3")));
  }

}

const ContainedTabbableContainerExample = () => React.createElement(_TabbableContainer().default, {
  contained: true
}, React.createElement(FormExample, null));

const UncontainedTabbableContainerExample = () => React.createElement(_TabbableContainer().default, {
  contained: false
}, React.createElement(FormExample, null));

const TabbableContainerExamples = {
  sectionName: 'TabbableContainer',
  description: 'Allows tabbing and shift-tabbing to change the focus of the inputs.',
  examples: [{
    title: 'Contained (focus will be contained in this section)',
    component: ContainedTabbableContainerExample
  }, {
    title: 'Uncontained',
    component: UncontainedTabbableContainerExample
  }]
};
exports.TabbableContainerExamples = TabbableContainerExamples;