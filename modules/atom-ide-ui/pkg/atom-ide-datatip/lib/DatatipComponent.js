'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatatipComponent = exports.DATATIP_ACTIONS = undefined;

var _react = _interopRequireWildcard(require('react'));

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _MarkedStringDatatip;

function _load_MarkedStringDatatip() {
  return _MarkedStringDatatip = _interopRequireDefault(require('./MarkedStringDatatip'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const DATATIP_ACTIONS = exports.DATATIP_ACTIONS = Object.freeze({
  PIN: 'PIN',
  CLOSE: 'CLOSE'
});

const IconsForAction = {
  [DATATIP_ACTIONS.PIN]: 'pin',
  [DATATIP_ACTIONS.CLOSE]: 'x'
};

class DatatipComponent extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.handleActionClick = event => {
      this.props.onActionClick();
    }, _temp;
  }

  render() {
    const _props = this.props,
          {
      className,
      action,
      actionTitle,
      datatip,
      onActionClick
    } = _props,
          props = _objectWithoutProperties(_props, ['className', 'action', 'actionTitle', 'datatip', 'onActionClick']);

    let content;
    if (datatip.component != null) {
      content = _react.createElement(datatip.component, null);
    } else if (datatip.markedStrings != null) {
      content = _react.createElement((_MarkedStringDatatip || _load_MarkedStringDatatip()).default, { markedStrings: datatip.markedStrings });
    }

    let actionButton = null;
    if (action != null && IconsForAction[action] != null) {
      const actionIcon = IconsForAction[action];
      actionButton = _react.createElement('div', {
        className: `datatip-pin-button icon-${actionIcon}`,
        onClick: this.handleActionClick,
        title: actionTitle
      });
    }

    return _react.createElement(
      'div',
      Object.assign({
        className: `${(0, (_string || _load_string()).maybeToString)(className)} datatip-container`
      }, props),
      _react.createElement(
        'div',
        { className: 'datatip-content' },
        content
      ),
      actionButton
    );
  }
}
exports.DatatipComponent = DatatipComponent;