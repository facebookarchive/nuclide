/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import React from 'react';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';

/**
 * Bunch of hacks to get text selection working inside of Atom.
 * Very important, you cannot have a nested <AtomTextEditor> or <AtomInput>
 * inside, otherwise backspace and enter will not work anymore!
 */

type Props = {
  children?: any,
};

export default class SelectableDiv extends React.Component {
  props: Props;
  _disposables: UniversalDisposable;

  componentDidMount() {
    // Note: we're adding event listeners manually because right now React
    // attaches listeners at the root of the document which is too late for
    // stopping the propagation.
    this._disposables = new UniversalDisposable(
      Observable.fromEvent(this.refs.elem, 'mousedown').subscribe(e =>
        e.stopPropagation(),
      ),
      Observable.fromEvent(this.refs.elem, 'keydown').subscribe(e =>
        e.stopPropagation(),
      ),
      Observable.fromEvent(this.refs.elem, 'mousemove').subscribe(e =>
        e.stopPropagation(),
      ),
    );
  }
  componentWillUnmount() {
    this._disposables.dispose();
  }
  render() {
    return (
      <div
        // https://github.com/atom/atom/blob/7929e261a0d6e78ff4ca5196c8b385946e64dbd9/keymaps/base.cson#L27-L28
        className="native-key-bindings"
        tabIndex={-1}
        style={{WebkitUserSelect: 'text'}}
        ref="elem">
        {this.props.children}
      </div>
    );
  }
}
