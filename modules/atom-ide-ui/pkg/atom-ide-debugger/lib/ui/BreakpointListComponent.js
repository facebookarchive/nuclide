'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _UniversalDisposable;













function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}

var _react = _interopRequireWildcard(require('react'));var _nuclideUri;
function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../../../nuclide-commons/nuclideUri'));}var _Checkbox;
function _load_Checkbox() {return _Checkbox = require('../../../../../nuclide-commons-ui/Checkbox');}var _analytics;
function _load_analytics() {return _analytics = require('../../../../../nuclide-commons/analytics');}var _ListView;
function _load_ListView() {return _ListView = require('../../../../../nuclide-commons-ui/ListView');}var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _Icon;
function _load_Icon() {return _Icon = require('../../../../../nuclide-commons-ui/Icon');}var _constants;
function _load_constants() {return _constants = require('../constants');}var _utils;
function _load_utils() {return _utils = require('../utils');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}











class BreakpointListComponent extends _react.Component


{


  constructor(props) {
    super(props);this.

































    _handleBreakpointEnabledChange = (
    breakpoint,
    enabled) =>
    {
      this.props.service.enableOrDisableBreakpoints(enabled, breakpoint);
    };this.

    _handleBreakpointClick = (
    breakpointIndex,
    breakpoint) =>
    {if (!(
      breakpoint != null)) {throw new Error('Invariant violation: "breakpoint != null"');}
      const { uri, line } = breakpoint;
      // Debugger model is 1-based while Atom UI is zero-based.
      (0, (_utils || _load_utils()).openSourceLocation)(uri, line - 1);
    };this.state = this._computeState();}_computeState() {const { service } = this.props;const { focusedProcess } = service.viewModel;const model = service.getModel();return { supportsConditionalBreakpoints: focusedProcess != null && Boolean(focusedProcess.session.capabilities.supportsConditionalBreakpoints), breakpoints: model.getBreakpoints(), exceptionBreakpoints: model.getExceptionBreakpoints() };}componentDidMount() {const model = this.props.service.getModel();this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(model.onDidChangeBreakpoints(() => {this.setState(this._computeState());}));}componentWillUnmount() {if (this._disposables != null) {this._disposables.dispose();}}

  render() {
    const {
      breakpoints,
      exceptionBreakpoints,
      supportsConditionalBreakpoints } =
    this.state;
    const { service } = this.props;
    const items = breakpoints.
    sort((breakpointA, breakpointB) => {
      const fileA = (_nuclideUri || _load_nuclideUri()).default.basename(breakpointA.uri);
      const fileB = (_nuclideUri || _load_nuclideUri()).default.basename(breakpointB.uri);
      if (fileA !== fileB) {
        return fileA.localeCompare(fileB);
      }

      const lineA =
      breakpointA.endLine != null ? breakpointA.endLine : breakpointA.line;
      const lineB =
      breakpointB.endLine != null ? breakpointB.endLine : breakpointB.line;
      return lineA - lineB;
    }).
    map((breakpoint, i) => {
      const basename = (_nuclideUri || _load_nuclideUri()).default.basename(breakpoint.uri);
      const { line, endLine, enabled, verified, uri: path } = breakpoint;
      const dataLine =
      endLine != null && !Number.isNaN(endLine) ? endLine : line;
      const bpId = breakpoint.getId();
      const label = `${basename}:${dataLine}`;
      const title = !enabled ?
      'Disabled breakpoint' :
      !verified ?
      'Unresolved Breakpoint' :
      `Breakpoint at ${label} (resolved)`;

      const conditionElement =
      supportsConditionalBreakpoints && breakpoint.condition != null ?
      _react.createElement('div', {
          className: 'debugger-breakpoint-condition',
          title: `Breakpoint condition: ${breakpoint.condition}`,
          'data-path': path,
          'data-line': line,
          'data-bpid': bpId,
          onClick: event => {
            atom.commands.dispatch(
            event.target,
            'debugger:edit-breakpoint');

          } }, 'Condition: ',
        breakpoint.condition) :

      null;

      const content =
      _react.createElement('div', { className: 'inline-block' },
        _react.createElement('div', {
            className: (0, (_classnames || _load_classnames()).default)({
              'debugger-breakpoint-disabled': !enabled,
              'debugger-breakpoint-with-condition': Boolean(
              breakpoint.condition) }),


            key: i },
          _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
            checked: enabled,
            onChange: this._handleBreakpointEnabledChange.bind(
            this,
            breakpoint),

            onClick: event => event.stopPropagation(),
            title: title,
            className: (0, (_classnames || _load_classnames()).default)(
            verified ? '' : 'debugger-breakpoint-unresolved',
            'debugger-breakpoint-checkbox') }),


          _react.createElement('span', {
              title: title,
              'data-path': path,
              'data-bpid': bpId,
              'data-line': line },
            _react.createElement('div', { className: 'debugger-breakpoint-condition-controls' },
              _react.createElement((_Icon || _load_Icon()).Icon, {
                icon: 'pencil',
                className: 'debugger-breakpoint-condition-control',
                'data-path': path,
                'data-bpid': bpId,
                'data-line': line,
                onClick: event => {
                  (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_EDIT_BREAKPOINT_FROM_ICON);
                  atom.commands.dispatch(
                  event.target,
                  'debugger:edit-breakpoint');

                } }),

              _react.createElement((_Icon || _load_Icon()).Icon, {
                icon: 'x',
                className: 'debugger-breakpoint-condition-control',
                'data-path': path,
                'data-bpid': bpId,
                'data-line': line,
                onClick: event => {
                  (0, (_analytics || _load_analytics()).track)(
                  (_constants || _load_constants()).AnalyticsEvents.DEBUGGER_DELETE_BREAKPOINT_FROM_ICON);

                  atom.commands.dispatch(
                  event.target,
                  'debugger:remove-breakpoint');

                  event.stopPropagation();
                } })),


            label),

          conditionElement));



      return (
        _react.createElement((_ListView || _load_ListView()).ListViewItem, {
            key: label,
            index: i,
            value: breakpoint,
            'data-path': path,
            'data-bpid': bpId,
            'data-line': line,
            title: title,
            className: 'debugger-breakpoint' },
          content));


    });
    const separator =
    breakpoints.length !== 0 ?
    _react.createElement('hr', { className: 'nuclide-ui-hr debugger-breakpoint-separator' }) :
    null;
    return (
      _react.createElement('div', null,
        exceptionBreakpoints.map(exceptionBreakpoint => {
          return (
            _react.createElement('div', {
                className: 'debugger-breakpoint',
                key: exceptionBreakpoint.getId() },
              _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
                className: (0, (_classnames || _load_classnames()).default)(
                'debugger-breakpoint-checkbox',
                'debugger-exception-checkbox'),

                onChange: enabled =>
                service.enableOrDisableBreakpoints(
                enabled,
                exceptionBreakpoint),


                checked: exceptionBreakpoint.enabled }),

              exceptionBreakpoint.label ||
              `${exceptionBreakpoint.filter} exceptions`));


        }),
        separator,
        _react.createElement((_ListView || _load_ListView()).ListView, {
            alternateBackground: true,
            onSelect: this._handleBreakpointClick,
            selectable: true },
          items)));



  }}exports.default = BreakpointListComponent; /**
                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the BSD-style license found in the
                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                *
                                                *  strict-local
                                                * @format
                                                */