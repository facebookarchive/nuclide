'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class ContextViewMessage extends _react.Component {

  render() {
    return _react.createElement(
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
ContextViewMessage.NOT_LOGGED_IN = _react.createElement(
  'div',
  null,
  _react.createElement(
    'div',
    null,
    'You need to log in to see this data!'
  )
);