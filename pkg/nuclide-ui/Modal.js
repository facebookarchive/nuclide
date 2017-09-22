'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Modal = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _Portal;

function _load_Portal() {
  return _Portal = require('./Portal');
}

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Shows a modal dialog when rendered, using Atom's APIs (atom.workspace.addModalPanel).
 */
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

class Modal extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleWindowClick = event => {
      // If the user clicks outside of the modal, close it.
      if (this._innerElement && !this._innerElement.contains(event.target)) {
        this.props.onDismiss();
      }
    }, this._handleContainerInnerElement = el => {
      if (this._cancelDisposable != null) {
        this._cancelDisposable.dispose();
      }

      this._innerElement = el;
      if (el == null) {
        return;
      }

      el.focus();
      this._cancelDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add(window, 'core:cancel', () => {
        this.props.onDismiss();
      }), _rxjsBundlesRxMinJs.Observable.fromEvent(window, 'mousedown')
      // Ignore clicks in the current tick. We don't want to capture the click that showed this
      // modal.
      .skipUntil(_rxjsBundlesRxMinJs.Observable.interval(0).first()).subscribe(this._handleWindowClick));
    }, _temp;
  }

  componentWillMount() {
    this._container = document.createElement('div');
    this._panel = atom.workspace.addModalPanel({ item: this._container });
  }

  componentWillUnmount() {
    this._panel.destroy();
  }

  // Since we're rendering null, we can't use `findDOMNode(this)`.


  render() {
    const props = Object.assign({}, this.props);
    delete props.onDismiss;
    return _react.createElement(
      (_Portal || _load_Portal()).Portal,
      { container: this._container },
      _react.createElement(
        'div',
        Object.assign({ tabIndex: '0' }, props, { ref: this._handleContainerInnerElement }),
        this.props.children
      )
    );
  }
}
exports.Modal = Modal;