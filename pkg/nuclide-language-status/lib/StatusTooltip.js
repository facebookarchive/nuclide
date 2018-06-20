'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Tooltip;

function _load_Tooltip() {
  return _Tooltip = _interopRequireDefault(require('./Tooltip'));
}

var _marked;

function _load_marked() {
  return _marked = _interopRequireDefault(require('marked'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../../modules/nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../modules/nuclide-commons-ui/ButtonGroup');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class StatusTooltipComponent extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._renderButtons = () => {
      const { provider, data } = this.props.status;
      if (data.kind !== 'red' || data.buttons.length === 0) {
        return null;
      }
      return _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        data.buttons.map(b => _react.createElement(
          (_Button || _load_Button()).Button,
          {
            key: b,
            buttonType: (_Button || _load_Button()).ButtonTypes.ERROR,
            onClick: () => {
              provider.clickStatus((0, (_nullthrows || _load_nullthrows()).default)(this.props.editor), data.id || '', b);
              this.props.hideTooltip();
            } },
          b
        ))
      );
    }, _temp;
  }

  render() {
    this._styleTooltip();
    const { data, provider } = this.props.status;

    if (!(data.kind !== 'null')) {
      throw new Error('Invariant violation: "data.kind !== \'null\'"');
    }

    const message = data.message;
    return _react.createElement(
      'div',
      { className: 'nuclide-language-status-tooltip-content' },
      message == null ? null : _react.createElement('div', {
        dangerouslySetInnerHTML: {
          __html: (0, (_marked || _load_marked()).default)(message)
        }
      }),
      message == null ? null : _react.createElement('hr', null),
      _react.createElement('div', {
        dangerouslySetInnerHTML: {
          __html: (0, (_marked || _load_marked()).default)(provider.description || '')
        }
      }),
      this._renderButtons()
    );
  }

  _styleTooltip() {
    const { tooltipRoot, status } = this.props;
    if (tooltipRoot != null) {
      tooltipRoot.classList.remove('nuclide-language-status-tooltip-green', 'nuclide-language-status-tooltip-yellow', 'nuclide-language-status-tooltip-red');
      tooltipRoot.classList.add('nuclide-language-status-tooltip-' + status.data.kind);
    }
  }

} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

const StatusTooltip = (0, (_Tooltip || _load_Tooltip()).default)(StatusTooltipComponent);
exports.default = StatusTooltip;