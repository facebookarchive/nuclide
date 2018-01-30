'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DisassemblyView = undefined;

var _react = _interopRequireWildcard(require('react'));

var _CallstackStore;

function _load_CallstackStore() {
  return _CallstackStore = _interopRequireDefault(require('./CallstackStore'));
}

var _DebuggerModel;

function _load_DebuggerModel() {
  return _DebuggerModel = _interopRequireDefault(require('./DebuggerModel'));
}

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class DisassemblyView extends _react.Component {

  constructor(props) {
    super(props);

    this._callStackUpdated = this._callStackUpdated.bind(this);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._callstackStore = this.props.model.getCallstackStore();
    this.state = {
      frameInfo: null
    };
  }

  componentDidMount() {
    this.props.model.getStore().setShowDisassembly(true);
    this._disposables.add(() => {
      this.props.model.getStore().setShowDisassembly(false);
    }, this._callstackStore.onChange(() => {
      this._callStackUpdated();
    }));

    this._callStackUpdated();
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _callStackUpdated() {
    const callstack = this._callstackStore.getCallstack();
    if (callstack == null || callstack.length === 0) {
      this.setState({
        frameInfo: null
      });
    } else {
      const selectedFrame = this._callstackStore.getSelectedCallFrameIndex();
      const selectedFrameInfo = callstack[selectedFrame];
      this.setState({
        frameInfo: selectedFrameInfo != null ? selectedFrameInfo.disassembly : null
      });
    }
  }

  render() {
    let frameMetadata = [];
    let rows = [];
    let title = null;
    let selectedIndex = 0;

    const { frameInfo } = this.state;
    if (frameInfo != null) {
      selectedIndex = frameInfo.currentInstructionIndex;
      title = frameInfo.frameTitle;
      frameMetadata = frameInfo.metadata.sort((a, b) => a.name.localeCompare(b.name)).map(metadata => {
        return _react.createElement(
          'div',
          { key: `metadata_${metadata.name}` },
          _react.createElement(
            'b',
            null,
            metadata.name,
            ':'
          ),
          ' ',
          metadata.value
        );
      });

      rows = frameInfo.instructions.map(instruction => {
        return {
          data: {
            address: instruction.address,
            instruction: instruction.instruction,
            offset: instruction.offset || '',
            comment: instruction.comment || ''
          }
        };
      });
    }
    const showOffset = rows.find(r => r.data.offset !== '') != null;
    const columns = showOffset ? [{
      title: 'Address',
      key: 'address',
      width: 0.15
    }, {
      title: 'Offset',
      key: 'offset',
      width: 0.15
    }, {
      title: 'Instruction',
      key: 'instruction',
      width: 0.35
    }, {
      title: 'Comment',
      key: 'comment',
      width: 0.3
    }] : [{
      title: 'Address',
      key: 'address',
      width: 0.15
    }, {
      title: 'Instruction',
      key: 'instruction',
      width: 0.4
    }, {
      title: 'Comment',
      key: 'comment',
      width: 0.4
    }];

    const emptyComponent = () => _react.createElement(
      'div',
      { className: 'nuclide-debugger-disassembly-empty' },
      'disassembly unavailable.'
    );

    return _react.createElement(
      'div',
      { className: 'nuclide-debugger-container-new' },
      _react.createElement(
        'div',
        { className: 'nuclide-debugger-pane-content' },
        _react.createElement(
          'h3',
          null,
          title
        ),
        _react.createElement(
          'div',
          null,
          frameMetadata
        ),
        _react.createElement(
          'div',
          { className: 'nuclide-debugger-disassembly-helptext' },
          'The instructions for the current frame are displayed below. Right click a row to add a breakpoint at an address.'
        ),
        _react.createElement(
          'div',
          { className: 'nuclide-debugger-disassembly-view' },
          _react.createElement((_Table || _load_Table()).Table, {
            columns: columns,
            emptyComponent: emptyComponent,
            rows: rows,
            selectable: true,
            selectedIndex: selectedIndex,
            onWillSelect: () => false,
            resizable: true,
            sortable: false,
            className: 'nuclide-debugger-disassembly-table'
          })
        )
      )
    );
  }
}
exports.DisassemblyView = DisassemblyView;