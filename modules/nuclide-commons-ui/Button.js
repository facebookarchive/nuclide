'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Button = exports.ButtonTypes = exports.ButtonSizes = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('./addTooltip'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const ButtonSizes = exports.ButtonSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  LARGE: 'LARGE'
});

const ButtonTypes = exports.ButtonTypes = Object.freeze({
  PRIMARY: 'PRIMARY',
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
});

const ButtonSizeClassnames = Object.freeze({
  EXTRA_SMALL: 'btn-xs',
  SMALL: 'btn-sm',
  LARGE: 'btn-lg'
});

const ButtonTypeClassnames = Object.freeze({
  PRIMARY: 'btn-primary',
  INFO: 'btn-info',
  SUCCESS: 'btn-success',
  WARNING: 'btn-warning',
  ERROR: 'btn-error'
});

/**
 * Generic Button wrapper.
 */
class Button extends _react.Component {
  focus() {
    const node = _reactDom.default.findDOMNode(this);
    if (node == null) {
      return;
    }
    // $FlowFixMe
    node.focus();
  }

  render() {
    const _props = this.props,
          {
      icon,
      buttonType,
      selected,
      size,
      children,
      className,
      wrapperElement,
      tooltip
    } = _props,
          remainingProps = _objectWithoutProperties(_props, ['icon', 'buttonType', 'selected', 'size', 'children', 'className', 'wrapperElement', 'tooltip']);
    const sizeClassname = size == null ? '' : ButtonSizeClassnames[size] || '';
    const buttonTypeClassname = buttonType == null ? '' : ButtonTypeClassnames[buttonType] || '';
    const ref = tooltip ? (0, (_addTooltip || _load_addTooltip()).default)(tooltip) : null;
    const newClassName = (0, (_classnames || _load_classnames()).default)(className, 'btn', {
      [`icon icon-${(0, (_string || _load_string()).maybeToString)(icon)}`]: icon != null,
      [sizeClassname]: size != null,
      selected,
      [buttonTypeClassname]: buttonType != null
    });
    const Wrapper = wrapperElement == null ? 'button' : wrapperElement;
    return (
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement(
        Wrapper,
        Object.assign({ className: newClassName, ref: ref }, remainingProps),
        children
      )
    );
  }
}
exports.Button = Button;