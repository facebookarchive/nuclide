'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _path = _interopRequireWildcard(require('path'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class DebuggerCallstackComponent extends _react.Component {

  constructor(props) {
    super(props);

    _initialiseProps.call(this);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = this._getState();
  }

  _getState() {
    const { focusedStackFrame, focusedThread } = this.props.service.viewModel;
    return {
      callstack: focusedThread == null ? [] : focusedThread.getCallStack(),
      selectedCallFrameId: focusedStackFrame == null ? -1 : focusedStackFrame.frameId
    };
  }

  componentDidMount() {
    const { service } = this.props;
    const model = service.getModel();
    const { viewModel } = service;
    this._disposables.add(_rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)), (0, (_event || _load_event()).observableFromSubscribeFunction)(viewModel.onDidFocusStackFrame.bind(viewModel))).let((0, (_observable || _load_observable()).fastDebounce)(15)).subscribe(() => this.setState(this._getState())));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const { callstack } = this.state;
    const rows = callstack == null ? [] : callstack.map((stackFrame, index) => {
      const isSelected = this.state.selectedCallFrameId === stackFrame.frameId;
      const cellData = {
        data: {
          frameId: index + 1,
          address: stackFrame.name,
          frame: stackFrame,
          isSelected
        }
      };

      if (isSelected) {
        // $FlowIssue className is an optional property of a table row
        cellData.className = 'nuclide-debugger-callstack-item-selected';
      }

      return cellData;
    });

    const columns = [{
      title: '',
      key: 'frameId',
      width: 0.05
    }, {
      title: 'Address',
      key: 'address'
    }, {
      component: this._locationComponent,
      title: 'File Location',
      key: 'frame'
    }];

    const emptyComponent = () => _react.createElement(
      'div',
      { className: 'nuclide-debugger-callstack-list-empty' },
      'callstack unavailable'
    );

    return _react.createElement((_Table || _load_Table()).Table, {
      className: 'nuclide-debugger-callstack-table',
      columns: columns,
      emptyComponent: emptyComponent,
      rows: rows,
      selectable: cellData => cellData.frame.source.available,
      resizable: true,
      onSelect: this._handleStackFrameClick,
      sortable: false
    });
  }
}
exports.default = DebuggerCallstackComponent;
// eslint-disable-next-line rulesdir/prefer-nuclide-uri
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

var _initialiseProps = function () {
  this._locationComponent = props => {
    const { source, range } = props.data;
    const name = source.name != null ? source.name : _path.basename(source.uri) || (_constants || _load_constants()).UNKNOWN_SOURCE;

    // Note: IStackFrame ranges are 0-based.
    return _react.createElement(
      'div',
      { title: `${name}:${range.start.row + 1}` },
      _react.createElement(
        'span',
        null,
        name,
        ':',
        range.start.row + 1
      )
    );
  };

  this._handleStackFrameClick = (clickedRow, callFrameIndex) => {
    this.props.service.focusStackFrame(clickedRow.frame, null, null, true);
  };
};