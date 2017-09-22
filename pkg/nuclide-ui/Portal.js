'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Portal = undefined;

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Renders a single React element into a different part of the DOM. This allows you to maintain the
 * declarative nature of React components.
 */
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

class Portal extends _react.Component {

  componentDidMount() {
    // Do the initial render.
    this._render(this.props.children, this.props.container);
  }

  componentWillUnmount() {
    this._render(null, this.props.container);
  }

  componentDidUpdate() {
    this._render(this.props.children, this.props.container);
  }

  _render(element, container) {
    if (this._container != null && (container !== this._container || element == null)) {
      _reactDom.default.unmountComponentAtNode(this._container);
    }

    if (element != null) {
      _reactDom.default.render(_react.Children.only(element), container);
    }

    this._container = container;
    this._renderedChildren = element;
  }

  render() {
    // Don't actually render anything here.
    return null;
  }
}
exports.Portal = Portal;