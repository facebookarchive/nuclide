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
exports.Section = undefined;

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** A vertical divider with a title.
 * Specifying `collapsable` prop as true will add a clickable chevron icon that
 * collapses the component children. Optionally specify collapsedByDefault
 * (defaults to false)
 */
let Section = exports.Section = class Section extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    const initialIsCollapsed = this.props.collapsable != null && this.props.collapsable && this.props.collapsedByDefault != null && this.props.collapsedByDefault;
    this.state = {
      isCollapsed: initialIsCollapsed
    };
    this._toggleCollapsed = this._toggleCollapsed.bind(this);
  }

  _toggleCollapsed() {
    if (this.props.collapsed == null) {
      // uncontrolled mode
      this.setState({ isCollapsed: !this.state.isCollapsed });
    } else {
      // controlled mode
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(!this.props.collapsed);
      }
    }
  }

  render() {
    const collapsable = this.props.collapsable != null ? this.props.collapsable : false;
    const collapsed = this.props.collapsed == null ? this.state.isCollapsed : this.props.collapsed;
    // Only include classes if the component is collapsable
    const iconClass = (0, (_classnames || _load_classnames()).default)({
      'icon': collapsable,
      'icon-chevron-down': collapsable && !collapsed,
      'icon-chevron-right': collapsable && collapsed,
      'nuclide-ui-section-collapsable': collapsable
    });
    const conditionalProps = {};
    if (collapsable) {
      conditionalProps.onClick = this._toggleCollapsed;
      conditionalProps.title = collapsed ? 'Click to expand' : 'Click to collapse';
    }
    const HeadlineComponent = this.props.size === 'small' ? 'h6' : 'h3';
    return _reactForAtom.React.createElement(
      'div',
      { className: this.props.className },
      _reactForAtom.React.createElement(
        HeadlineComponent,
        Object.assign({ className: iconClass }, conditionalProps),
        this.props.headline
      ),
      _reactForAtom.React.createElement(
        'div',
        { style: collapsed ? { display: 'none' } : {} },
        this.props.children
      )
    );
  }
};