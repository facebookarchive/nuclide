'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class AnimatedEllipsis extends _react.Component {

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
    return _react.createElement(
      'span',
      { className: 'nuclide-ui-animated-ellipsis' },
      ellipsis
    );
  }
}
exports.default = AnimatedEllipsis;