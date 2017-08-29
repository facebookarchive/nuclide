'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
                                                                                                                                                                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                              * the root directory of this source tree.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * 
                                                                                                                                                                                                                              * @format
                                                                                                                                                                                                                              */

const DEFAULT_RERENDER_DELAY = 10000; // ms

/**
 * Renders a relative date that forces a re-render every `delay` ms,
 * in order to properly update the UI.
 *
 * Does not respond to changes to the initial `delay` for simplicity's sake.
 */
class RelativeDate extends _react.Component {

  componentDidMount() {
    const { delay } = this.props;
    this._interval = setInterval(() => this.forceUpdate(), delay);
  }

  componentWillUnmount() {
    if (this._interval != null) {
      clearInterval(this._interval);
    }
  }

  render() {
    const _props = this.props,
          {
      date,
      // eslint-disable-next-line no-unused-vars
      delay: _,
      shorten,
      withToolip
    } = _props,
          remainingProps = _objectWithoutProperties(_props, ['date', 'delay', 'shorten', 'withToolip']);
    return _react.createElement(
      'span',
      Object.assign({}, remainingProps, {
        ref: withToolip ? // $FlowFixMe(>=0.53.0) Flow suppress
        (0, (_addTooltip || _load_addTooltip()).default)({
          title: date.toLocaleString(),
          delay: 200,
          placement: 'top'
        }) : null }),
      (0, (_string || _load_string()).relativeDate)(date, undefined, shorten)
    );
  }
}
exports.default = RelativeDate;
RelativeDate.defaultProps = {
  delay: DEFAULT_RERENDER_DELAY,
  shorten: false,
  withToolip: false
};