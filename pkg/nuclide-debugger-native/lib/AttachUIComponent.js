'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachUIComponent = undefined;

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _react = _interopRequireDefault(require('react'));

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

class AttachUIComponent extends _react.default.Component {

  constructor(props) {
    super(props);

    this._handleFilterTextChange = this._handleFilterTextChange.bind(this);
    this._handleSelectTableRow = this._handleSelectTableRow.bind(this);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleAttachClick = this._handleAttachClick.bind(this);
    this._handleParentVisibilityChanged = this._handleParentVisibilityChanged.bind(this);
    this._updateAttachTargetList = this._updateAttachTargetList.bind(this);
    this._updateList = this._updateList.bind(this);
    this._handleSort = this._handleSort.bind(this);
    this._targetListUpdating = false;
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
    this.props.parentEmitter.on((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.VISIBILITY_CHANGED, this._handleParentVisibilityChanged);
    this.props.actions.updateAttachUIVisibility(true);
  }

  componentWillUnmount() {
    this.props.actions.updateAttachUIVisibility(false);
    if (this.state.targetListChangeDisposable != null) {
      this.state.targetListChangeDisposable.dispose();
    }
    this.props.parentEmitter.removeListener((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.VISIBILITY_CHANGED, this._handleParentVisibilityChanged);
    this.props.parentEmitter.removeListener((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleAttachClick);
  }

  _updateList() {
    const newSelectedTarget = this.state.selectedAttachTarget == null ? null : this._getAttachTargetOfPid(this.state.selectedAttachTarget.pid);
    this._targetListUpdating = false;
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
      sortedColumn,
      sortDescending
    });
  }

  render() {
    const filterRegex = new RegExp(this.state.filterText, 'i');
    const {
      attachTargetInfos,
      sortedColumn,
      sortDescending
    } = this.state;
    const compareFn = getCompareFunction(sortedColumn, sortDescending);
    const { selectedAttachTarget } = this.state;
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
    return _react.default.createElement(
      'div',
      { className: 'block' },
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Search...',
        initialValue: this.state.filterText,
        onDidChange: this._handleFilterTextChange,
        size: 'sm'
      }),
      _react.default.createElement((_Table || _load_Table()).Table, {
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
      _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-native-launch-attach-actions' },
        _react.default.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          _react.default.createElement(
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

  _handleParentVisibilityChanged(visible) {
    this.props.actions.updateParentUIVisibility(visible);
  }

  _handleCancelButtonClick() {
    this.props.actions.toggleLaunchAttachDialog();
  }

  _updateAttachTargetList() {
    // Fire and forget.
    if (!this._targetListUpdating) {
      this._targetListUpdating = true;
      this.props.actions.updateAttachTargetList();
    }
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
}
exports.AttachUIComponent = AttachUIComponent;