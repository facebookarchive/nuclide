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
exports.highlightOnUpdate = highlightOnUpdate;

var _reactForAtom = require('react-for-atom');

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wraps DecoratedComponent in a special `span` with a configurable classname whenever the
 * component's props change.
 */
function highlightOnUpdate(ComposedComponent) {
  let arePropsEqual = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (_shallowequal || _load_shallowequal()).default;
  let className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'nuclide-ui-highlight-on-render';
  let unhighlightDelay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 200;

  // $FlowIssue The return type is guaranteed to be the same as the type of ComposedComponent.
  return class extends _reactForAtom.React.Component {

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
      return _reactForAtom.React.createElement(
        'span',
        { className: `${ className } ${ this.showFlash ? className + '-highlight' : '' }` },
        _reactForAtom.React.createElement(ComposedComponent, this.props)
      );
    }
  };
}