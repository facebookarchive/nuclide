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
exports.ObservingComponent = undefined;

var _reactForAtom = require('react-for-atom');

// Derived classes must override render()
// Also might want to override shouldComponentUpdate(nextProps, nextState).


// State is set to null indicates that the observable has not
// produced a value yet.
let ObservingComponent = exports.ObservingComponent = class ObservingComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentWillMount() {
    this._subscribe(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.data === this.props.data) {
      return;
    }

    this._unsubscribe();
    this._subscribe(newProps);
  }

  _subscribe(newProps) {
    if (!(this.subscription == null)) {
      throw new Error('Invariant violation: "this.subscription == null"');
    }

    this.subscription = this.props.data.subscribe(data => {
      this.setState({ data: data });
    });
    this.setState({ data: null });
  }

  _unsubscribe() {
    if (!(this.subscription != null)) {
      throw new Error('Invariant violation: "this.subscription != null"');
    }

    this.subscription.unsubscribe();
    this.subscription = null;
  }

  componentWillUnmount() {
    this._unsubscribe();
  }
};