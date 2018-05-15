'use strict';Object.defineProperty(exports, "__esModule", { value: true });












var _react = _interopRequireWildcard(require('react'));var _event;

function _load_event() {return _event = require('../../../../../nuclide-commons/event');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _constants;
function _load_constants() {return _constants = require('../constants');}var _Table;
function _load_Table() {return _Table = require('../../../../../nuclide-commons-ui/Table');}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _observable;
function _load_observable() {return _observable = require('../../../../../nuclide-commons/observable');}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}

var _path = _interopRequireWildcard(require('path'));var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _idx;
function _load_idx() {return _idx = _interopRequireDefault(require('idx'));}var _AtomInput;
function _load_AtomInput() {return _AtomInput = require('../../../../../nuclide-commons-ui/AtomInput');}var _Button;
function _load_Button() {return _Button = require('../../../../../nuclide-commons-ui/Button');}var _LoadingSpinner;
function _load_LoadingSpinner() {return _LoadingSpinner = require('../../../../../nuclide-commons-ui/LoadingSpinner');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} // eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
















class DebuggerCallstackComponent extends _react.Component


{


  constructor(props) {
    super(props);_initialiseProps.call(this);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = this._getState();
  }

  _getState() {
    const { service } = this.props;
    const { focusedStackFrame, focusedThread } = service.viewModel;
    return {
      callStackLevels: this.state == null ? 20 : this.state.callStackLevels,
      mode: service.getDebuggerMode(),
      callstack: focusedThread == null ? [] : focusedThread.getCallStack(),
      selectedCallFrameId:
      focusedStackFrame == null ? -1 : focusedStackFrame.frameId,
      isFechingStackFrames: false };

  }





















  componentDidMount() {
    const { service } = this.props;
    const model = service.getModel();
    const { viewModel } = service;
    this._disposables.add(
    _rxjsBundlesRxMinJs.Observable.merge(
    (0, (_event || _load_event()).observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)),
    (0, (_event || _load_event()).observableFromSubscribeFunction)(
    viewModel.onDidFocusStackFrame.bind(viewModel)),

    (0, (_event || _load_event()).observableFromSubscribeFunction)(service.onDidChangeMode.bind(service))).

    let((0, (_observable || _load_observable()).fastDebounce)(15)).
    subscribe(() => this.setState(this._getState())));

  }

  componentWillUnmount() {
    this._disposables.dispose();
  }








  render() {
    const { callstack, mode } = this.state;
    const rows =
    callstack == null ?
    [] :
    callstack.map((stackFrame, index) => {
      const isSelected =
      this.state.selectedCallFrameId === stackFrame.frameId;
      const cellData = {
        data: {
          frameId: index + 1,
          address: stackFrame.name,
          frame: stackFrame,
          isSelected } };



      if (isSelected) {
        // $FlowIssue className is an optional property of a table row
        cellData.className = 'debugger-callstack-item-selected';
      }

      return cellData;
    });

    const columns = [
    {
      title: '',
      key: 'frameId',
      width: 0.05 },

    {
      title: 'Address',
      key: 'address' },

    {
      component: this._locationComponent,
      title: 'File Location',
      key: 'frame' }];



    const emptyComponent = () =>
    _react.createElement('div', { className: 'debugger-callstack-list-empty' }, 'callstack unavailable');


    return (
      _react.createElement('div', {
          className: (0, (_classnames || _load_classnames()).default)('debugger-container-new', {
            'debugger-container-new-disabled': mode === (_constants || _load_constants()).DebuggerMode.RUNNING }) },

        _react.createElement('div', { className: 'debugger-pane-content' },
          _react.createElement((_Table || _load_Table()).Table, {
            className: 'debugger-callstack-table',
            columns: columns,
            emptyComponent: emptyComponent,
            rows: rows,
            selectable: cellData => cellData.frame.source.available,
            resizable: true,
            onSelect: this._handleStackFrameClick,
            sortable: false }),

          this._renderLoadMoreStackFrames())));



  }

  _renderLoadMoreStackFrames() {var _ref, _ref2, _ref3;
    const { viewModel } = this.props.service;
    const { callstack, isFechingStackFrames } = this.state;
    const totalFrames =
    ((_ref = viewModel) != null ? (_ref2 = _ref.focusedThread) != null ? (_ref3 = _ref2.stoppedDetails) != null ? _ref3.totalFrames : _ref3 : _ref2 : _ref) || 0;
    if (totalFrames <= callstack.length || callstack.length <= 1) {
      return null;
    }
    return (
      _react.createElement('div', { style: { display: 'flex' } },
        _react.createElement((_Button || _load_Button()).Button, {
            size: (_Button || _load_Button()).ButtonSizes.EXTRA_SMALL,
            disabled: isFechingStackFrames,
            onClick: () => {
              this.setState({ isFechingStackFrames: true });
              (0, (_nullthrows || _load_nullthrows()).default)(viewModel.focusedThread).
              fetchCallStack(this.state.callStackLevels).
              then(() => this.setState(this._getState()));
            } }, 'More Stack Frames'),


        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          style: { 'flex-grow': '1' },
          placeholderText: 'Number of stack frames',
          initialValue: String(this.state.callStackLevels),
          size: 'xs',
          onDidChange: value => {
            if (!isNaN(value)) {
              this.setState({ callStackLevels: parseInt(value, 10) });
            }
          } }),

        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, null),
        isFechingStackFrames ?
        _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.EXTRA_SMALL }) :
        null));


  }}exports.default = DebuggerCallstackComponent; /**
                                                   * Copyright (c) 2017-present, Facebook, Inc.
                                                   * All rights reserved.
                                                   *
                                                   * This source code is licensed under the BSD-style license found in the
                                                   * LICENSE file in the root directory of this source tree. An additional grant
                                                   * of patent rights can be found in the PATENTS file in the same directory.
                                                   *
                                                   * 
                                                   * @format
                                                   */var _initialiseProps = function () {this._locationComponent = props => {const { source, range } = props.data;const name = source.name != null ? source.name : _path.basename(source.uri) || (_constants || _load_constants()).UNKNOWN_SOURCE; // Note: IStackFrame ranges are 0-based.
    return _react.createElement('div', { title: `${name}:${range.start.row + 1}` }, _react.createElement('span', null, name, ':', range.start.row + 1));};this._handleStackFrameClick = (clickedRow, callFrameIndex) => {this.props.service.focusStackFrame(clickedRow.frame, null, null, true);};};