"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const DOT_ANIMATION_INTERVAL = 500;
/* ms */

class AnimatedEllipsis extends React.Component {
  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable().default)();
    this.state = {
      n: 0
    };
  }

  componentDidMount() {
    this._disposables.add(_RxMin.Observable.interval(DOT_ANIMATION_INTERVAL).subscribe(_ => // TODO: (wbinnssmith) T30771435 this setState depends on current state
    // and should use an updater function rather than an object
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({
      n: this.state.n + 1
    })));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const ellipsis = new Array(this.state.n % 4).fill('.').join('');
    return React.createElement("span", {
      className: "nuclide-ui-animated-ellipsis"
    }, ellipsis);
  }

}

exports.default = AnimatedEllipsis;