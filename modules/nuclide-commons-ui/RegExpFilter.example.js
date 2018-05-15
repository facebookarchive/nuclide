'use strict';Object.defineProperty(exports, "__esModule", { value: true });













var _react = _interopRequireWildcard(require('react'));var _Block;
function _load_Block() {return _Block = require('./Block');}var _RegExpFilter;
function _load_RegExpFilter() {return _RegExpFilter = _interopRequireDefault(require('./RegExpFilter'));}var _RegExpFilter2;function _load_RegExpFilter2() {return _RegExpFilter2 = require('./RegExpFilter');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *  strict-local
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */class Example extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.state = { text: '',
      isRegExp: false,
      invalid: false }, this.

















    _handleChange = change => {
      const { invalid } = (0, (_RegExpFilter2 || _load_RegExpFilter2()).getFilterPattern)(change.text, change.isRegExp);
      this.setState(Object.assign({}, change, { invalid }));
    }, _temp;}render() {const { text, isRegExp, invalid } = this.state;return _react.createElement('div', null, _react.createElement((_Block || _load_Block()).Block, null, _react.createElement((_RegExpFilter || _load_RegExpFilter()).default, { value: { text, isRegExp, invalid }, onChange: this._handleChange })));}}exports.default =


{
  sectionName: 'RegExp Filter',
  description:
  'An input for filtering that allows the use of regular expressions.',
  examples: [
  {
    title: 'RegExpFilter',
    component: Example }] };