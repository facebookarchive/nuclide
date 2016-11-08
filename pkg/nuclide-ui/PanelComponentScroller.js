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
exports.PanelComponentScroller = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let PanelComponentScroller = exports.PanelComponentScroller = class PanelComponentScroller extends _reactForAtom.React.Component {

  render() {
    const style = this.props.overflowX == null ? null : { overflowX: this.props.overflowX };
    const className = (0, (_classnames || _load_classnames()).default)('nuclide-ui-panel-component-scroller', {
      'nuclide-ui-panel-component-scroller--column': this.props.flexDirection === 'column'
    });

    return _reactForAtom.React.createElement(
      'div',
      {
        className: className,
        style: style,
        onScroll: this.props.onScroll,
        onFocus: this.props.onFocus },
      this.props.children
    );
  }
};