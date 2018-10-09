"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.highlightOnUpdate = highlightOnUpdate;

var React = _interopRequireWildcard(require("react"));

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/**
 * Wraps DecoratedComponent in a special `span` with a configurable classname whenever the
 * component's props change.
 */
function highlightOnUpdate(ComposedComponent,
/**
 * The result of this function determines whether to apply the highlight or not.
 */
arePropsEqual = _shallowequal().default,
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
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.showFlash = false;
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) {
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
      return React.createElement("span", {
        className: `${className} ${this.showFlash ? className + '-highlight' : ''}`
      }, React.createElement(ComposedComponent, this.props));
    }

  };
}