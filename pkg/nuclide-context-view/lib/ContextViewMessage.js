'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ContextViewMessage extends _react.default.Component {

  render() {
    return _react.default.createElement(
      'div',
      null,
      this.props.message
    );
  }
}
exports.default = ContextViewMessage; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       * 
                                       * @format
                                       */

/**
 * A message view to be shown in Context View.
 */

ContextViewMessage.NO_DEFINITION = 'No definition selected.';
ContextViewMessage.LOADING = 'Loading...';
ContextViewMessage.NOT_LOGGED_IN = _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    'div',
    null,
    'You need to log in to see this data!'
  )
);