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
exports.TabExamples = undefined;

var _reactForAtom = require('react-for-atom');

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Tabs;

function _load_Tabs() {
  return _Tabs = _interopRequireDefault(require('./Tabs'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tabs = [{
  name: 'one',
  tabContent: _reactForAtom.React.createElement(
    'div',
    null,
    'One'
  )
}, {
  name: 'two',
  tabContent: _reactForAtom.React.createElement(
    'div',
    null,
    'Two'
  )
}, {
  name: 'three',
  tabContent: _reactForAtom.React.createElement(
    'div',
    null,
    'Three'
  )
}, {
  name: 'four',
  tabContent: _reactForAtom.React.createElement(
    'div',
    null,
    'Four'
  )
}, {
  name: 'five',
  tabContent: _reactForAtom.React.createElement(
    'div',
    null,
    'Five'
  )
}];let TabExample = class TabExample extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.state = {
      activeTabName: 'one'
    };
  }

  handleTabChange(newTabName) {
    this.setState({
      activeTabName: newTabName.name
    });
  }

  render() {
    const activeTabName = this.state.activeTabName;

    return _reactForAtom.React.createElement(
      (_Block || _load_Block()).Block,
      null,
      _reactForAtom.React.createElement((_Tabs || _load_Tabs()).default, {
        tabs: tabs,
        activeTabName: activeTabName,
        triggeringEvent: 'onClick',
        onActiveTabChange: this.handleTabChange
      }),
      _reactForAtom.React.createElement(
        'div',
        { style: { padding: '2em 0 2em 0' } },
        'Showing content for tab "',
        activeTabName,
        '".'
      )
    );
  }
};
const TabExamples = exports.TabExamples = {
  sectionName: 'Tabs',
  description: '',
  examples: [{
    title: '',
    component: TabExample
  }]
};