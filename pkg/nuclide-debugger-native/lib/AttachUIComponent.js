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
exports.AttachUIComponent = undefined;

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _reactForAtom = require('react-for-atom');

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _Table;

function _load_Table() {
  return _Table = require('../../nuclide-ui/Table');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

function getColumns() {
  return [{
    title: 'Process Name',
    key: 'process',
    width: 0.25
  }, {
    title: 'PID',
    key: 'pid',
    width: 0.10
  }, {
    title: 'Command Name',
    key: 'command',
    width: 0.65
  }];
}

function getCompareFunction(sortedColumn, sortDescending) {
  switch (sortedColumn) {
    case 'pid':
      const order = sortDescending ? -1 : 1;
      return (target1, target2) => order * (target1.pid - target2.pid);
    case 'process':
      return (target1, target2) => {
        const first = sortDescending ? target2.name : target1.name;
        const second = sortDescending ? target1.name : target2.name;
        return first.toLowerCase().localeCompare(second.toLowerCase());
      };
    case 'command':
      return (target1, target2) => {
        const first = sortDescending ? target2.commandName : target1.commandName;
        const second = sortDescending ? target1.commandName : target2.commandName;
        return first.toLowerCase().localeCompare(second.toLowerCase());
      };
    default:
      break;
  }
  return () => 0;
}

let AttachUIComponent = exports.AttachUIComponent = class AttachUIComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);

    this._handleFilterTextChange = this._handleFilterTextChange.bind(this);
    this._handleSelectTableRow = this._handleSelectTableRow.bind(this);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleAttachClick = this._handleAttachClick.bind(this);
    this._updateAttachTargetList = this._updateAttachTargetList.bind(this);
    this._updateList = this._updateList.bind(this);
    this._handleSort = this._handleSort.bind(this);
    this.state = {
      targetListChangeDisposable: this.props.store.onAttachTargetListChanged(this._updateList),
      attachTargetInfos: [],
      selectedAttachTarget: null,
      filterText: '',
      sortDescending: false,
      sortedColumn: null
    };
  }

  componentWillMount() {
    this.props.parentEmitter.on((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleAttachClick);
  }

  componentWillUnmount() {
    if (this.state.targetListChangeDisposable != null) {
      this.state.targetListChangeDisposable.dispose();
    }

    this.props.parentEmitter.removeListener((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleAttachClick);
  }

  _updateList() {
    const newSelectedTarget = this.state.selectedAttachTarget == null ? null : this._getAttachTargetOfPid(this.state.selectedAttachTarget.pid);
    this.setState({
      attachTargetInfos: this.props.store.getAttachTargetInfos(),
      selectedAttachTarget: newSelectedTarget
    });
  }

  _getAttachTargetOfPid(pid) {
    for (const target of this.props.store.getAttachTargetInfos()) {
      if (target.pid === pid) {
        return target;
      }
    }
    return null;
  }

  _handleSort(sortedColumn, sortDescending) {
    this.setState({
      sortedColumn: sortedColumn,
      sortDescending: sortDescending
    });
  }

  render() {
    const filterRegex = new RegExp(this.state.filterText, 'i');
    var _state = this.state;
    const attachTargetInfos = _state.attachTargetInfos,
          sortedColumn = _state.sortedColumn,
          sortDescending = _state.sortDescending;

    const compareFn = getCompareFunction(sortedColumn, sortDescending);
    const selectedAttachTarget = this.state.selectedAttachTarget;

    let selectedIndex = null;
    const rows = attachTargetInfos.filter(item => filterRegex.test(item.name) || filterRegex.test(item.pid.toString()) || filterRegex.test(item.commandName)).sort(compareFn).map((item, index) => {
      const row = {
        data: {
          process: item.name,
          pid: item.pid,
          command: item.commandName
        }
      };
      if (selectedAttachTarget != null && row.data.pid === selectedAttachTarget.pid) {
        selectedIndex = index;
      }
      return row;
    });
    return _reactForAtom.React.createElement(
      'div',
      { className: 'block' },
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Search...',
        initialValue: this.state.filterText,
        onDidChange: this._handleFilterTextChange,
        size: 'sm'
      }),
      _reactForAtom.React.createElement((_Table || _load_Table()).Table, {
        columns: getColumns(),
        fixedHeader: true,
        maxBodyHeight: '30em',
        rows: rows,
        sortable: true,
        onSort: this._handleSort,
        sortedColumn: this.state.sortedColumn,
        sortDescending: this.state.sortDescending,
        selectable: true,
        selectedIndex: selectedIndex,
        onSelect: this._handleSelectTableRow,
        collapsable: true
      }),
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-debugger-native-launch-attach-actions' },
        _reactForAtom.React.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            {
              buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
              onClick: this._handleAttachClick,
              disabled: selectedIndex == null },
            'Attach'
          )
        )
      )
    );
  }

  _handleFilterTextChange(text) {
    this.setState({
      filterText: text
    });
  }

  _handleSelectTableRow(item, selectedIndex) {
    const attachTarget = this._getAttachTargetOfPid(item.pid);
    this.setState({
      selectedAttachTarget: attachTarget
    });
  }

  _handleDoubleClickTableRow() {
    this._attachToProcess();
  }

  _handleAttachClick() {
    this._attachToProcess();
  }

  _handleCancelButtonClick() {
    this.props.actions.toggleLaunchAttachDialog();
  }

  _updateAttachTargetList() {
    // Fire and forget.
    this.props.actions.updateAttachTargetList();
  }

  _attachToProcess() {
    const attachTarget = this.state.selectedAttachTarget;
    if (attachTarget != null) {
      // Fire and forget.
      this.props.actions.attachDebugger(attachTarget);
      this.props.actions.showDebuggerPanel();
      this.props.actions.toggleLaunchAttachDialog();
    }
  }
};