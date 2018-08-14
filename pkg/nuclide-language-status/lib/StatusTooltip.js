"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _Tooltip() {
  const data = _interopRequireDefault(require("./Tooltip"));

  _Tooltip = function () {
    return data;
  };

  return data;
}

function _marked() {
  const data = _interopRequireDefault(require("marked"));

  _marked = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class StatusTooltipComponent extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._renderButtons = () => {
      const {
        provider,
        data
      } = this.props.status;

      if (data.kind !== 'red' || data.buttons.length === 0) {
        return null;
      }

      return React.createElement(_ButtonGroup().ButtonGroup, null, data.buttons.map(b => React.createElement(_Button().Button, {
        key: b,
        buttonType: _Button().ButtonTypes.ERROR,
        onClick: () => {
          provider.clickStatus((0, _nullthrows().default)(this.props.editor), data.id || '', b);
          this.props.hideTooltip();
        }
      }, b)));
    }, _temp;
  }

  render() {
    this._styleTooltip();

    const {
      data,
      provider
    } = this.props.status;

    if (!(data.kind !== 'null')) {
      throw new Error("Invariant violation: \"data.kind !== 'null'\"");
    }

    const message = data.message;
    return React.createElement("div", {
      className: "nuclide-language-status-tooltip-content"
    }, message == null ? null : React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: (0, _marked().default)(message)
      }
    }), message == null ? null : React.createElement("hr", null), React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: (0, _marked().default)(provider.description || '')
      }
    }), this._renderButtons());
  }

  _styleTooltip() {
    const {
      tooltipRoot,
      status
    } = this.props;

    if (tooltipRoot != null) {
      tooltipRoot.classList.remove('nuclide-language-status-tooltip-green', 'nuclide-language-status-tooltip-yellow', 'nuclide-language-status-tooltip-red');
      tooltipRoot.classList.add('nuclide-language-status-tooltip-' + status.data.kind);
    }
  }

}

const StatusTooltip = (0, _Tooltip().default)(StatusTooltipComponent);
var _default = StatusTooltip;
exports.default = _default;