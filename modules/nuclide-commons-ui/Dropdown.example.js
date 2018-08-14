"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DropdownExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Dropdown() {
  const data = require("./Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _SplitButtonDropdown() {
  const data = require("./SplitButtonDropdown");

  _SplitButtonDropdown = function () {
    return data;
  };

  return data;
}

function _ModalMultiSelect() {
  const data = require("./ModalMultiSelect");

  _ModalMultiSelect = function () {
    return data;
  };

  return data;
}

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

/* global alert */
const DropdownExample = (() => {
  const options = [{
    value: 1,
    label: 'One'
  }, {
    value: 2,
    label: 'Two'
  }, {
    value: 3,
    label: 'Three'
  }, {
    value: 4,
    label: 'Four'
  }];
  return () => React.createElement("div", null, React.createElement(_Dropdown().Dropdown, {
    options: options,
    value: 2
  }));
})();

const SplitButtonDropdownExample = (() => {
  const options = [{
    value: 1,
    label: 'Build',
    icon: 'tools'
  }, {
    value: 2,
    label: 'Run',
    icon: 'triangle-right',
    selectedLabel: 'Run It!'
  }, {
    value: 3,
    label: 'Rocket',
    icon: 'rocket'
  }, {
    type: 'separator'
  }, {
    value: 4,
    label: 'Squirrel',
    icon: 'squirrel'
  }, {
    value: 5,
    label: 'Beaker',
    icon: 'telescope',
    disabled: true
  }];
  return () => React.createElement("div", null, React.createElement(_SplitButtonDropdown().SplitButtonDropdown, {
    options: options,
    value: 2,
    onConfirm: // eslint-disable-next-line no-alert
    x => alert(`You selected ${x}!`)
  }));
})();

class ModalMultiSelectExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: [2]
    };
  }

  render() {
    const options = [{
      value: 1,
      label: 'One'
    }, {
      value: 2,
      label: 'Two'
    }, {
      value: 3,
      label: 'Three'
    }, {
      value: 4,
      label: 'Four'
    }];
    return React.createElement(_ModalMultiSelect().ModalMultiSelect, {
      options: options,
      onChange: value => {
        this.setState({
          value
        });
      },
      value: this.state.value
    });
  }

}

const DropdownExamples = {
  sectionName: 'Dropdowns',
  description: 'For selecting things.',
  examples: [{
    title: 'Dropdown',
    component: DropdownExample
  }, {
    title: 'Split Button Dropdown',
    component: SplitButtonDropdownExample
  }, {
    title: 'Modal Multi-Select',
    component: ModalMultiSelectExample
  }]
};
exports.DropdownExamples = DropdownExamples;