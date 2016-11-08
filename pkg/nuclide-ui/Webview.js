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
exports.Webview = undefined;

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

let Webview = exports.Webview = class Webview extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleDidFinishLoad = this._handleDidFinishLoad.bind(this);
    this._disposables = new _atom.CompositeDisposable();
  }

  componentDidMount() {
    const element = _reactForAtom.ReactDOM.findDOMNode(this);

    // Add event listeners. This has the drawbacks of 1) adding an event listener even when we don't
    // have a callback for it and 2) needing to add explicit support for each event type we want to
    // support. However, those costs aren't great enough to justify a new abstraction for managing
    // it at this time.
    element.addEventListener('did-finish-load', this._handleDidFinishLoad);
    this._disposables.add(new _atom.Disposable(() => element.removeEventListener('did-finish-load', this._handleDidFinishLoad)));

    this.updateAttributes({});
  }

  componentDidUpdate(prevProps) {
    this.updateAttributes(prevProps);
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    return _reactForAtom.React.createElement('webview', { className: this.props.className, style: this.props.style });
  }

  /**
   * Update the attributes on the current element. Custom attributes won't be added by React because
   * "webview" isn't a valid custom element name (custom elements need a dash), so we set the
   * attributes ourselves. But not "className" or "style" because React has special rules for those.
   * *sigh*
   */
  updateAttributes(prevProps) {
    const element = _reactForAtom.ReactDOM.findDOMNode(this);
    const specialProps = ['className', 'style', 'onDidFinishLoad'];
    const normalProps = Object.keys(this.props).filter(prop => specialProps.indexOf(prop) === -1);
    normalProps.forEach(prop => {
      const value = this.props[prop];
      const prevValue = prevProps[prop];
      const valueChanged = value !== prevValue;
      if (valueChanged) {
        element[prop] = value;
      }
    });
  }

  _handleDidFinishLoad(event) {
    if (this.props.onDidFinishLoad) {
      this.props.onDidFinishLoad(event);
    }
  }

};