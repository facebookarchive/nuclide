"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TabExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Tabs() {
  const data = _interopRequireDefault(require("./Tabs"));

  _Tabs = function () {
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
const tabs = [{
  name: 'one',
  tabContent: React.createElement("div", null, "One")
}, {
  name: 'two',
  tabContent: React.createElement("div", null, "Two")
}, {
  name: 'three',
  tabContent: React.createElement("div", null, "Three")
}, {
  name: 'four',
  tabContent: React.createElement("div", null, "Four")
}, {
  name: 'five',
  tabContent: React.createElement("div", null, "Five")
}];

class TabExample extends React.Component {
  constructor(props) {
    super(props);

    this.handleTabChange = newTabName => {
      this.setState({
        activeTabName: newTabName.name
      });
    };

    this.state = {
      activeTabName: 'one'
    };
  }

  render() {
    const {
      activeTabName
    } = this.state;
    return React.createElement(_Block().Block, null, React.createElement(_Tabs().default, {
      tabs: tabs,
      activeTabName: activeTabName,
      triggeringEvent: "onClick",
      onActiveTabChange: this.handleTabChange
    }), React.createElement("div", {
      style: {
        padding: '2em 0 2em 0'
      }
    }, "Showing content for tab \"", activeTabName, "\"."));
  }

}

const TabExamples = {
  sectionName: 'Tabs',
  description: '',
  examples: [{
    title: '',
    component: TabExample
  }]
};
exports.TabExamples = TabExamples;