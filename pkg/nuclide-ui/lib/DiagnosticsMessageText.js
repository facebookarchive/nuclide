Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var DiagnosticsMessageText = function DiagnosticsMessageText(props) {
  var message = props.message;

  if (message.html != null) {
    return (_reactForAtom2 || _reactForAtom()).React.createElement('span', { dangerouslySetInnerHTML: { __html: message.html } });
  } else if (message.text != null) {
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'span',
      null,
      message.text
    );
  } else {
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'span',
      null,
      'Diagnostic lacks message.'
    );
  }
};
exports.DiagnosticsMessageText = DiagnosticsMessageText;