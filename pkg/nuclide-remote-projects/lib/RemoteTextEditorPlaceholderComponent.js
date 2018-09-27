"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _atom = require("atom");

function _AtomTextEditor() {
  const data = require("../../../modules/nuclide-commons-ui/AtomTextEditor");

  _AtomTextEditor = function () {
    return data;
  };

  return data;
}

function _Message() {
  const data = require("../../../modules/nuclide-commons-ui/Message");

  _Message = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class RemoteTextEditorPlaceholderComponent extends React.PureComponent {
  render() {
    const {
      hostname
    } = _nuclideUri().default.parseRemoteUri(this.props.uri);

    return React.createElement("div", {
      className: "nuclide-remote-text-editor-placeholder"
    }, React.createElement(_Message().Message, {
      className: "nuclide-remote-text-editor-placeholder-header",
      type: _Message().MessageTypes.info
    }, React.createElement("strong", null, "This is a read-only preview."), React.createElement("br", null), "Please reconnect to the remote host ", hostname, " to edit or save this file."), React.createElement(_AtomTextEditor().AtomTextEditor, {
      readOnly: true,
      textBuffer: new _atom.TextBuffer({
        filePath: this.props.uri,
        text: this.props.contents
      })
    }));
  }

}

exports.default = RemoteTextEditorPlaceholderComponent;