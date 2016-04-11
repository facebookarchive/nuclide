'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rx';

import {React} from 'react-for-atom';

/**
 * Injects any key/value pairs from the given Observable value into the component as named props.
 * e.g. `injectObservableAsProps(Rx.Observable.just({val: 42}), FooComponent)` will translate to
 * `<FooComponent val={42} />`.
 *
 * The resulting component re-renders on updates to the observable.
 * The wrapped component is guaranteed to render only if the observable has resolved;
 * otherwise, the wrapper component renders `null`.
 */
export function injectObservableAsProps<T : ReactClass>(
  stream: Observable<{[key: string]: any}>,
  ComposedComponent: T,
): T {
  // $FlowIssue The return type is guaranteed to be the same as the type of ComposedComponent.
  return class extends React.Component {
    _subscription: ?IDisposable;
    state: {[key: string]: any};
    _resolved: boolean;

    constructor(props) {
      super(props);
      this._subscription = null;
      this.state = {};
      this._resolved = false;
    }

    componentDidMount(): void {
      this._subscription = stream.subscribe(newState => {
        this._resolved = true;
        this.setState(newState);
      });
    }

    componentWillUnmount(): void {
      if (this._subscription != null) {
        this._subscription.dispose();
      }
    }

    render(): ?ReactElement {
      if (!this._resolved) {
        return null;
      }
      const props = {
        ...this.props,
        ...this.state,
      };
      return <ComposedComponent {...props} />;
    }
  };
}
