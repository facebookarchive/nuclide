'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BreakpointListComponent = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _react = _interopRequireDefault(require('react'));

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

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class BreakpointListComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleBreakpointEnabledChange = this._handleBreakpointEnabledChange.bind(this);
    this._handleBreakpointClick = this._handleBreakpointClick.bind(this);
    this.state = {
      breakpoints: this.props.breakpointStore.getAllBreakpoints()
    };
  }

  componentDidMount() {
    const { breakpointStore } = this.props;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(breakpointStore.onNeedUIUpdate(() => {
      this.setState({
        breakpoints: breakpointStore.getAllBreakpoints()
      });
    }));
  }

  componentWillUnmount() {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
  }

  _handleBreakpointEnabledChange(breakpoint, enabled) {
    this.props.actions.updateBreakpointEnabled(breakpoint.id, enabled);
  }

  _handleBreakpointClick(breakpointIndex, breakpoint) {
    if (!(breakpoint != null)) {
      throw new Error('Invariant violation: "breakpoint != null"');
    }

    const {
      path,
      line
    } = breakpoint;
    this.props.actions.openSourceLocation((_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(path), line);
  }

  render() {
    const { breakpoints } = this.state;
    if (breakpoints == null || breakpoints.length === 0) {
      return _react.default.createElement(
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
      const {
        basename,
        line,
        enabled,
        resolved,
        path
      } = breakpoint;
      const label = `${basename}:${line + 1}`;
      const title = resolved ? null : 'Unresolved Breakpoint';
      const content = _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-breakpoint', key: i },
        _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          checked: enabled,
          indeterminate: !resolved,
          disabled: !resolved,
          onChange: this._handleBreakpointEnabledChange.bind(this, breakpoint),
          title: title,
          className: (0, (_classnames || _load_classnames()).default)(resolved ? '' : 'nuclide-debugger-breakpoint-unresolved')
        }),
        _react.default.createElement(
          'span',
          {
            className: 'nuclide-debugger-breakpoint',
            title: title,
            'data-path': path,
            'data-line': line },
          label
        )
      );
      return _react.default.createElement(
        (_ListView || _load_ListView()).ListViewItem,
        { key: label, value: breakpoint },
        content
      );
    });
    return _react.default.createElement(
      (_ListView || _load_ListView()).ListView,
      {
        alternateBackground: true,
        onSelect: this._handleBreakpointClick,
        selectable: true },
      items
    );
  }
}
exports.BreakpointListComponent = BreakpointListComponent;