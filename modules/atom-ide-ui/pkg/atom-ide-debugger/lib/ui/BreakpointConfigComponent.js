'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _AtomInput;













function _load_AtomInput() {return _AtomInput = require('../../../../../nuclide-commons-ui/AtomInput');}
var _react = _interopRequireWildcard(require('react'));var _Button;
function _load_Button() {return _Button = require('../../../../../nuclide-commons-ui/Button');}var _ButtonGroup;
function _load_ButtonGroup() {return _ButtonGroup = require('../../../../../nuclide-commons-ui/ButtonGroup');}var _nuclideUri;
function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../../../nuclide-commons/nuclideUri'));}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _Checkbox;
function _load_Checkbox() {return _Checkbox = require('../../../../../nuclide-commons-ui/Checkbox');}var _Modal;
function _load_Modal() {return _Modal = require('../../../../../nuclide-commons-ui/Modal');}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _analytics;
function _load_analytics() {return _analytics = require('../../../../../nuclide-commons/analytics');}var _constants;
function _load_constants() {return _constants = require('../constants');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}











class BreakpointConfigComponent extends _react.Component


{





  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      bpId: this.props.breakpoint.getId() };


    const model = this.props.service.getModel();
    this._disposables.add(
    model.onDidChangeBreakpoints(() => {
      const breakpoint = model.
      getBreakpoints().
      filter(bp => bp.getId() === this.state.bpId);
      if (breakpoint == null) {
        // Breakpoint no longer exists.
        this.props.onDismiss();
      }
      this.forceUpdate();
    }));

  }

  componentDidMount() {
    (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_CONFIG_UI_SHOW, {
      fileExtension: (_nuclideUri || _load_nuclideUri()).default.extname(this.props.breakpoint.uri) });

    this._disposables.add(
    atom.commands.add('atom-workspace', 'core:cancel', this.props.onDismiss),
    atom.commands.add(
    'atom-workspace',
    'core:confirm',
    this._updateBreakpoint.bind(this)),

    _rxjsBundlesRxMinJs.Observable.timer(100).subscribe(() => {
      if (this._condition != null) {
        this._condition.focus();
      }
    }));

  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _updateBreakpoint() {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const { breakpoint, service } = _this.props;
      const condition = (0, (_nullthrows || _load_nullthrows()).default)(_this._condition).
      getText().
      trim();
      if (condition === (breakpoint.condition || '')) {
        _this.props.onDismiss();
        return;
      }

      yield service.removeBreakpoints(breakpoint.getId());

      const bp = {
        line: breakpoint.line,
        column: breakpoint.column,
        enabled: breakpoint.enabled };

      if (condition !== '') {
        bp.condition = condition;
      }

      yield service.addBreakpoints(breakpoint.uri, [bp]);
      (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_UPDATE_CONDITION, {
        path: breakpoint.uri,
        line: breakpoint.line,
        condition,
        fileExtension: (_nuclideUri || _load_nuclideUri()).default.extname(breakpoint.uri) });

      _this.props.onDismiss();})();
  }

  render() {
    return (
      _react.createElement((_Modal || _load_Modal()).Modal, { onDismiss: this.props.onDismiss },
        _react.createElement('div', { className: 'padded debugger-bp-dialog' },
          _react.createElement('h1', { className: 'debugger-bp-config-header' }, 'Edit breakpoint'),
          _react.createElement('div', { className: 'block' },
            _react.createElement('label', null, 'Breakpoint at ',
              (_nuclideUri || _load_nuclideUri()).default.basename(this.props.breakpoint.uri), ':',

              this.props.breakpoint.endLine != null ?
              this.props.breakpoint.endLine :
              this.props.breakpoint.line)),


          _react.createElement('div', { className: 'block' },
            _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
              onChange: isChecked => {
                (0, (_analytics || _load_analytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_BREAKPOINT_TOGGLE_ENABLED, {
                  enabled: isChecked });

                this.props.service.enableOrDisableBreakpoints(
                isChecked,
                this.props.breakpoint);

              },
              checked: this.props.breakpoint.enabled,
              label: 'Enable breakpoint' })),


          _react.createElement('div', { className: 'block' },
            _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
              placeholderText: 'Breakpoint hit condition...',
              value: this.props.breakpoint.condition || '',
              size: 'sm',
              ref: input => {
                this._condition = input;
              },
              autofocus: true })),


          _react.createElement('label', null, 'This expression will be evaluated each time the corresponding line is hit, but the debugger will only break execution if the expression evaluates to true.'),




          _react.createElement('div', { className: 'debugger-bp-config-actions' },
            _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, null,
              _react.createElement((_Button || _load_Button()).Button, { onClick: this.props.onDismiss }, 'Cancel'),
              _react.createElement((_Button || _load_Button()).Button, {
                  buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
                  onClick: this._updateBreakpoint.bind(this) }, 'Update'))))));







  }}exports.default = BreakpointConfigComponent; /**
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