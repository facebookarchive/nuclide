'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PanelComponentScroller = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class PanelComponentScroller extends _react.Component {
  render() {
    const style = this.props.overflowX == null ? null : { overflowX: this.props.overflowX };
    const className = (0, (_classnames || _load_classnames()).default)('nuclide-ui-panel-component-scroller', {
      'nuclide-ui-panel-component-scroller--column': this.props.flexDirection === 'column'
    });

    return (
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement(
        'div',
        {
          className: className,
          style: style,
          onScroll: this.props.onScroll,
          onFocus: this.props.onFocus },
        this.props.children
      )
    );
  }
}
exports.PanelComponentScroller = PanelComponentScroller;