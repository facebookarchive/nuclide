'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.View = undefined;











var _react = _interopRequireWildcard(require('react'));
var _reactDom = _interopRequireDefault(require('react-dom'));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}





/**
                                                                                                                                                                                                                                                                                                                                                                                                                            * A React component used for rendering an item associated with a view via Atom's view registry.
                                                                                                                                                                                                                                                                                                                                                                                                                            * Because we're going through Atom's ViewRegistry (which returns DOM nodes), we need to render an
                                                                                                                                                                                                                                                                                                                                                                                                                            * empty element and manually attach the view (DOM element) we get from Atom.
                                                                                                                                                                                                                                                                                                                                                                                                                            */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                * 
                                                                                                                                                                                                                                                                                                                                                                                                                                * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                */class View extends _react.Component {shouldComponentUpdate(nextProps) {return this.props.item !== nextProps.item;}componentDidMount() {this._update(this.props.item);}

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
    return _react.createElement('nuclide-react-mount-root', null);
  }}exports.View = View;