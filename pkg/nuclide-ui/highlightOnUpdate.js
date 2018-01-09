'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.highlightOnUpdate = highlightOnUpdate;

var _react = _interopRequireWildcard(require('react'));

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Wraps DecoratedComponent in a special `span` with a configurable classname whenever the
 * component's props change.
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

function highlightOnUpdate(ComposedComponent,
/**
 * The result of this function determines whether to apply the highlight or not.
 */
arePropsEqual = (_shallowequal || _load_shallowequal()).default,
/**
 * className used in the wrapper. You can style both `className` and `<className>-highlight`.
 */
className = 'nuclide-ui-highlight-on-render',
/**
 * Delay in ms until the `*-highlight` className gets removed from the wrapper.
 * Effectively throttles the frequency of highlight pulses.
 */
unhighlightDelay = 200) {
  // $FlowIssue The return type is guaranteed to be the same as the type of ComposedComponent.
  return class extends _react.Component {

    constructor(props) {
      super(props);
      this.showFlash = false;
    }

    componentWillUpdate(nextProps, nextState) {
      if (arePropsEqual(nextProps, this.props)) {
        // Skip if prop values didn't actually change.
        return;
      }
      if (this.timeout != null || this.showFlash) {
        // Skip if already scheduled.
        return;
      }
      this.showFlash = true;
      this.timeout = setTimeout(() => {
        this.showFlash = false;
        this.timeout = null;
        this.forceUpdate();
      }, unhighlightDelay);
    }

    render() {
      return _react.createElement(
        'span',
        {
          className: `${className} ${this.showFlash ? className + '-highlight' : ''}` },
        _react.createElement(ComposedComponent, this.props)
      );
    }
  };
}