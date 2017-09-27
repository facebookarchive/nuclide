'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TabbableContainer = exports.TABBABLE = undefined;

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// NOTE: This constant must be kept in sync with the keybinding in
//       ../nuclide-tab-focus/keymaps/nuclide-tab-focus.json
const TABBABLE = exports.TABBABLE = 'nuclide-tabbable'; /**
                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                         * All rights reserved.
                                                         *
                                                         * This source code is licensed under the license found in the LICENSE file in
                                                         * the root directory of this source tree.
                                                         *
                                                         * 
                                                         * @format
                                                         */

class TabbableContainer extends _react.Component {

  render() {
    return _react.createElement(
      'div',
      { className: TABBABLE, 'data-contained': this.props.contained },
      this.props.children
    );
  }
}
exports.TabbableContainer = TabbableContainer;
TabbableContainer.defaultProps = {
  contained: false
};