'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _PulseButton;

function _load_PulseButton() {
  return _PulseButton = _interopRequireDefault(require('./PulseButton'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

class PulseButtonWithTooltip extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      isDismissing: false,
      dismissed: false
    }, this._handleDivRef = el => {
      this._divEl = el;
    }, this._handleDismiss = () => {
      this.setState({ isDismissing: true });
      if (this.props.onDismiss != null) {
        this.props.onDismiss();
      }
    }, this._handleButtonClick = e => {
      const { onClick } = this.props;
      const tooltip = this._getTooltip();
      if (tooltip != null) {
        tooltip.show();
      }

      if (onClick != null) {
        onClick(e);
      }
    }, _temp;
  }

  componentDidMount() {
    this._tooltipDisposable = this._updateTooltip();
    (0, (_nullthrows || _load_nullthrows()).default)(this._getTooltip()).hide();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._tooltipDisposable);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.isDismissing && this.state.isDismissing) {
      const tooltip = this._getTooltip();
      if (tooltip != null) {
        tooltip.hide();
      }
      this.setState({ dismissed: true });
    }

    if (prevProps.tooltipText !== this.props.tooltipText) {
      this._tooltipDisposable.dispose();
      this._tooltipDisposable = this._updateTooltip();
    }
  }

  componentWillUnmount() {
    (0, (_nullthrows || _load_nullthrows()).default)(this._disposables).dispose();
  }

  _updateTooltip() {
    return atom.tooltips.add((0, (_nullthrows || _load_nullthrows()).default)(this._divEl), {
      item: createTooltipBody(this.props.tooltipText, this._handleDismiss),
      trigger: 'manual'
    });
  }

  _getTooltip() {
    if (this._divEl == null) {
      return;
    }

    return atom.tooltips.findTooltips(this._divEl)[0];
  }

  render() {
    const {
      ariaLabel,
      className,
      isSelected,
      size,
      style,
      onMouseOver,
      onMouseLeave,
      wrapperStyle
    } = this.props;

    if (this.state.dismissed) {
      return null;
    }

    return _react.createElement(
      'div',
      { ref: this._handleDivRef, style: wrapperStyle },
      _react.createElement((_PulseButton || _load_PulseButton()).default, {
        ariaLabel: ariaLabel,
        className: className,
        isSelected: isSelected,
        onClick: this._handleButtonClick,
        size: size,
        style: style,
        onMouseOver: onMouseOver,
        onMouseLeave: onMouseLeave
      })
    );
  }
}

exports.default = PulseButtonWithTooltip;
function createTooltipBody(title, onDismiss) {
  const div = document.createElement('div');
  const p = document.createElement('p');
  p.innerText = title;
  div.appendChild(p);

  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.innerText = 'Got it';
  button.addEventListener('click', onDismiss);
  div.appendChild(button);
  return div;
}