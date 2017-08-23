'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TabExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _Tabs;

function _load_Tabs() {
  return _Tabs = _interopRequireDefault(require('./Tabs'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tabs = [{
  name: 'one',
  tabContent: _react.default.createElement(
    'div',
    null,
    'One'
  )
}, {
  name: 'two',
  tabContent: _react.default.createElement(
    'div',
    null,
    'Two'
  )
}, {
  name: 'three',
  tabContent: _react.default.createElement(
    'div',
    null,
    'Three'
  )
}, {
  name: 'four',
  tabContent: _react.default.createElement(
    'div',
    null,
    'Four'
  )
}, {
  name: 'five',
  tabContent: _react.default.createElement(
    'div',
    null,
    'Five'
  )
}]; /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */

class TabExample extends _react.default.Component {

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
    const { activeTabName } = this.state;
    return _react.default.createElement(
      (_Block || _load_Block()).Block,
      null,
      _react.default.createElement((_Tabs || _load_Tabs()).default, {
        tabs: tabs,
        activeTabName: activeTabName,
        triggeringEvent: 'onClick',
        onActiveTabChange: this.handleTabChange
      }),
      _react.default.createElement(
        'div',
        { style: { padding: '2em 0 2em 0' } },
        'Showing content for tab "',
        activeTabName,
        '".'
      )
    );
  }
}

const TabExamples = exports.TabExamples = {
  sectionName: 'Tabs',
  description: '',
  examples: [{
    title: '',
    component: TabExample
  }]
};