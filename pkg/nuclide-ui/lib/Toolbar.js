Object.defineProperty(exports, '__esModule', {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var Toolbar = function Toolbar(props) {
  var className = (0, (_classnames2 || _classnames()).default)('nuclide-ui-toolbar', _defineProperty({}, 'nuclide-ui-toolbar--' + props.location, props.location != null));

  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { className: className },
    props.children
  );
};
exports.Toolbar = Toolbar;