'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class TruncatedButton extends _react.Component {
  render() {
    const _props = this.props,
          { children, className, label } = _props,
          props = _objectWithoutProperties(_props, ['children', 'className', 'label']);
    return _react.createElement(
      (_Button || _load_Button()).Button,
      Object.assign({
        className: (0, (_classnames || _load_classnames()).default)('btn-block', 'nuclide-ui-truncated-button', className),
        title: label
      }, props),
      children || label
    );
  }
}
exports.default = TruncatedButton;