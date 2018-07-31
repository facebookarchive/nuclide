"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _TextEditorBanner() {
  const data = require("./TextEditorBanner");

  _TextEditorBanner = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("./Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _Message() {
  const data = require("./Message");

  _Message = function () {
    return data;
  };

  return data;
}

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
class ReadOnlyNotice extends React.Component {
  render() {
    let editAnywayButton;

    if (this.props.canEditAnyway) {
      editAnywayButton = React.createElement(_Button().Button, {
        buttonType: _Button().ButtonTypes.INFO,
        onClick: this.props.onEditAnyway
      }, "Edit Anyway");
    }

    const dismissButton = React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.INFO,
      onClick: this.props.onDismiss
    }, "Dismiss");
    return React.createElement(_TextEditorBanner().Notice, {
      messageType: _Message().MessageTypes.info
    }, React.createElement("span", null, React.createElement("strong", null, "This is a read-only file."), React.createElement("br", null), this.props.detailedMessage), React.createElement("div", null, editAnywayButton, dismissButton));
  }

}

exports.default = ReadOnlyNotice;