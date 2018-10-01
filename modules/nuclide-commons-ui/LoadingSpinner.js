"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoadingSpinner = exports.LoadingSpinnerSizes = void 0;

function _addTooltip() {
  const data = _interopRequireDefault(require("./addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

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
const LoadingSpinnerSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE'
});
exports.LoadingSpinnerSizes = LoadingSpinnerSizes;
const LoadingSpinnerClassnames = Object.freeze({
  EXTRA_SMALL: 'loading-spinner-tiny',
  SMALL: 'loading-spinner-small',
  MEDIUM: 'loading-spinner-medium',
  LARGE: 'loading-spinner-large'
});
/**
 * Shows an indefinite, animated LoadingSpinner.
 */

class LoadingSpinner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldRender: !this.props.delay
    };
  }

  componentDidMount() {
    if (!this.state.shouldRender) {
      this._timeout = setTimeout(() => this.setState({
        shouldRender: true
      }), this.props.delay);
    }
  }

  componentWillUnmount() {
    if (this._timeout != null) {
      clearTimeout(this._timeout);
    }
  }

  render() {
    const {
      className,
      size,
      tooltip
    } = this.props;

    if (!this.state.shouldRender) {
      return null;
    }

    const ref = tooltip ? (0, _addTooltip().default)(tooltip) : null;
    const safeSize = size != null && LoadingSpinnerSizes.hasOwnProperty(size) ? size : LoadingSpinnerSizes.MEDIUM;
    const sizeClassname = LoadingSpinnerClassnames[safeSize];
    const newClassName = (0, _classnames().default)(className, 'loading', sizeClassname);
    return React.createElement("div", {
      className: newClassName // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: ref
    });
  }

}

exports.LoadingSpinner = LoadingSpinner;