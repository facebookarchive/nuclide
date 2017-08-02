'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DOT_ANIMATION_INTERVAL = 500; /* ms */
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

class AnimatedEllipsis extends _react.default.Component {

  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      n: 0
    };
  }

  componentDidMount() {
    this._disposables.add(_rxjsBundlesRxMinJs.Observable.interval(DOT_ANIMATION_INTERVAL).subscribe(_ => this.setState({ n: this.state.n + 1 })));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const ellipsis = new Array(this.state.n % 4).fill('.').join('');
    return _react.default.createElement(
      'span',
      { className: 'nuclide-ui-animated-ellipsis' },
      ellipsis
    );
  }
}
exports.default = AnimatedEllipsis;