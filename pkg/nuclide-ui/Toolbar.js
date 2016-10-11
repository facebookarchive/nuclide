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

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsNodeString;

function _load_commonsNodeString() {
  return _commonsNodeString = require('../commons-node/string');
}

var Toolbar = function Toolbar(props) {
  var className = (0, (_classnames || _load_classnames()).default)('nuclide-ui-toolbar', _defineProperty({}, 'nuclide-ui-toolbar--' + (0, (_commonsNodeString || _load_commonsNodeString()).maybeToString)(props.location), props.location != null), props.className);

  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    { className: className },
    props.children
  );
};
exports.Toolbar = Toolbar;