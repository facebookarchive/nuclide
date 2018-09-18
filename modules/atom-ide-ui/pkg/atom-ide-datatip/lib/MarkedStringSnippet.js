"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _atom = require("atom");

var React = _interopRequireWildcard(require("react"));

function _AtomTextEditor() {
  const data = require("../../../../nuclide-commons-ui/AtomTextEditor");

  _AtomTextEditor = function () {
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
// Complex types can end up being super long. Truncate them.
const MAX_LENGTH = 100;

class MarkedStringSnippet extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      isExpanded: false
    }, _temp;
  }

  render() {
    const {
      grammar,
      value
    } = this.props;
    const shouldTruncate = value.length > MAX_LENGTH && !this.state.isExpanded;
    const buffer = new _atom.TextBuffer(shouldTruncate ? value.substr(0, MAX_LENGTH) + '...' : value);
    return React.createElement("div", {
      className: "datatip-marked-text-editor-container",
      onClick: e => {
        // TODO: (wbinnssmith) T30771435 this setState depends on current state
        // and should use an updater function rather than an object
        // eslint-disable-next-line react/no-access-state-in-setstate
        this.setState({
          isExpanded: !this.state.isExpanded
        });
        e.stopPropagation();
      }
    }, React.createElement(_AtomTextEditor().AtomTextEditor, {
      className: "datatip-marked-text-editor",
      gutterHidden: true,
      readOnly: true,
      syncTextContents: false,
      autoGrow: true,
      grammar: grammar,
      textBuffer: buffer
    }));
  }

}

exports.default = MarkedStringSnippet;