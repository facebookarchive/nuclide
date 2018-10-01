"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderReactRoot = renderReactRoot;

var React = _interopRequireWildcard(require("react"));

function _ReactMountRootElement() {
  const data = _interopRequireDefault(require("./ReactMountRootElement"));

  _ReactMountRootElement = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/**
 * Create a DOM element and mount the React element in it. It will be unmounted when the node is
 * detached.
 */
function renderReactRoot(reactElement) {
  const element = new (_ReactMountRootElement().default)();
  element.setReactElement(reactElement);
  return element;
}