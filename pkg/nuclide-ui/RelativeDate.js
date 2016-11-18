'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _class, _temp;

var _reactForAtom = require('react-for-atom');

var _string;

function _load_string() {
  return _string = require('../commons-node/string');
}

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const DEFAULT_RERENDER_DELAY = 10000; // ms

/**
 * Renders a relative date that forces a re-render every `delay` ms,
 * in order to properly update the UI.
 *
 * Does not respond to changes to the initial `delay` for simplicity's sake.
 */
let Revision = (_temp = _class = class Revision extends _reactForAtom.React.Component {

  componentDidMount() {
    const delay = this.props.delay;

    this._interval = setInterval(() => this.forceUpdate(), delay);
  }

  componentWillUnmount() {
    if (this._interval != null) {
      clearInterval(this._interval);
    }
  }

  render() {
    var _props = this.props;

    const date = _props.date,
          remainingProps = _objectWithoutProperties(_props, ['date']);

    return _reactForAtom.React.createElement(
      'span',
      remainingProps,
      (0, (_string || _load_string()).relativeDate)(date)
    );
  }
}, _class.defaultProps = {
  delay: DEFAULT_RERENDER_DELAY
}, _temp);
exports.default = Revision;
module.exports = exports['default'];