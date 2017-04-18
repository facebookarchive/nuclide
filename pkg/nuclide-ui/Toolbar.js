'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Toolbar = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

var _string;

function _load_string() {
  return _string = require('../commons-node/string');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Toolbar = exports.Toolbar = props => {
  const className = (0, (_classnames || _load_classnames()).default)('nuclide-ui-toolbar', {
    [`nuclide-ui-toolbar--${(0, (_string || _load_string()).maybeToString)(props.location)}`]: props.location != null
  }, props.className);

  return _react.default.createElement(
    'div',
    { className: className },
    props.children
  );
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    */