'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerCallstackComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _Bridge;

function _load_Bridge() {
  return _Bridge = _interopRequireDefault(require('./Bridge'));
}

var _Table;

function _load_Table() {
  return _Table = require('../../nuclide-ui/Table');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebuggerCallstackComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleCallframeClick = this._handleCallframeClick.bind(this);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      callstack: props.callstackStore.getCallstack(),
      selectedCallFrameIndex: props.callstackStore.getSelectedCallFrameIndex()
    };
  }

  componentDidMount() {
    const { callstackStore } = this.props;
    this._disposables.add(callstackStore.onChange(() => {
      this.setState({
        selectedCallFrameIndex: callstackStore.getSelectedCallFrameIndex(),
        callstack: callstackStore.getCallstack()
      });
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _handleCallframeClick(clickedCallframe, callFrameIndex) {
    this.props.bridge.setSelectedCallFrameIndex(callFrameIndex);
    this.props.actions.setSelectedCallFrameIndex(callFrameIndex);
  }

  render() {
    const { callstack } = this.state;
    const rows = callstack == null ? [] : callstack.map((callstackItem, i) => {
      const {
        location
      } = callstackItem;
      // Callstack paths may have a format like file://foo/bar, or
      // lldb://asm/0x1234. These are not valid paths that can be used to
      // construct a nuclideUri so we need to skip the protocol prefix.
      const path = (_nuclideUri || _load_nuclideUri()).default.basename(location.path.replace(/^[a-zA-Z]+:\/\//, ''));
      const isSelected = this.state.selectedCallFrameIndex === i;
      const cellData = {
        data: {
          frame: i,
          address: callstackItem.name,
          location: `${path}:${callstackItem.location.line}`,
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
      key: 'frame',
      width: 0.05
    }, {
      title: 'Address',
      key: 'address'
    }, {
      title: 'File Location',
      key: 'location'
    }];

    const emptyComponent = () => _react.default.createElement(
      'div',
      { className: 'nuclide-debugger-callstack-list-empty' },
      'callstack unavailable'
    );

    return _react.default.createElement((_Table || _load_Table()).Table, {
      className: 'nuclide-debugger-callstack-table',
      columns: columns,
      emptyComponent: emptyComponent,
      rows: rows,
      selectable: true,
      resizable: true,
      onSelect: this._handleCallframeClick,
      sortable: false,
      ref: 'callstackTable'
    });
  }
}
exports.DebuggerCallstackComponent = DebuggerCallstackComponent; /**
                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                  * All rights reserved.
                                                                  *
                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                  * the root directory of this source tree.
                                                                  *
                                                                  * 
                                                                  */