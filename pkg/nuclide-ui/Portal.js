'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Portal = undefined;

var _reactForAtom = require('react-for-atom');

/**
 * Renders a single React element into a different part of the DOM. This allows you to maintain the
 * declarative nature of React components.
 */
let Portal = exports.Portal = class Portal extends _reactForAtom.React.Component {

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
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._container);
    }

    if (element != null) {
      _reactForAtom.ReactDOM.render(_reactForAtom.React.Children.only(element), container);
    }

    this._container = container;
    this._renderedChildren = element;
  }

  render() {
    // Don't actually render anything here.
    return null;
  }

};