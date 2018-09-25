"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Atomicon;
exports.getTypeFromIconName = getTypeFromIconName;

function _invert2() {
  const data = _interopRequireDefault(require("lodash/invert"));

  _invert2 = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _string() {
  const data = require("../nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
const TYPE_TO_ICON_NAME = {
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
};
const ICON_NAME_TO_TYPE = (0, _invert2().default)(TYPE_TO_ICON_NAME);

function Atomicon({
  type
}) {
  const displayName = (0, _string().capitalize)(type);
  return React.createElement("span", {
    className: (0, _classnames().default)('icon', 'icon-' + TYPE_TO_ICON_NAME[type]),
    role: "presentation",
    title: displayName
  });
}

function getTypeFromIconName(iconName) {
  return ICON_NAME_TO_TYPE[iconName];
}