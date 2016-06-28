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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _nuclideUiLibAtomInput2;

function _nuclideUiLibAtomInput() {
  return _nuclideUiLibAtomInput2 = require('../../nuclide-ui/lib/AtomInput');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var AttachUIComponent = (function (_React$Component) {
  _inherits(AttachUIComponent, _React$Component);

  function AttachUIComponent(props) {
    _classCallCheck(this, AttachUIComponent);

    _get(Object.getPrototypeOf(AttachUIComponent.prototype), 'constructor', this).call(this, props);

    this._handleFilterTextChange = this._handleFilterTextChange.bind(this);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleAttachClick = this._handleAttachClick.bind(this);
    this._updateAttachTargetList = this._updateAttachTargetList.bind(this);
    this._updateList = this._updateList.bind(this);
    this.state = {
      targetListChangeDisposable: this.props.store.onAttachTargetListChanged(this._updateList),
      attachTargetInfos: [],
      selectedAttachTarget: null,
      filterText: ''
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
    key: 'render',
    value: function render() {
      var _this = this;

      var containerStyle = {
        maxHeight: '30em',
        overflow: 'auto'
      };
      var hasSelectedItem = false;
      var filterRegex = new RegExp(this.state.filterText, 'i');
      var children = this.state.attachTargetInfos.filter(function (item) {
        return filterRegex.test(item.name) || filterRegex.test(item.pid.toString()) || filterRegex.test(item.commandName);
      }).map(function (item, index) {
        var isSelected = _this.state.selectedAttachTarget === item;
        if (isSelected) {
          hasSelectedItem = true;
        }
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'tr',
          { key: index + 1,
            align: 'center',
            className: (0, (_classnames2 || _classnames()).default)({ 'attach-selected-row': isSelected }),
            onClick: _this._handleClickTableRow.bind(_this, item),
            onDoubleClick: _this._handleDoubleClickTableRow.bind(_this, index) },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'td',
            null,
            item.name
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'td',
            null,
            item.pid
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'td',
            null,
            item.commandName
          )
        );
      });
      // TODO: wrap into separate React components.
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'block' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
          placeholderText: 'Search...',
          initialValue: this.state.filterText,
          onDidChange: this._handleFilterTextChange,
          size: 'sm'
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { style: containerStyle },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'table',
            { className: 'nuclide-debugger-lldb-client-process-table', width: '100%' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'thead',
              null,
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'tr',
                { key: '0', align: 'center' },
                (_reactForAtom2 || _reactForAtom()).React.createElement(
                  'td',
                  null,
                  'Process Name'
                ),
                (_reactForAtom2 || _reactForAtom()).React.createElement(
                  'td',
                  null,
                  'PID'
                ),
                (_reactForAtom2 || _reactForAtom()).React.createElement(
                  'td',
                  null,
                  'Command Name'
                )
              )
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'tbody',
              { align: 'center' },
              children
            )
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'padded text-right' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
            { onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
            {
              buttonType: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonTypes.PRIMARY,
              onClick: this._handleAttachClick,
              disabled: !hasSelectedItem },
            'Attach'
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
    key: '_handleClickTableRow',
    value: function _handleClickTableRow(item) {
      this.setState({
        selectedAttachTarget: item
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