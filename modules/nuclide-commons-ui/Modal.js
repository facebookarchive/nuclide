'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.Modal = undefined;var _UniversalDisposable;













function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));}
var _react = _interopRequireWildcard(require('react'));
var _reactDom = _interopRequireDefault(require('react-dom'));
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */ // DEPRECATED, AVOID USING THIS. Use 'showModal' in nuclide-commons-ui instead
/**
 * Shows a modal dialog when rendered, using Atom's APIs (atom.workspace.addModalPanel).
 */class Modal extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.































    _handleWindowClick = event => {
      // If the user clicks outside of the modal, and not on a tooltip or
      // notification, close it.
      if (
      this._innerElement &&
      !this._innerElement.contains(event.target) &&
      event.target.closest('atom-notifications, .tooltip') == null)
      {
        this.props.onDismiss();
      }
    }, this.


    _handleContainerInnerElement = el => {
      if (this._cancelDisposable != null) {
        this._cancelDisposable.dispose();
      }

      this._innerElement = el;
      if (el == null) {
        return;
      }

      el.focus();
      this._cancelDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(
      atom.commands.add(window, 'core:cancel', () => {
        this.props.onDismiss();
      }),
      _rxjsBundlesRxMinJs.Observable.fromEvent(window, 'mousedown')
      // Ignore clicks in the current tick. We don't want to capture the click that showed this
      // modal.
      .skipUntil(_rxjsBundlesRxMinJs.Observable.interval(0).first()).
      subscribe(this._handleWindowClick));

    }, _temp;}componentWillMount() {this._container = document.createElement('div');this._panel = atom.workspace.addModalPanel({ item: this._container, className: this.props.modalClassName });}componentWillUnmount() {this._panel.destroy();}componentDidUpdate(prevProps) {const { modalClassName } = this.props;const { modalClassName: prevModalClassName } = prevProps;const panelElement = this._panel.getElement();if (prevModalClassName != null) {panelElement.classList.remove(...prevModalClassName.split(/\s+/).filter(token => token.length > 0));}if (modalClassName != null) {panelElement.classList.add(...modalClassName.split(/\s+/).filter(token => token.length > 0));}} // Since we're rendering null, we can't use `findDOMNode(this)`.

  render() {
    const _props = this.props,{ modalClassName, children, onDismiss } = _props,props = _objectWithoutProperties(_props, ['modalClassName', 'children', 'onDismiss']);
    return _reactDom.default.createPortal(
    _react.createElement('div', Object.assign({ tabIndex: '0' }, props, { ref: this._handleContainerInnerElement }),
      this.props.children),

    this._container);

  }}exports.Modal = Modal;