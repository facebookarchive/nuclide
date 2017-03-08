'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactForAtom = require('react-for-atom');

class ContextViewMessage extends _reactForAtom.React.Component {

  render() {
    return _reactForAtom.React.createElement(
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
                                       */

/**
 * A message view to be shown in Context View.
 */

ContextViewMessage.NO_DEFINITION = 'No definition selected.';
ContextViewMessage.LOADING = 'Loading...';
ContextViewMessage.NOT_LOGGED_IN = _reactForAtom.React.createElement(
  'div',
  null,
  _reactForAtom.React.createElement(
    'div',
    null,
    'You need to log in to see this data!'
  )
);