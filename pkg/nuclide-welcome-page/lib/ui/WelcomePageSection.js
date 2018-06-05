'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../../../modules/nuclide-commons-ui/Checkbox');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class WelcomePageSection extends _react.Component {
  render() {
    return _react.createElement(
      'div',
      null,
      this.props.content,
      _react.createElement(
        'div',
        null,
        _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          checked: this.props.toHide,
          onChange: this.props.onSetHide
        }),
        'Don\'t show this again'
      )
    );
  }
}
exports.default = WelcomePageSection;