'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Bunch of hacks to get text selection working inside of Atom.
 * Very important, you cannot have a nested <AtomTextEditor> or <AtomInput>
 * inside, otherwise backspace and enter will not work anymore!
 */

class SelectableDiv extends _react.default.Component {

  componentDidMount() {
    // Note: we're adding event listeners manually because right now React
    // attaches listeners at the root of the document which is too late for
    // stopping the propagation.
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(_rxjsBundlesRxMinJs.Observable.fromEvent(this.refs.elem, 'mousedown').subscribe(e => e.stopPropagation()), _rxjsBundlesRxMinJs.Observable.fromEvent(this.refs.elem, 'keydown').subscribe(e => e.stopPropagation()), _rxjsBundlesRxMinJs.Observable.fromEvent(this.refs.elem, 'mousemove').subscribe(e => e.stopPropagation()));
  }
  componentWillUnmount() {
    this._disposables.dispose();
  }
  render() {
    return _react.default.createElement(
      'div',
      {
        // https://github.com/atom/atom/blob/7929e261a0d6e78ff4ca5196c8b385946e64dbd9/keymaps/base.cson#L27-L28
        className: 'native-key-bindings',
        tabIndex: -1,
        style: { WebkitUserSelect: 'text' },
        ref: 'elem' },
      this.props.children
    );
  }
}
exports.default = SelectableDiv; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */