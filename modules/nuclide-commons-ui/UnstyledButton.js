'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
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

class UnstyledButton extends _react.default.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._setRef = node => this._node = node, _temp;
  }

  focus() {
    (0, (_nullthrows || _load_nullthrows()).default)(this._node).focus();
  }

  render() {
    const _props = this.props,
          { className } = _props,
          props = _objectWithoutProperties(_props, ['className']);
    const classes = (0, (_classnames || _load_classnames()).default)('nuclide-ui-unstyled-button', className);
    // eslint-disable-next-line rulesdir/use-nuclide-ui-components
    return _react.default.createElement('button', Object.assign({ className: classes, ref: this._setRef }, props));
  }
}
exports.default = UnstyledButton;