'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bindObservableAsProps = bindObservableAsProps;

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Injects any key/value pairs from the given Observable value into the component as named props.
 * e.g. `bindObservableAsProps(Observable.just({val: 42}), FooComponent)` will translate to
 * `<FooComponent val={42} />`.
 *
 * The resulting component re-renders on updates to the observable.
 * The wrapped component is guaranteed to render only if the observable has resolved;
 * otherwise, the wrapper component renders `null`.
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function bindObservableAsProps(stream, ComposedComponent) {
  // $FlowIssue The return type is guaranteed to be the same as the type of ComposedComponent.
  return class extends _react.Component {

    constructor(props) {
      super(props);
      this._subscription = null;
      this.state = {};
      this._resolved = false;
    }

    getWrappedComponent() {
      return this._wrappedComponent;
    }

    componentDidMount() {
      this._subscription = stream.subscribe(newState => {
        this._resolved = true;
        this.setState(newState);
      });
    }

    componentWillUnmount() {
      if (this._subscription != null) {
        this._subscription.unsubscribe();
      }
    }

    render() {
      if (!this._resolved) {
        return null;
      }
      const props = Object.assign({}, this.props, this.state);
      return _react.createElement(ComposedComponent, Object.assign({
        ref: component => this._wrappedComponent = component
      }, props));
    }
  };
}