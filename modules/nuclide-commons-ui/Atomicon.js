'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Atomicon;

var _react = _interopRequireWildcard(require('react'));

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const TYPE_TO_CLASSNAME_SUFFIX = {
  array: 'type-array',
  boolean: 'type-boolean',
  class: 'type-class',
  constant: 'type-constant',
  constructor: 'type-constructor',
  enum: 'type-enum',
  field: 'type-field',
  file: 'type-file',
  function: 'type-function',
  interface: 'type-interface',
  method: 'type-method',
  module: 'type-module',
  namespace: 'type-namespace',
  number: 'type-number',
  package: 'type-package',
  property: 'type-property',
  string: 'type-string',
  variable: 'type-variable'
}; /**
    * Copyright (c) 2017-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the BSD-style license found in the
    * LICENSE file in the root directory of this source tree. An additional grant
    * of patent rights can be found in the PATENTS file in the same directory.
    *
    * 
    * @format
    */

function Atomicon({ type }) {
  const displayName = (0, (_string || _load_string()).capitalize)(type);
  return _react.createElement('span', {
    'aria-label': displayName,
    className: (0, (_classnames || _load_classnames()).default)('icon', 'icon-' + TYPE_TO_CLASSNAME_SUFFIX[type]),
    role: 'presentation',
    title: displayName
  });
}