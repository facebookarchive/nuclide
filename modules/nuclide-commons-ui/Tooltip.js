"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tooltip = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
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
// Our custom ref component invokes a callback after updating
// if the child component has changed. We need a custom ref component
// because stateless functional components can't have refs
class RefWrapper extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._el = null, _temp;
  }

  componentDidMount() {
    this._updateElement();
  }

  componentWillUnmount() {
    if (this._el != null) {
      this._el = null;
      this.props.customRef(null);
    }
  }

  _updateElement() {
    const el = _reactDom.default.findDOMNode(this);

    if (el !== this._el) {
      this._el = el;
      this.props.customRef(null);
      this.props.customRef(el);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      this._updateElement();
    }
  }

  render() {
    return React.Children.only(this.props.children);
  }

}

class Tooltip extends React.Component {
  constructor(props) {
    super(props);

    this._displayTooltip = element => {
      if (this._tooltip != null) {
        this._tooltip.dispose();
      }

      if (element != null) {
        this._element = element; // $FlowFixMe - HTMLElement is incompatible with Element

        this._tooltip = atom.tooltips.add(element, {
          title: this.props.title || '',
          delay: this.props.delay
        });
      }
    };

    this._element = null;
  }

  componentDidUpdate(prevProps) {
    if (this._element != null && this.props.title !== prevProps.title) {
      this._displayTooltip(this._element);
    }
  }

  render() {
    return React.createElement(RefWrapper, {
      customRef: this._displayTooltip
    }, this.props.children);
  }

}

exports.Tooltip = Tooltip;
Tooltip.defaultProps = {
  delay: 0
};