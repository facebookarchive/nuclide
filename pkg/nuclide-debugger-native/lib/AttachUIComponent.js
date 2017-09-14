'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachUIComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getColumns() {
  return [{
    title: 'Process Name',
    key: 'process',
    width: 0.25
  }, {
    title: 'PID',
    key: 'pid',
    width: 0.1
  }, {
    title: 'Command Name',
    key: 'command',
    width: 0.65
  }];
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

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

class AttachUIComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._updateList = () => {
      let filterText = null;
      let newSelectedTarget = null;
      if (!this._deserializedSavedSettings && this.state.attachTargetInfos.length > 0) {
        // Deserialize the saved settings the first time the process list updates.
        this._deserializedSavedSettings = true;
        (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
          newSelectedTarget = this.state.attachTargetInfos.find(target => target.pid === transientSettings.attachPid && target.name === transientSettings.attachName);
          filterText = transientSettings.filterText;
        });
      }

      if (newSelectedTarget == null) {
        newSelectedTarget = this.state.selectedAttachTarget == null ? null : this._getAttachTargetOfPid(this.state.selectedAttachTarget.pid);
      }
      this._targetListUpdating = false;
      this.setState({
        attachTargetInfos: this.props.store.getAttachTargetInfos(),
        selectedAttachTarget: newSelectedTarget,
        filterText: filterText || this.state.filterText
      });
    };

    this._handleSort = (sortedColumn, sortDescending) => {
      this.setState({
        sortedColumn,
        sortDescending
      });
    };

    this._handleFilterTextChange = text => {
      this.setState({
        filterText: text
      });
    };

    this._handleSelectTableRow = (item, selectedIndex) => {
      const attachTarget = this._getAttachTargetOfPid(item.pid);
      this.setState({
        selectedAttachTarget: attachTarget
      });
    };

    this._handleAttachClick = () => {
      this._attachToProcess();
    };

    this._updateAttachTargetList = () => {
      // Fire and forget.
      if (!this._targetListUpdating) {
        this._targetListUpdating = true;
        this.props.actions.updateAttachTargetList();
      }
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._targetListUpdating = false;
    this._deserializedSavedSettings = false;
    this._disposables.add(this.props.store.onAttachTargetListChanged(this._updateList));

    this.state = {
      attachTargetInfos: [],
      selectedAttachTarget: null,
      filterText: '',
      sortDescending: false,
      sortedColumn: null
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'attach', 'native'];
  }

  componentDidMount() {
    this.props.actions.updateParentUIVisibility(true);
    this.props.actions.updateAttachUIVisibility(true);
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this._debugButtonShouldEnable()) {
          this._handleAttachClick();
        }
      }
    }));
  }

  componentWillUnmount() {
    this.props.actions.updateParentUIVisibility(false);
    this.props.actions.updateAttachUIVisibility(false);
    this._disposables.dispose();
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  _debugButtonShouldEnable() {
    return this.state.selectedAttachTarget != null;
  }

  _getAttachTargetOfPid(pid) {
    for (const target of this.props.store.getAttachTargetInfos()) {
      if (target.pid === pid) {
        return target;
      }
    }
    return null;
  }

  render() {
    const filterRegex = new RegExp(this.state.filterText, 'i');
    const { attachTargetInfos, sortedColumn, sortDescending } = this.state;
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
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Search...',
        value: this.state.filterText,
        onDidChange: this._handleFilterTextChange,
        size: 'sm',
        autofocus: true
      }),
      _react.createElement((_Table || _load_Table()).Table, {
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
      })
    );
  }

  _handleDoubleClickTableRow() {
    this._attachToProcess();
  }

  _attachToProcess() {
    const attachTarget = this.state.selectedAttachTarget;
    if (attachTarget != null) {
      // Fire and forget.
      this.props.actions.attachDebugger(attachTarget);
      (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).serializeDebuggerConfig)(...this._getSerializationArgs(), {}, {
        attachPid: attachTarget.pid,
        attachName: attachTarget.name,
        filterText: this.state.filterText
      });
    }
  }
}
exports.AttachUIComponent = AttachUIComponent;