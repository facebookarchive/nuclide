'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Message;

function _load_Message() {
  return _Message = require('./Message');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MessageExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      (_Message || _load_Message()).Message,
      null,
      _react.default.createElement(
        'h2',
        null,
        'Message'
      ),
      'Hello, I\'m a simple message.'
    )
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      (_Message || _load_Message()).Message,
      { type: (_Message || _load_Message()).MessageTypes.info },
      'Hello I\'m an ',
      _react.default.createElement(
        'strong',
        null,
        'info'
      ),
      ' message.'
    )
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      (_Message || _load_Message()).Message,
      { type: (_Message || _load_Message()).MessageTypes.success },
      'Hello I\'m a ',
      _react.default.createElement(
        'strong',
        null,
        'success'
      ),
      ' message.'
    )
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      (_Message || _load_Message()).Message,
      { type: (_Message || _load_Message()).MessageTypes.warning },
      'Hello I\'m a ',
      _react.default.createElement(
        'strong',
        null,
        'warning'
      ),
      ' message.'
    )
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement(
      (_Message || _load_Message()).Message,
      { type: (_Message || _load_Message()).MessageTypes.error },
      'Hello I\'m an ',
      _react.default.createElement(
        'strong',
        null,
        'error'
      ),
      ' message.'
    )
  )
); /**
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

const MessageExamples = exports.MessageExamples = {
  sectionName: 'Messages',
  description: 'Message boxes are used to surface issues, such as warnings, inline within Nuclide.',
  examples: [{
    title: 'Basic Messages',
    component: MessageExample
  }]
};