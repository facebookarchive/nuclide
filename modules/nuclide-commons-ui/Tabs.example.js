'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.TabExamples = undefined;











var _react = _interopRequireWildcard(require('react'));var _Block;
function _load_Block() {return _Block = require('./Block');}var _Tabs;
function _load_Tabs() {return _Tabs = _interopRequireDefault(require('./Tabs'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}

const tabs = [
{
  name: 'one',
  tabContent: _react.createElement('div', null, 'One') },

{
  name: 'two',
  tabContent: _react.createElement('div', null, 'Two') },

{
  name: 'three',
  tabContent: _react.createElement('div', null, 'Three') },

{
  name: 'four',
  tabContent: _react.createElement('div', null, 'Four') },

{
  name: 'five',
  tabContent: _react.createElement('div', null, 'Five') }]; /**
                                                             * Copyright (c) 2017-present, Facebook, Inc.
                                                             * All rights reserved.
                                                             *
                                                             * This source code is licensed under the BSD-style license found in the
                                                             * LICENSE file in the root directory of this source tree. An additional grant
                                                             * of patent rights can be found in the PATENTS file in the same directory.
                                                             *
                                                             * 
                                                             * @format
                                                             */class TabExample extends _react.Component {constructor(props) {super(props);this.

    handleTabChange = newTabName =>


    {
      this.setState({
        activeTabName: newTabName.name });

    };this.state = { activeTabName: 'one' };}

  render() {
    const { activeTabName } = this.state;
    return (
      _react.createElement((_Block || _load_Block()).Block, null,
        _react.createElement((_Tabs || _load_Tabs()).default, {
          tabs: tabs,
          activeTabName: activeTabName,
          triggeringEvent: 'onClick',
          onActiveTabChange: this.handleTabChange }),

        _react.createElement('div', { style: { padding: '2em 0 2em 0' } }, 'Showing content for tab "',
          activeTabName, '".')));



  }}


const TabExamples = exports.TabExamples = {
  sectionName: 'Tabs',
  description: '',
  examples: [
  {
    title: '',
    component: TabExample }] };