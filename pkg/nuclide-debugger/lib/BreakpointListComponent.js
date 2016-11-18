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
exports.BreakpointListComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../nuclide-ui/Checkbox');
}

var _ListView;

function _load_ListView() {
  return _ListView = require('../../nuclide-ui/ListView');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let BreakpointListComponent = exports.BreakpointListComponent = class BreakpointListComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleBreakpointEnabledChange = this._handleBreakpointEnabledChange.bind(this);
    this._handleBreakpointClick = this._handleBreakpointClick.bind(this);
  }

  _handleBreakpointEnabledChange(breakpoint, enabled) {
    this.props.actions.updateBreakpointEnabled(breakpoint.id, enabled);
  }

  _handleBreakpointClick(breakpointIndex, breakpoint) {
    if (!(breakpoint != null)) {
      throw new Error('Invariant violation: "breakpoint != null"');
    }

    const path = breakpoint.path,
          line = breakpoint.line;

    this.props.actions.openSourceLocation((_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(path), line);
  }

  render() {
    const breakpoints = this.props.breakpoints;

    if (breakpoints == null || breakpoints.length === 0) {
      return _reactForAtom.React.createElement(
        'span',
        null,
        '(no breakpoints)'
      );
    }
    const items = breakpoints.map(breakpoint => Object.assign({}, breakpoint, {
      // Calculate the basename exactly once for each breakpoint
      basename: (_nuclideUri || _load_nuclideUri()).default.basename(breakpoint.path)
    }))
    // Show resolved breakpoints at the top of the list, then order by filename & line number.
    .sort((breakpointA, breakpointB) => 100 * (Number(breakpointB.resolved) - Number(breakpointA.resolved)) + 10 * breakpointA.basename.localeCompare(breakpointB.basename) + Math.sign(breakpointA.line - breakpointB.line)).map((breakpoint, i) => {
      const basename = breakpoint.basename,
            line = breakpoint.line,
            enabled = breakpoint.enabled,
            resolved = breakpoint.resolved;

      const label = `${ basename }:${ line + 1 }`;
      const content = _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-debugger-breakpoint', key: i },
        _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          label: label,
          checked: enabled,
          indeterminate: !resolved,
          disabled: !resolved,
          onChange: this._handleBreakpointEnabledChange.bind(this, breakpoint),
          title: resolved ? null : 'Unresolved Breakpoint'
        })
      );
      return _reactForAtom.React.createElement(
        (_ListView || _load_ListView()).ListViewItem,
        { key: label, value: breakpoint },
        content
      );
    });
    return _reactForAtom.React.createElement(
      (_ListView || _load_ListView()).ListView,
      {
        alternateBackground: true,
        onSelect: this._handleBreakpointClick,
        selectable: true },
      items
    );
  }
};