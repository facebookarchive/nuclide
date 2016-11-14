'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * A message view to be shown in Context View.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _class, _temp;

var _reactForAtom = require('react-for-atom');

let ContextViewMessage = (_temp = _class = class ContextViewMessage extends _reactForAtom.React.Component {

  render() {
    return _reactForAtom.React.createElement(
      'div',
      null,
      this.props.message
    );
  }
}, _class.NO_DEFINITION = 'No definition selected.', _class.LOADING = 'Loading...', _class.NOT_LOGGED_IN = _reactForAtom.React.createElement(
  'div',
  null,
  _reactForAtom.React.createElement(
    'div',
    null,
    'You need to log in to see this data!'
  )
), _temp);
exports.default = ContextViewMessage;
module.exports = exports['default'];