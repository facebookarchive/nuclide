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
exports.DiagnosticsMessageText = undefined;

var _reactForAtom = require('react-for-atom');

const DiagnosticsMessageText = exports.DiagnosticsMessageText = props => {
  const message = props.message;

  if (message.html != null) {
    return _reactForAtom.React.createElement('span', { dangerouslySetInnerHTML: { __html: message.html } });
  } else if (message.text != null) {
    return _reactForAtom.React.createElement(
      'span',
      null,
      message.text
    );
  } else {
    return _reactForAtom.React.createElement(
      'span',
      null,
      'Diagnostic lacks message.'
    );
  }
};