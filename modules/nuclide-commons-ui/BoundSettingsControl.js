'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _SettingsControl;

function _load_SettingsControl() {
  return _SettingsControl = _interopRequireDefault(require('./SettingsControl'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class BoundSettingsControl extends _react.Component {

  constructor(props) {
    super(props);

    this._onChange = value => {
      atom.config.set(this.props.keyPath, value);
    };

    this.state = {
      value: atom.config.get(props.keyPath)
    };
  }

  _updateSubscription() {
    if (this._observeConfigDisposable != null) {
      this._observeConfigDisposable.dispose();
    }
    this._observeConfigDisposable = atom.config.onDidChange(this.props.keyPath, ({ newValue }) => {
      this.setState({ value: newValue });
    });
  }

  componentDidMount() {
    this._updateSubscription();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.keyPath !== this.props.keyPath) {
      this.setState({ value: atom.config.get(this.props.keyPath) });
      this._updateSubscription();
    }
  }

  componentWillUnmount() {
    if (this._observeConfigDisposable != null) {
      this._observeConfigDisposable.dispose();
    }
  }

  render() {
    const schema = atom.config.getSchema(this.props.keyPath);
    return _react.createElement((_SettingsControl || _load_SettingsControl()).default, {
      keyPath: this.props.keyPath,
      value: this.state.value,
      onChange: this._onChange,
      schema: schema
    });
  }

}
exports.default = BoundSettingsControl;