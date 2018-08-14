"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _AtomInput() {
  const data = require("./AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _SettingsUtils() {
  const data = require("./SettingsUtils");

  _SettingsUtils = function () {
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
class SettingsInput extends React.Component {
  constructor(props) {
    super(props);

    this._handleChange = newValue_ => {
      let newValue = newValue_;

      if (this._ignoreInputCallback) {
        return;
      }

      newValue = (0, _SettingsUtils().parseValue)(this.props.type, newValue);
      this.props.onChange(newValue);
    };

    this._onFocus = () => {
      const keyPath = this.props.keyPath;
      const input = this._input;

      if (!(input != null)) {
        throw new Error("Invariant violation: \"input != null\"");
      }

      if ((0, _SettingsUtils().isDefaultConfigValue)(keyPath)) {
        const defaultValue = (0, _SettingsUtils().getDefaultConfigValueString)(keyPath);

        this._updateInput(input, defaultValue);
      }
    };

    this._onBlur = () => {
      const keyPath = this.props.keyPath;
      const input = this._input;

      if (!(input != null)) {
        throw new Error("Invariant violation: \"input != null\"");
      }

      if ((0, _SettingsUtils().isDefaultConfigValue)(keyPath, input.getText())) {
        this._updateInput(input, '');
      }
    };

    this._ignoreInputCallback = false;
  }

  _updateInput(input, newValue) {
    this._ignoreInputCallback = true;
    input.setText(newValue);
    this._ignoreInputCallback = false;
  }

  _getValue() {
    let value = (0, _SettingsUtils().valueToString)(this.props.value);
    const defaultValue = (0, _SettingsUtils().getDefaultConfigValueString)(this.props.keyPath);

    if (defaultValue === value) {
      value = '';
    }

    return value;
  }

  _getPlaceholder() {
    const defaultValue = (0, _SettingsUtils().getDefaultConfigValueString)(this.props.keyPath);
    return defaultValue ? 'Default: ' + defaultValue : '';
  }

  componentDidUpdate(prevProps) {
    const input = this._input;

    if (!(input != null)) {
      throw new Error("Invariant violation: \"input != null\"");
    }

    const value = this._getValue();

    if (input.getText() !== value) {
      this._updateInput(input, value);
    }
  }

  render() {
    const keyPath = this.props.keyPath;
    const id = (0, _SettingsUtils().normalizeIdentifier)(keyPath);
    const title = this.props.title;
    const description = this.props.description;

    const value = this._getValue();

    const placeholder = this._getPlaceholder();

    return React.createElement("div", null, React.createElement("label", {
      className: "control-label"
    }, React.createElement("div", {
      className: "setting-title"
    }, title), React.createElement("div", {
      className: "setting-description"
    }, description)), React.createElement("div", {
      className: "controls"
    }, React.createElement("div", {
      className: "editor-container"
    }, React.createElement("subview", null, React.createElement(_AtomInput().AtomInput, {
      className: id,
      initialValue: value,
      onDidChange: this._handleChange,
      onFocus: this._onFocus,
      onBlur: this._onBlur,
      placeholderText: placeholder,
      ref: input => {
        this._input = input;
      },
      text: value
    })))));
  }

}

exports.default = SettingsInput;