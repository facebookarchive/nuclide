'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class VcsLogGadget extends _react.default.Component {

  getTitle() {
    return this.props.title;
  }

  getIconName() {
    return this.props.iconName;
  }

  render() {
    const { component: Component } = this.props;
    return _react.default.createElement(Component, null);
  }
}
exports.default = VcsLogGadget; /**
                                 * Copyright (c) 2015-present, Facebook, Inc.
                                 * All rights reserved.
                                 *
                                 * This source code is licensed under the license found in the LICENSE file in
                                 * the root directory of this source tree.
                                 *
                                 * 
                                 * @format
                                 */