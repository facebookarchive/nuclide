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

var _reactForAtom = require('react-for-atom');

class HhvmIcon extends _reactForAtom.React.Component {

  render() {
    return _reactForAtom.React.createElement(
      'svg',
      { className: 'hhvm-icon',
        version: '1.1',
        x: '0px',
        y: '0px',
        width: this.props.width,
        height: '100%',
        viewBox: '0 0 13.4 19.6' },
      _reactForAtom.React.createElement('polygon', { points: '7,6.6 7,12.6 13,6.6' }),
      _reactForAtom.React.createElement('polygon', { points: '13.4,6 13.4,0 7.4,6' }),
      _reactForAtom.React.createElement('polygon', { points: '7,13.4 7,19.6 13.4,13.2 13.4,7' }),
      _reactForAtom.React.createElement('polygon', { points: '0,12.6 6.4,6.2 6.4,0 0,6.4' }),
      _reactForAtom.React.createElement('polygon', { points: '6.4,13 6.4,7 0.4,13' }),
      _reactForAtom.React.createElement('polygon', { points: '0,13.6 0,19.6 6,13.6' })
    );
  }

}
exports.default = HhvmIcon;
HhvmIcon.defaultProps = {
  width: '16px'
};
module.exports = exports['default'];