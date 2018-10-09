"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _PulseButton() {
  const data = _interopRequireDefault(require("./PulseButton"));

  _PulseButton = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class PulseButtonWithTooltip extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      isDismissing: false,
      dismissed: false
    }, this._handleDivRef = el => {
      this._divEl = el;
    }, this._handleDismiss = () => {
      this.setState({
        isDismissing: true
      });

      if (this.props.onDismiss != null) {
        this.props.onDismiss();
      }
    }, this._handleButtonClick = e => {
      const {
        onClick
      } = this.props;

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
    (0, _nullthrows().default)(this._getTooltip()).hide();
    this._disposables = new (_UniversalDisposable().default)(this._tooltipDisposable);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.isDismissing && this.state.isDismissing) {
      const tooltip = this._getTooltip();

      if (tooltip != null) {
        tooltip.hide();
      }

      this.setState({
        dismissed: true
      });
    }

    if (prevProps.tooltipText !== this.props.tooltipText) {
      this._tooltipDisposable.dispose();

      this._tooltipDisposable = this._updateTooltip();
    }
  }

  componentWillUnmount() {
    (0, _nullthrows().default)(this._disposables).dispose();
  }

  _updateTooltip() {
    return atom.tooltips.add((0, _nullthrows().default)(this._divEl), {
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

    return React.createElement("div", {
      ref: this._handleDivRef,
      style: wrapperStyle
    }, React.createElement(_PulseButton().default, {
      ariaLabel: ariaLabel,
      className: className,
      isSelected: isSelected,
      onClick: this._handleButtonClick,
      size: size,
      style: style,
      onMouseOver: onMouseOver,
      onMouseLeave: onMouseLeave
    }));
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