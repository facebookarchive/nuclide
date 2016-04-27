Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _reactForAtom = require('react-for-atom');

var Toolbar = function Toolbar(props) {
  var className = (0, _classnames3['default'])('nuclide-ui-toolbar', _defineProperty({}, 'nuclide-ui-toolbar--' + props.location, props.location != null));

  return _reactForAtom.React.createElement(
    'div',
    { className: className },
    props.children
  );
};
exports.Toolbar = Toolbar;