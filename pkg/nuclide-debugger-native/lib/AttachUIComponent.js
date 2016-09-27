Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiAtomInput2;

function _nuclideUiAtomInput() {
  return _nuclideUiAtomInput2 = require('../../nuclide-ui/AtomInput');
}

var _nuclideUiTable2;

function _nuclideUiTable() {
  return _nuclideUiTable2 = require('../../nuclide-ui/Table');
}

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup2;

function _nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup2 = require('../../nuclide-ui/ButtonGroup');
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
      var order = sortDescending ? -1 : 1;
      return function (target1, target2) {
        return order * (target1.pid - target2.pid);
      };
    case 'process':
      return function (target1, target2) {
        var first = sortDescending ? target2.name : target1.name;
        var second = sortDescending ? target1.name : target2.name;
        return first.toLowerCase().localeCompare(second.toLowerCase());
      };
    case 'command':
      return function (target1, target2) {
        var first = sortDescending ? target2.commandName : target1.commandName;
        var second = sortDescending ? target1.commandName : target2.commandName;
        return first.toLowerCase().localeCompare(second.toLowerCase());
      };
    default:
      break;
  }
  return function () {
    return 0;
  };
}

var AttachUIComponent = (function (_React$Component) {
  _inherits(AttachUIComponent, _React$Component);

  function AttachUIComponent(props) {
    _classCallCheck(this, AttachUIComponent);

    _get(Object.getPrototypeOf(AttachUIComponent.prototype), 'constructor', this).call(this, props);

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

  _createClass(AttachUIComponent, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.state.targetListChangeDisposable != null) {
        this.state.targetListChangeDisposable.dispose();
      }
    }
  }, {
    key: '_updateList',
    value: function _updateList() {
      var newSelectedTarget = this.state.selectedAttachTarget == null ? null : this._getAttachTargetOfPid(this.state.selectedAttachTarget.pid);
      this.setState({
        attachTargetInfos: this.props.store.getAttachTargetInfos(),
        selectedAttachTarget: newSelectedTarget
      });
    }
  }, {
    key: '_getAttachTargetOfPid',
    value: function _getAttachTargetOfPid(pid) {
      for (var target of this.props.store.getAttachTargetInfos()) {
        if (target.pid === pid) {
          return target;
        }
      }
      return null;
    }
  }, {
    key: '_handleSort',
    value: function _handleSort(sortedColumn, sortDescending) {
      this.setState({
        sortedColumn: sortedColumn,
        sortDescending: sortDescending
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var filterRegex = new RegExp(this.state.filterText, 'i');
      var _state = this.state;
      var attachTargetInfos = _state.attachTargetInfos;
      var sortedColumn = _state.sortedColumn;
      var sortDescending = _state.sortDescending;

      var compareFn = getCompareFunction(sortedColumn, sortDescending);
      var selectedAttachTarget = this.state.selectedAttachTarget;

      var selectedIndex = null;
      var rows = attachTargetInfos.filter(function (item) {
        return filterRegex.test(item.name) || filterRegex.test(item.pid.toString()) || filterRegex.test(item.commandName);
      }).sort(compareFn).map(function (item, index) {
        var row = {
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
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'block' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomInput2 || _nuclideUiAtomInput()).AtomInput, {
          placeholderText: 'Search...',
          initialValue: this.state.filterText,
          onDidChange: this._handleFilterTextChange,
          size: 'sm'
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiTable2 || _nuclideUiTable()).Table, {
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
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-native-launch-attach-actions' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiButtonGroup2 || _nuclideUiButtonGroup()).ButtonGroup,
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiButton2 || _nuclideUiButton()).Button,
              { onClick: this._handleCancelButtonClick },
              'Cancel'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiButton2 || _nuclideUiButton()).Button,
              {
                buttonType: (_nuclideUiButton2 || _nuclideUiButton()).ButtonTypes.PRIMARY,
                onClick: this._handleAttachClick,
                disabled: selectedIndex == null },
              'Attach'
            )
          )
        )
      );
    }
  }, {
    key: '_handleFilterTextChange',
    value: function _handleFilterTextChange(text) {
      this.setState({
        filterText: text
      });
    }
  }, {
    key: '_handleSelectTableRow',
    value: function _handleSelectTableRow(item, selectedIndex) {
      var attachTarget = this._getAttachTargetOfPid(item.pid);
      this.setState({
        selectedAttachTarget: attachTarget
      });
    }
  }, {
    key: '_handleDoubleClickTableRow',
    value: function _handleDoubleClickTableRow() {
      this._attachToProcess();
    }
  }, {
    key: '_handleAttachClick',
    value: function _handleAttachClick() {
      this._attachToProcess();
    }
  }, {
    key: '_handleCancelButtonClick',
    value: function _handleCancelButtonClick() {
      this.props.actions.toggleLaunchAttachDialog();
    }
  }, {
    key: '_updateAttachTargetList',
    value: function _updateAttachTargetList() {
      // Fire and forget.
      this.props.actions.updateAttachTargetList();
    }
  }, {
    key: '_attachToProcess',
    value: function _attachToProcess() {
      var attachTarget = this.state.selectedAttachTarget;
      if (attachTarget != null) {
        // Fire and forget.
        this.props.actions.attachDebugger(attachTarget);
        this.props.actions.showDebuggerPanel();
        this.props.actions.toggleLaunchAttachDialog();
      }
    }
  }]);

  return AttachUIComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.AttachUIComponent = AttachUIComponent;