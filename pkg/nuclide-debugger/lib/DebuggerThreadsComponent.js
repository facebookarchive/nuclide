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
exports.DebuggerThreadsComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _Icon;

function _load_Icon() {
  return _Icon = require('../../nuclide-ui/Icon');
}

var _Table;

function _load_Table() {
  return _Table = require('../../nuclide-ui/Table');
}

const activeThreadIndicatorComponent = props => _reactForAtom.React.createElement(
  'div',
  { className: 'nuclide-debugger-thread-list-item-current-indicator' },
  props.cellData ? _reactForAtom.React.createElement((_Icon || _load_Icon()).Icon, { icon: 'arrow-right', title: 'Selected Thread' }) : null
);let DebuggerThreadsComponent = exports.DebuggerThreadsComponent = class DebuggerThreadsComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleSelectThread = this._handleSelectThread.bind(this);
  }

  _handleSelectThread(data, selectedIndex) {
    this.props.bridge.selectThread(data.id);
  }

  render() {
    var _props = this.props;
    const threadList = _props.threadList,
          selectedThreadId = _props.selectedThreadId;

    const columns = [{
      component: activeThreadIndicatorComponent,
      title: '',
      key: 'isSelected',
      width: 0.05
    }, {
      title: 'ID',
      key: 'id',
      width: 0.15
    }, {
      title: 'Address',
      key: 'address',
      width: 0.55
    }, {
      title: 'Stop Reason',
      key: 'stopReason',
      width: 0.25
    }];
    const emptyComponent = () => _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-thread-list-empty' },
      threadList == null ? '(threads unavailable)' : 'no threads to display'
    );
    const rows = threadList == null ? [] : threadList.map((threadItem, i) => {
      const cellData = {
        data: Object.assign({}, threadItem, {
          isSelected: Number(threadItem.id) === selectedThreadId
        })
      };
      if (Number(threadItem.id) === selectedThreadId) {
        // $FlowIssue className is an optional property of a table row
        cellData.className = 'nuclide-debugger-thread-list-item-selected';
      }
      return cellData;
    });
    return _reactForAtom.React.createElement((_Table || _load_Table()).Table, {
      columns: columns,
      emptyComponent: emptyComponent,
      rows: rows,
      selectable: true,
      onSelect: this._handleSelectThread
    });
  }
};