"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _AtomTextEditor() {
  const data = require("../../../../modules/nuclide-commons-ui/AtomTextEditor");

  _AtomTextEditor = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class Console extends React.Component {
  render() {
    return React.createElement(_AtomTextEditor().AtomTextEditor, {
      correctContainerWidth: false,
      gutterHidden: true,
      path: ".ansi",
      readOnly: true,
      textBuffer: this.props.textBuffer
    });
  }

}

exports.default = Console;