'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../../nuclide-commons-ui/AtomInput');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

class RenameComponent extends _react.Component {
  constructor(props) {
    super(props);

    this._handleSubmit = event => {
      event.preventDefault();
      const { newName } = this.state;
      const { submitNewName } = this.props;

      return newName === '' ? submitNewName() : submitNewName(newName);
    };

    this._handleChange = text => {
      this.setState({ newName: text });
    };

    this._handleBlur = event => {
      this.props.submitNewName();
    };

    this.state = {
      newName: ''
    };
  }

  render() {
    // TODO: Have a min-width, but expand the actual width as necessary based on the length of the selected word
    //      (What VSCode does)
    const widthStyle = {
      minWidth: '150px'
    };
    return _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      style: widthStyle,
      autofocus: true,
      placeholderText: this.props.selectedText,
      value: this.state.newName,
      onDidChange: this._handleChange,
      onBlur: this._handleBlur,
      onConfirm: this._handleSubmit
    });
  }
}
exports.default = RenameComponent;