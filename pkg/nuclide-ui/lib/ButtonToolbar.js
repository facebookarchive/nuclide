Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactForAtom = require('react-for-atom');

/**
 * Visually groups Buttons passed in as children.
 */
var ButtonToolbar = function ButtonToolbar(props) {
  var children = props.children;
  var className = props.className;

  return _reactForAtom.React.createElement(
    'div',
    { className: (0, _classnames2['default'])('btn-toolbar', className) },
    children
  );
};
exports.ButtonToolbar = ButtonToolbar;