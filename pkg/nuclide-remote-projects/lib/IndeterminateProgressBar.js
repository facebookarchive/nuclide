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
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

/**
 * Component to entertain the user while he is waiting to hear back from the server.
 */
let IndeterminateProgressBar = class IndeterminateProgressBar extends _reactForAtom.React.Component {
  render() {
    return _reactForAtom.React.createElement(
      'div',
      { className: 'text-center padded' },
      _reactForAtom.React.createElement('span', { className: 'loading loading-spinner-medium inline-block' })
    );
  }
};
exports.default = IndeterminateProgressBar;
module.exports = exports['default'];