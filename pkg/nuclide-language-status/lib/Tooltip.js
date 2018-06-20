'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Higher order component class for rendering a stylable hover tooltip.
const makeTooltip = TooltipComponent => {
  class HigherOrderTooltip extends _react.Component {
    constructor(...args) {
      var _temp;

      return _temp = super(...args), this.props = {
        parentRef: null
      }, this.state = {
        tooltipRoot: null
      }, this._showTooltip = () => {
        if (this.props.parentRef == null || this._tooltipDisposable != null) {
          return;
        }

        this._tooltipDisposable = atom.tooltips.add(this.props.parentRef, {
          delay: 0,
          item: document.createElement('div'),
          placement: 'bottom',
          trigger: 'manual'
        });
        const tooltip = this.props.parentRef != null ? atom.tooltips.tooltips.get(this.props.parentRef) : null;
        if (tooltip != null && tooltip[0] != null) {
          const tooltipRoot = tooltip[0].getTooltipElement();
          this.setState({ tooltipRoot });
        }
      }, this._hideTooltip = () => {
        if (this._tooltipDisposable != null) {
          (0, (_nullthrows || _load_nullthrows()).default)(this._tooltipDisposable).dispose();
        }
        this.setState({ tooltipRoot: null });
        this._tooltipDisposable = null;
      }, _temp;
    }

    componentDidMount() {
      this._showTooltip();
    }

    componentWillUnmount() {
      this._hideTooltip();
    }

    componentDidUpdate(prevProps) {
      const { parentRef: prevParentRef } = prevProps;
      const { parentRef } = this.props;

      // Re-render tooltip if the parent element changed.
      if (prevParentRef !== parentRef) {
        this._hideTooltip();
        this._showTooltip();
      }
    }

    render() {
      // The structure of Atom tooltips looks like
      // <div class="tooltip">
      //   <div class="tooltip-arrow"/>
      //   <div class="tooltip-inner"/>
      // </div>
      //
      // Use createPortal() here to render the TooltipComponent into the
      // "tooltip-inner" div.
      const container = this._getContainer();
      return container == null ? null : _reactDom.default.createPortal(_react.createElement(TooltipComponent, Object.assign({
        tooltipRoot: this.state.tooltipRoot,
        showTooltip: this._showTooltip,
        hideTooltip: this._hideTooltip
      }, this.props)), container);
    }

    _getContainer() {
      return this.state.tooltipRoot == null ? null : Array.from(this.state.tooltipRoot.children).find(element => element.className.includes('tooltip-inner'));
    }

  }

  return HigherOrderTooltip;
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

exports.default = makeTooltip;