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
exports.View = undefined;

var _reactForAtom = require('react-for-atom');

/**
 * A React component used for rendering an item associated with a view via Atom's view registry.
 * Because we're going through Atom's ViewRegistry (which returns DOM nodes), we need to render an
 * empty element and manually attach the view (DOM element) we get from Atom.
 */
let View = exports.View = class View extends _reactForAtom.React.Component {

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
    const container = _reactForAtom.ReactDOM.findDOMNode(this);
    while (container.lastChild != null) {
      container.removeChild(container.lastChild);
    }

    this._renderedItem = item;
    if (item == null) {
      return;
    }
    const el = atom.views.getView(item);
    container.appendChild(el);
  }

  render() {
    return _reactForAtom.React.createElement('nuclide-react-mount-root', null);
  }
};