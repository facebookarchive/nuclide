'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _reactDom = require('react-dom');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class ClickOutsideBoundary extends _react.Component {

  constructor(props) {
    super(props);

    this._handleDocumentClick = e => {
      // A more straight-forward approach would be to use
      // `this._node.contains(e.target)`, however that fails in the edge case were
      // some other event handler causes the target to be removed from the DOM
      // before the event reaches the document root. So instead, we use this
      // reference comparison approach which works for all cases where an event
      // passed trough the boundary node, and makes it all the way to the document
      // root.
      if (e !== this._lastInternalEvent) {
        if (this.props.onClickOutside != null) {
          this.props.onClickOutside();
        }
      }
      this._lastInternalEvent = null;
    };

    this._handleInternalClick = e => {
      this._lastInternalEvent = e;
    };

    this._lastInternalEvent = null;
    this._node = null;
  }

  componentDidMount() {
    const node = this._node = (0, _reactDom.findDOMNode)(this);
    if (node == null) {
      return;
    }
    window.document.addEventListener('click', this._handleDocumentClick);
    // We use an actual DOM node (via refs) because React does not gaurnetee
    // any particular event ordering between synthentic events and native
    // events, and we require that the internal event fire before the global event.
    // https://discuss.reactjs.org/t/ordering-of-native-and-react-events/829/2
    node.addEventListener('click', this._handleInternalClick);
  }

  componentWillUnmount() {
    window.document.removeEventListener('click', this._handleDocumentClick);
    if (this._node != null) {
      this._node.removeEventListener('click', this._handleInternalClick);
    }
  }

  render() {
    const _props = this.props,
          { onClickOutside } = _props,
          passThroughProps = _objectWithoutProperties(_props, ['onClickOutside']);
    return _react.createElement('div', passThroughProps);
  }
}
exports.default = ClickOutsideBoundary;