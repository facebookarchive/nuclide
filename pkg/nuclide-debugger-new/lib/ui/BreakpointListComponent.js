'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _ListView;

function _load_ListView() {
  return _ListView = require('../../../nuclide-ui/ListView');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BreakpointListComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._handleBreakpointEnabledChange = (breakpoint, enabled) => {
      this.props.service.enableOrDisableBreakpoints(enabled, breakpoint);
    };

    this._handleBreakpointClick = (breakpointIndex, breakpoint) => {
      if (!(breakpoint != null)) {
        throw new Error('Invariant violation: "breakpoint != null"');
      }

      const { uri, line } = breakpoint;
      // Debugger model is 1-based while Atom UI is zero-based.
      (0, (_utils || _load_utils()).openSourceLocation)(uri, line - 1);
    };

    this.state = this._computeState();
  }

  _computeState() {
    const { service } = this.props;
    const { focusedProcess } = service.viewModel;
    const model = service.getModel();
    return {
      supportsConditionalBreakpoints: focusedProcess != null && Boolean(focusedProcess.session.capabilities.supportsConditionalBreakpoints),
      breakpoints: model.getBreakpoints(),
      exceptionBreakpoints: model.getExceptionBreakpoints()
    };
  }

  componentDidMount() {
    const model = this.props.service.getModel();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(model.onDidChangeBreakpoints(() => {
      this.setState(this._computeState());
    }));
  }

  componentWillUnmount() {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
  }

  render() {
    const {
      breakpoints,
      exceptionBreakpoints,
      supportsConditionalBreakpoints
    } = this.state;
    const { service } = this.props;
    const isReadonlyTarget = false;

    const items = breakpoints
    // Show resolved breakpoints at the top of the list, then order by filename & line number.
    .sort((breakpointA, breakpointB) => 100 * (Number(breakpointB.verified) - Number(breakpointA.verified)) + 10 * (_nuclideUri || _load_nuclideUri()).default.basename(breakpointA.uri).localeCompare((_nuclideUri || _load_nuclideUri()).default.basename(breakpointB.uri)) + Math.sign(breakpointA.line - breakpointB.line)).map((breakpoint, i) => {
      const basename = (_nuclideUri || _load_nuclideUri()).default.basename(breakpoint.uri);
      const { line, enabled, verified: resolved, uri: path } = breakpoint;
      const label = `${basename}:${line}`;
      const title = !enabled ? 'Disabled breakpoint' : !resolved ? 'Unresolved Breakpoint' : `Breakpoint at ${label} (resolved)`;

      const conditionElement = supportsConditionalBreakpoints && breakpoint.condition != null ? _react.createElement(
        'div',
        {
          className: 'nuclide-debugger-breakpoint-condition',
          title: `Breakpoint condition: ${breakpoint.condition}`,
          'data-path': path,
          'data-line': line,
          onClick: event => {
            atom.commands.dispatch(event.target, 'nuclide-debugger:edit-breakpoint');
          } },
        'Condition: ',
        breakpoint.condition
      ) : null;

      const content = _react.createElement(
        'div',
        { className: 'inline-block' },
        _react.createElement(
          'div',
          {
            className: (0, (_classnames || _load_classnames()).default)({
              'nuclide-debugger-breakpoint-disabled': !enabled,
              'nuclide-debugger-breakpoint-with-condition': Boolean(breakpoint.condition)
            }),
            key: i },
          _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
            checked: enabled,
            indeterminate: !resolved,
            disabled: !resolved,
            onChange: this._handleBreakpointEnabledChange.bind(this, breakpoint),
            onClick: event => event.stopPropagation(),
            title: title,
            className: (0, (_classnames || _load_classnames()).default)(resolved ? '' : 'nuclide-debugger-breakpoint-unresolved', 'nuclide-debugger-breakpoint-checkbox')
          }),
          _react.createElement(
            'span',
            { title: title, 'data-path': path, 'data-line': line },
            _react.createElement(
              'div',
              { className: 'nuclide-debugger-breakpoint-condition-controls' },
              _react.createElement((_Icon || _load_Icon()).Icon, {
                icon: 'pencil',
                className: 'nuclide-debugger-breakpoint-condition-control',
                'data-path': path,
                'data-line': line,
                onClick: event => {
                  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_EDIT_BREAKPOINT_FROM_ICON);
                  atom.commands.dispatch(event.target, 'nuclide-debugger:edit-breakpoint');
                }
              }),
              _react.createElement((_Icon || _load_Icon()).Icon, {
                icon: 'x',
                className: 'nuclide-debugger-breakpoint-condition-control',
                'data-path': path,
                'data-line': line,
                onClick: event => {
                  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_DELETE_BREAKPOINT_FROM_ICON);
                  atom.commands.dispatch(event.target, 'nuclide-debugger:remove-breakpoint');
                }
              })
            ),
            label
          ),
          conditionElement
        )
      );
      return _react.createElement(
        (_ListView || _load_ListView()).ListViewItem,
        {
          key: label,
          index: i,
          value: breakpoint,
          'data-path': path,
          'data-line': line,
          title: title,
          className: 'nuclide-debugger-breakpoint' },
        content
      );
    });
    const separator = breakpoints.length !== 0 ? _react.createElement('hr', { className: 'nuclide-ui-hr nuclide-debugger-breakpoint-separator' }) : null;
    return _react.createElement(
      'div',
      null,
      exceptionBreakpoints.map(exceptionBreakpoint => {
        return _react.createElement(
          'div',
          {
            className: 'nuclide-debugger-breakpoint',
            key: exceptionBreakpoint.getId() },
          _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
            className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-breakpoint-checkbox', 'nuclide-debugger-exception-checkbox'),
            onChange: enabled => service.enableOrDisableBreakpoints(enabled, exceptionBreakpoint),
            checked: exceptionBreakpoint.enabled,
            disabled: isReadonlyTarget
          }),
          exceptionBreakpoint.label || `${exceptionBreakpoint.filter} exceptions`
        );
      }),
      separator,
      _react.createElement(
        (_ListView || _load_ListView()).ListView,
        {
          alternateBackground: true,
          onSelect: this._handleBreakpointClick,
          selectable: true },
        items
      )
    );
  }
}
exports.default = BreakpointListComponent; /**
                                            * Copyright (c) 2015-present, Facebook, Inc.
                                            * All rights reserved.
                                            *
                                            * This source code is licensed under the license found in the LICENSE file in
                                            * the root directory of this source tree.
                                            *
                                            * 
                                            * @format
                                            */