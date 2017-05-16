'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.View = undefined;

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A React component used for rendering an item associated with a view via Atom's view registry.
 * Because we're going through Atom's ViewRegistry (which returns DOM nodes), we need to render an
 * empty element and manually attach the view (DOM element) we get from Atom.
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

class View extends _react.default.Component {

  shouldComponentUpdate(nextProps) {
    return this.props.item !== nextProps.item;
  }

  componentDidMount() {
    this._update(this.props.item);
  }

  componentDidUpdate() {
    this._update(this.props.item);
  }

  _update(item) {
    if (item === this._renderedItem) {
      return;
    }

    // Remove the current children.
    const container = _reactDom.default.findDOMNode(this);
    // $FlowFixMe
    while (container.lastChild != null) {
      // $FlowFixMe
      container.removeChild(container.lastChild);
    }

    this._renderedItem = item;
    if (item == null) {
      return;
    }
    const el = atom.views.getView(item);
    // $FlowFixMe
    container.appendChild(el);
  }

  render() {
    return _react.default.createElement('nuclide-react-mount-root', null);
  }
}
exports.View = View;