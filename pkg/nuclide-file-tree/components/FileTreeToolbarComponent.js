Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _WorkingSetSelectionComponent = require('./WorkingSetSelectionComponent');

var _WorkingSetNameAndSaveComponent = require('./WorkingSetNameAndSaveComponent');

var _libFileTreeStore = require('../lib/FileTreeStore');

var _libFileTreeActions = require('../lib/FileTreeActions');

var _libFileTreeActions2 = _interopRequireDefault(_libFileTreeActions);

var _nuclideWorkingSets = require('../../nuclide-working-sets');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var FileTreeToolbarComponent = (function (_React$Component) {
  _inherits(FileTreeToolbarComponent, _React$Component);

  function FileTreeToolbarComponent(props) {
    var _this = this;

    _classCallCheck(this, FileTreeToolbarComponent);

    _get(Object.getPrototypeOf(FileTreeToolbarComponent.prototype), 'constructor', this).call(this, props);

    this._store = _libFileTreeStore.FileTreeStore.getInstance();
    this.state = {
      selectionIsActive: false,
      definitionsAreEmpty: props.workingSetsStore.getDefinitions().length === 0,
      isUpdatingExistingWorkingSet: false,
      updatedWorkingSetName: ''
    };

    this._inProcessOfClosingSelection = false;
    this._actions = _libFileTreeActions2['default'].getInstance();

    this._disposables = new _atom.CompositeDisposable();
    this._disposables.add(props.workingSetsStore.subscribeToDefinitions(function (definitions) {
      var empty = definitions.applicable.length + definitions.notApplicable.length === 0;
      _this.setState({ definitionsAreEmpty: empty });
    }));

    this._toggleWorkingSetsSelector = this._toggleWorkingSetsSelector.bind(this);
    this._checkIfClosingSelector = this._checkIfClosingSelector.bind(this);
    this._editWorkingSet = this._editWorkingSet.bind(this);
    this._saveWorkingSet = this._saveWorkingSet.bind(this);
    this._updateWorkingSet = this._updateWorkingSet.bind(this);
    this._toggleWorkingSetEditMode = this._toggleWorkingSetEditMode.bind(this);
  }

  _createClass(FileTreeToolbarComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._disposables.add(atom.commands.add('atom-workspace',
      // This command is exposed in the nuclide-working-sets menu config.
      'working-sets:select-active', // eslint-disable-line nuclide-internal/command-menu-items
      this._toggleWorkingSetsSelector));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (!prevState.selectionIsActive && this.state.selectionIsActive) {
        this._closeWorkingSetsSelector = this._renderWorkingSetSelectionPanel();
      } else if (prevState.selectionIsActive && !this.state.selectionIsActive) {
        (0, _assert2['default'])(this._closeWorkingSetsSelector);
        this._closeWorkingSetsSelector();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var workingSet = this._store.getWorkingSet();
      var editedWorkingSetIsEmpty = this._store.isEditedWorkingSetEmpty();
      var isEditingWorkingSet = this._store.isEditingWorkingSet();

      var selectWorkingSetButton = undefined;
      if (!this.state.definitionsAreEmpty && !isEditingWorkingSet) {
        selectWorkingSetButton = _reactForAtom.React.createElement(SelectWorkingSetButton, {
          highlight: !workingSet.isEmpty(),
          onClick: this._toggleWorkingSetsSelector,
          onFocus: this._checkIfClosingSelector
        });
      }

      var workingSetNameAndSave = undefined;
      if (isEditingWorkingSet && !editedWorkingSetIsEmpty) {
        workingSetNameAndSave = _reactForAtom.React.createElement(_WorkingSetNameAndSaveComponent.WorkingSetNameAndSaveComponent, {
          isEditing: this.state.isUpdatingExistingWorkingSet,
          initialName: this.state.updatedWorkingSetName,
          onUpdate: this._updateWorkingSet,
          onSave: this._saveWorkingSet,
          onCancel: this._toggleWorkingSetEditMode
        });
      }

      return _reactForAtom.React.createElement(
        'div',
        {
          className: (0, _classnames2['default'])({
            'nuclide-file-tree-toolbar': true,
            'nuclide-file-tree-toolbar-fader': workingSet.isEmpty() && !this.state.selectionIsActive && !this._store.isEditingWorkingSet()
          }) },
        _reactForAtom.React.createElement(
          'div',
          { className: 'btn-group pull-right' },
          selectWorkingSetButton,
          _reactForAtom.React.createElement(DefineWorkingSetButton, {
            isActive: isEditingWorkingSet,
            onClick: this._toggleWorkingSetEditMode
          })
        ),
        _reactForAtom.React.createElement('div', { className: 'clearfix' }),
        workingSetNameAndSave
      );
    }
  }, {
    key: '_toggleWorkingSetsSelector',
    value: function _toggleWorkingSetsSelector() {
      if (this._inProcessOfClosingSelection) {
        this._inProcessOfClosingSelection = false;
        return;
      }

      this.setState({ selectionIsActive: !this.state.selectionIsActive });
    }
  }, {
    key: '_renderWorkingSetSelectionPanel',
    value: function _renderWorkingSetSelectionPanel() {
      var _this2 = this;

      var reactDiv = document.createElement('div');
      var panel = atom.workspace.addModalPanel({ item: reactDiv });

      var closed = false;
      var onClose = function onClose() {
        if (closed) {
          return;
        }
        closed = true;

        _reactForAtom.ReactDOM.unmountComponentAtNode(reactDiv);
        panel.destroy();
        _this2.setState({ selectionIsActive: false });
      };

      _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_WorkingSetSelectionComponent.WorkingSetSelectionComponent, {
        workingSetsStore: this.props.workingSetsStore,
        onClose: onClose,
        onEditWorkingSet: this._editWorkingSet
      }), reactDiv);

      return onClose;
    }
  }, {
    key: '_toggleWorkingSetEditMode',
    value: function _toggleWorkingSetEditMode() {
      if (this._store.isEditingWorkingSet()) {
        this._finishEditingWorkingSet();
      } else {
        this._startEditingWorkingSet(new _nuclideWorkingSets.WorkingSet());
      }
    }
  }, {
    key: '_saveWorkingSet',
    value: function _saveWorkingSet(name) {
      var workingSetsStore = this._store.getWorkingSetsStore();
      (0, _assert2['default'])(workingSetsStore);

      var editedWorkingSet = this._store.getEditedWorkingSet();
      this._finishEditingWorkingSet();
      workingSetsStore.saveWorkingSet(name, editedWorkingSet);
      workingSetsStore.activate(name);
    }
  }, {
    key: '_updateWorkingSet',
    value: function _updateWorkingSet(prevName, name) {
      var workingSetsStore = this._store.getWorkingSetsStore();
      (0, _assert2['default'])(workingSetsStore);
      var editedWorkingSet = this._store.getEditedWorkingSet();
      this._finishEditingWorkingSet();

      workingSetsStore.update(prevName, name, editedWorkingSet);
    }
  }, {
    key: '_checkIfClosingSelector',
    value: function _checkIfClosingSelector() {
      if (this.state.selectionIsActive) {
        this._inProcessOfClosingSelection = true;
      }
    }
  }, {
    key: '_editWorkingSet',
    value: function _editWorkingSet(name, uris) {
      this._prevName = name;
      this.setState({
        isUpdatingExistingWorkingSet: true,
        updatedWorkingSetName: name,
        selectionIsActive: false
      });
      this._startEditingWorkingSet(new _nuclideWorkingSets.WorkingSet(uris));
    }
  }, {
    key: '_startEditingWorkingSet',
    value: function _startEditingWorkingSet(workingSet) {
      this._actions.startEditingWorkingSet(workingSet);
    }
  }, {
    key: '_finishEditingWorkingSet',
    value: function _finishEditingWorkingSet() {
      this.setState({
        isUpdatingExistingWorkingSet: false,
        updatedWorkingSetName: ''
      });
      this._actions.finishEditingWorkingSet();
    }
  }]);

  return FileTreeToolbarComponent;
})(_reactForAtom.React.Component);

exports.FileTreeToolbarComponent = FileTreeToolbarComponent;

var SelectWorkingSetButton = (function (_React$Component2) {
  _inherits(SelectWorkingSetButton, _React$Component2);

  function SelectWorkingSetButton() {
    _classCallCheck(this, SelectWorkingSetButton);

    _get(Object.getPrototypeOf(SelectWorkingSetButton.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SelectWorkingSetButton, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var highlight = _props.highlight;
      var onClick = _props.onClick;
      var onFocus = _props.onFocus;

      return _reactForAtom.React.createElement(
        _nuclideUiLibButton.Button,
        {
          selected: highlight,
          ref: (0, _nuclideAtomHelpers.addTooltip)({
            title: 'Select Working Sets',
            delay: 500,
            placement: 'bottom',
            keyBindingCommand: 'working-sets:select-active'
          }),
          onClick: onClick,
          onFocus: onFocus },
        _reactForAtom.React.createElement('span', { className: 'icon icon-list-unordered nuclide-file-tree-toolbar-icon' })
      );
    }
  }]);

  return SelectWorkingSetButton;
})(_reactForAtom.React.Component);

var DefineWorkingSetButton = (function (_React$Component3) {
  _inherits(DefineWorkingSetButton, _React$Component3);

  function DefineWorkingSetButton() {
    _classCallCheck(this, DefineWorkingSetButton);

    _get(Object.getPrototypeOf(DefineWorkingSetButton.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DefineWorkingSetButton, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var isActive = _props2.isActive;
      var onClick = _props2.onClick;

      return _reactForAtom.React.createElement(
        _nuclideUiLibButton.Button,
        {
          selected: isActive,
          ref: (0, _nuclideAtomHelpers.addTooltip)({
            title: isActive ? 'Cancel' : 'Define a Working Set',
            delay: 500,
            placement: 'bottom'
          }),
          onClick: onClick },
        _reactForAtom.React.createElement('span', { className: (0, _classnames2['default'])({
            icon: true,
            'icon-plus': !isActive,
            'icon-dash': isActive,
            'nuclide-file-tree-toolbar-icon': true
          })
        })
      );
    }
  }]);

  return DefineWorkingSetButton;
})(_reactForAtom.React.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlVG9vbGJhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVc4QixnQkFBZ0I7O29CQUNaLE1BQU07OzBCQUNqQixZQUFZOzs7O3NCQUNiLFFBQVE7Ozs7a0NBQ0wsNEJBQTRCOzs0Q0FDVixnQ0FBZ0M7OzhDQUM5QixrQ0FBa0M7O2dDQUNuRCxzQkFBc0I7O2tDQUN0Qix3QkFBd0I7Ozs7a0NBQzNCLDRCQUE0Qjs7a0NBQ2hDLDZCQUE2Qjs7SUFlckMsd0JBQXdCO1lBQXhCLHdCQUF3Qjs7QUFVeEIsV0FWQSx3QkFBd0IsQ0FVdkIsS0FBYSxFQUFFOzs7MEJBVmhCLHdCQUF3Qjs7QUFXakMsK0JBWFMsd0JBQXdCLDZDQVczQixLQUFLLEVBQUU7O0FBRWIsUUFBSSxDQUFDLE1BQU0sR0FBRyxnQ0FBYyxXQUFXLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsdUJBQWlCLEVBQUUsS0FBSztBQUN4Qix5QkFBbUIsRUFBRSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUM7QUFDekUsa0NBQTRCLEVBQUUsS0FBSztBQUNuQywyQkFBcUIsRUFBRSxFQUFFO0tBQzFCLENBQUM7O0FBRUYsUUFBSSxDQUFDLDRCQUE0QixHQUFHLEtBQUssQ0FBQztBQUMxQyxRQUFJLENBQUMsUUFBUSxHQUFHLGdDQUFnQixXQUFXLEVBQUUsQ0FBQzs7QUFFOUMsUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQztBQUM5QyxRQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQ2pFLFVBQUEsV0FBVyxFQUFJO0FBQ2IsVUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FB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QUFFLElBQUk7V0FDdkMsQ0FBQyxBQUFDO1VBQ0Q7T0FDSyxDQUNUO0tBQ0g7OztTQTdCRyxzQkFBc0I7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkZpbGVUcmVlVG9vbGJhckNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3QsIFJlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2FkZFRvb2x0aXB9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7V29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Xb3JraW5nU2V0U2VsZWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7V29ya2luZ1NldE5hbWVBbmRTYXZlQ29tcG9uZW50fSBmcm9tICcuL1dvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudCc7XG5pbXBvcnQge0ZpbGVUcmVlU3RvcmV9IGZyb20gJy4uL2xpYi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCBGaWxlVHJlZUFjdGlvbnMgZnJvbSAnLi4vbGliL0ZpbGVUcmVlQWN0aW9ucyc7XG5pbXBvcnQge1dvcmtpbmdTZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzJztcbmltcG9ydCB7QnV0dG9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b24nO1xuXG5pbXBvcnQgdHlwZSB7V29ya2luZ1NldHNTdG9yZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS13b3JraW5nLXNldHMnO1xuXG50eXBlIFByb3BzID0ge1xuICB3b3JraW5nU2V0c1N0b3JlOiBXb3JraW5nU2V0c1N0b3JlO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VsZWN0aW9uSXNBY3RpdmU6IGJvb2xlYW47XG4gIGRlZmluaXRpb25zQXJlRW1wdHk6IGJvb2xlYW47XG4gIGlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXQ6IGJvb2xlYW47XG4gIHVwZGF0ZWRXb3JraW5nU2V0TmFtZTogc3RyaW5nO1xufTtcblxuZXhwb3J0IGNsYXNzIEZpbGVUcmVlVG9vbGJhckNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfaW5Qcm9jZXNzT2ZDbG9zaW5nU2VsZWN0aW9uOiBib29sZWFuO1xuICBfcHJldk5hbWU6IHN0cmluZztcbiAgX2FjdGlvbnM6IEZpbGVUcmVlQWN0aW9ucztcbiAgX2Nsb3NlV29ya2luZ1NldHNTZWxlY3RvcjogPygpID0+IHZvaWQ7XG4gIHN0YXRlOiBTdGF0ZTtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2VsZWN0aW9uSXNBY3RpdmU6IGZhbHNlLFxuICAgICAgZGVmaW5pdGlvbnNBcmVFbXB0eTogcHJvcHMud29ya2luZ1NldHNTdG9yZS5nZXREZWZpbml0aW9ucygpLmxlbmd0aCA9PT0gMCxcbiAgICAgIGlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXQ6IGZhbHNlLFxuICAgICAgdXBkYXRlZFdvcmtpbmdTZXROYW1lOiAnJyxcbiAgICB9O1xuXG4gICAgdGhpcy5faW5Qcm9jZXNzT2ZDbG9zaW5nU2VsZWN0aW9uID0gZmFsc2U7XG4gICAgdGhpcy5fYWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZSgpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChwcm9wcy53b3JraW5nU2V0c1N0b3JlLnN1YnNjcmliZVRvRGVmaW5pdGlvbnMoXG4gICAgICBkZWZpbml0aW9ucyA9PiB7XG4gICAgICAgIGNvbnN0IGVtcHR5ID0gZGVmaW5pdGlvbnMuYXBwbGljYWJsZS5sZW5ndGggKyBkZWZpbml0aW9ucy5ub3RBcHBsaWNhYmxlLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGVmaW5pdGlvbnNBcmVFbXB0eTogZW1wdHl9KTtcbiAgICAgIH1cbiAgICApKTtcblxuICAgICh0aGlzOiBhbnkpLl90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yID0gdGhpcy5fdG9nZ2xlV29ya2luZ1NldHNTZWxlY3Rvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9jaGVja0lmQ2xvc2luZ1NlbGVjdG9yID0gdGhpcy5fY2hlY2tJZkNsb3NpbmdTZWxlY3Rvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9lZGl0V29ya2luZ1NldCA9IHRoaXMuX2VkaXRXb3JraW5nU2V0LmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3NhdmVXb3JraW5nU2V0ID0gdGhpcy5fc2F2ZVdvcmtpbmdTZXQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdXBkYXRlV29ya2luZ1NldCA9IHRoaXMuX3VwZGF0ZVdvcmtpbmdTZXQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdG9nZ2xlV29ya2luZ1NldEVkaXRNb2RlID0gdGhpcy5fdG9nZ2xlV29ya2luZ1NldEVkaXRNb2RlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgLy8gVGhpcyBjb21tYW5kIGlzIGV4cG9zZWQgaW4gdGhlIG51Y2xpZGUtd29ya2luZy1zZXRzIG1lbnUgY29uZmlnLlxuICAgICAgJ3dvcmtpbmctc2V0czpzZWxlY3QtYWN0aXZlJywgLy8gZXNsaW50LWRpc2FibGUtbGluZSBudWNsaWRlLWludGVybmFsL2NvbW1hbmQtbWVudS1pdGVtc1xuICAgICAgdGhpcy5fdG9nZ2xlV29ya2luZ1NldHNTZWxlY3RvcixcbiAgICApKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzLCBwcmV2U3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gICAgaWYgKCFwcmV2U3RhdGUuc2VsZWN0aW9uSXNBY3RpdmUgJiYgdGhpcy5zdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZSkge1xuICAgICAgdGhpcy5fY2xvc2VXb3JraW5nU2V0c1NlbGVjdG9yID0gdGhpcy5fcmVuZGVyV29ya2luZ1NldFNlbGVjdGlvblBhbmVsKCk7XG4gICAgfSBlbHNlIGlmIChwcmV2U3RhdGUuc2VsZWN0aW9uSXNBY3RpdmUgJiYgIXRoaXMuc3RhdGUuc2VsZWN0aW9uSXNBY3RpdmUpIHtcbiAgICAgIGludmFyaWFudCh0aGlzLl9jbG9zZVdvcmtpbmdTZXRzU2VsZWN0b3IpO1xuICAgICAgdGhpcy5fY2xvc2VXb3JraW5nU2V0c1NlbGVjdG9yKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IHdvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5nZXRXb3JraW5nU2V0KCk7XG4gICAgY29uc3QgZWRpdGVkV29ya2luZ1NldElzRW1wdHkgPSB0aGlzLl9zdG9yZS5pc0VkaXRlZFdvcmtpbmdTZXRFbXB0eSgpO1xuICAgIGNvbnN0IGlzRWRpdGluZ1dvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCk7XG5cbiAgICBsZXQgc2VsZWN0V29ya2luZ1NldEJ1dHRvbjtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZGVmaW5pdGlvbnNBcmVFbXB0eSAmJiAhaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgc2VsZWN0V29ya2luZ1NldEJ1dHRvbiA9IChcbiAgICAgICAgPFNlbGVjdFdvcmtpbmdTZXRCdXR0b25cbiAgICAgICAgICBoaWdobGlnaHQ9eyF3b3JraW5nU2V0LmlzRW1wdHkoKX1cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMuX2NoZWNrSWZDbG9zaW5nU2VsZWN0b3J9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCB3b3JraW5nU2V0TmFtZUFuZFNhdmU7XG4gICAgaWYgKGlzRWRpdGluZ1dvcmtpbmdTZXQgJiYgIWVkaXRlZFdvcmtpbmdTZXRJc0VtcHR5KSB7XG4gICAgICB3b3JraW5nU2V0TmFtZUFuZFNhdmUgPSAoXG4gICAgICAgIDxXb3JraW5nU2V0TmFtZUFuZFNhdmVDb21wb25lbnRcbiAgICAgICAgICBpc0VkaXRpbmc9e3RoaXMuc3RhdGUuaXNVcGRhdGluZ0V4aXN0aW5nV29ya2luZ1NldH1cbiAgICAgICAgICBpbml0aWFsTmFtZT17dGhpcy5zdGF0ZS51cGRhdGVkV29ya2luZ1NldE5hbWV9XG4gICAgICAgICAgb25VcGRhdGU9e3RoaXMuX3VwZGF0ZVdvcmtpbmdTZXR9XG4gICAgICAgICAgb25TYXZlPXt0aGlzLl9zYXZlV29ya2luZ1NldH1cbiAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fdG9nZ2xlV29ya2luZ1NldEVkaXRNb2RlfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoe1xuICAgICAgICAgICdudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyJzogdHJ1ZSxcbiAgICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhci1mYWRlcic6XG4gICAgICAgICAgICB3b3JraW5nU2V0LmlzRW1wdHkoKSAmJlxuICAgICAgICAgICAgIXRoaXMuc3RhdGUuc2VsZWN0aW9uSXNBY3RpdmUgJiZcbiAgICAgICAgICAgICF0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCksXG4gICAgICAgIH0pfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXAgcHVsbC1yaWdodFwiPlxuICAgICAgICAgIHtzZWxlY3RXb3JraW5nU2V0QnV0dG9ufVxuICAgICAgICAgIDxEZWZpbmVXb3JraW5nU2V0QnV0dG9uXG4gICAgICAgICAgICBpc0FjdGl2ZT17aXNFZGl0aW5nV29ya2luZ1NldH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX3RvZ2dsZVdvcmtpbmdTZXRFZGl0TW9kZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiIC8+XG4gICAgICAgIHt3b3JraW5nU2V0TmFtZUFuZFNhdmV9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX3RvZ2dsZVdvcmtpbmdTZXRzU2VsZWN0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2luUHJvY2Vzc09mQ2xvc2luZ1NlbGVjdGlvbikge1xuICAgICAgdGhpcy5faW5Qcm9jZXNzT2ZDbG9zaW5nU2VsZWN0aW9uID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0aW9uSXNBY3RpdmU6ICF0aGlzLnN0YXRlLnNlbGVjdGlvbklzQWN0aXZlfSk7XG4gIH1cblxuICBfcmVuZGVyV29ya2luZ1NldFNlbGVjdGlvblBhbmVsKCk6ICgpID0+IHZvaWQge1xuICAgIGNvbnN0IHJlYWN0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtpdGVtOiByZWFjdERpdn0pO1xuXG4gICAgbGV0IGNsb3NlZCA9IGZhbHNlO1xuICAgIGNvbnN0IG9uQ2xvc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoY2xvc2VkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNsb3NlZCA9IHRydWU7XG5cbiAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUocmVhY3REaXYpO1xuICAgICAgcGFuZWwuZGVzdHJveSgpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0aW9uSXNBY3RpdmU6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIFJlYWN0RE9NLnJlbmRlcigoXG4gICAgICA8V29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudFxuICAgICAgICB3b3JraW5nU2V0c1N0b3JlPXt0aGlzLnByb3BzLndvcmtpbmdTZXRzU3RvcmV9XG4gICAgICAgIG9uQ2xvc2U9e29uQ2xvc2V9XG4gICAgICAgIG9uRWRpdFdvcmtpbmdTZXQ9e3RoaXMuX2VkaXRXb3JraW5nU2V0fVxuICAgICAgLz5cbiAgICApLCByZWFjdERpdik7XG5cbiAgICByZXR1cm4gb25DbG9zZTtcbiAgfVxuXG4gIF90b2dnbGVXb3JraW5nU2V0RWRpdE1vZGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRWRpdGluZ1dvcmtpbmdTZXQoKSkge1xuICAgICAgdGhpcy5fZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc3RhcnRFZGl0aW5nV29ya2luZ1NldChuZXcgV29ya2luZ1NldCgpKTtcbiAgICB9XG4gIH1cblxuICBfc2F2ZVdvcmtpbmdTZXQobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgd29ya2luZ1NldHNTdG9yZSA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXRzU3RvcmUoKTtcbiAgICBpbnZhcmlhbnQod29ya2luZ1NldHNTdG9yZSk7XG5cbiAgICBjb25zdCBlZGl0ZWRXb3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0RWRpdGVkV29ya2luZ1NldCgpO1xuICAgIHRoaXMuX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk7XG4gICAgd29ya2luZ1NldHNTdG9yZS5zYXZlV29ya2luZ1NldChuYW1lLCBlZGl0ZWRXb3JraW5nU2V0KTtcbiAgICB3b3JraW5nU2V0c1N0b3JlLmFjdGl2YXRlKG5hbWUpO1xuICB9XG5cbiAgX3VwZGF0ZVdvcmtpbmdTZXQocHJldk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgd29ya2luZ1NldHNTdG9yZSA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXRzU3RvcmUoKTtcbiAgICBpbnZhcmlhbnQod29ya2luZ1NldHNTdG9yZSk7XG4gICAgY29uc3QgZWRpdGVkV29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmdldEVkaXRlZFdvcmtpbmdTZXQoKTtcbiAgICB0aGlzLl9maW5pc2hFZGl0aW5nV29ya2luZ1NldCgpO1xuXG4gICAgd29ya2luZ1NldHNTdG9yZS51cGRhdGUocHJldk5hbWUsIG5hbWUsIGVkaXRlZFdvcmtpbmdTZXQpO1xuICB9XG5cbiAgX2NoZWNrSWZDbG9zaW5nU2VsZWN0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0aW9uSXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuX2luUHJvY2Vzc09mQ2xvc2luZ1NlbGVjdGlvbiA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgX2VkaXRXb3JraW5nU2V0KG5hbWU6IHN0cmluZywgdXJpczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX3ByZXZOYW1lID0gbmFtZTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXQ6IHRydWUsXG4gICAgICB1cGRhdGVkV29ya2luZ1NldE5hbWU6IG5hbWUsXG4gICAgICBzZWxlY3Rpb25Jc0FjdGl2ZTogZmFsc2UsXG4gICAgfSk7XG4gICAgdGhpcy5fc3RhcnRFZGl0aW5nV29ya2luZ1NldChuZXcgV29ya2luZ1NldCh1cmlzKSk7XG4gIH1cblxuICBfc3RhcnRFZGl0aW5nV29ya2luZ1NldCh3b3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zdGFydEVkaXRpbmdXb3JraW5nU2V0KHdvcmtpbmdTZXQpO1xuICB9XG5cbiAgX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNVcGRhdGluZ0V4aXN0aW5nV29ya2luZ1NldDogZmFsc2UsXG4gICAgICB1cGRhdGVkV29ya2luZ1NldE5hbWU6ICcnLFxuICAgIH0pO1xuICAgIHRoaXMuX2FjdGlvbnMuZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcbiAgfVxufVxuXG5jbGFzcyBTZWxlY3RXb3JraW5nU2V0QnV0dG9uIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IHtcbiAgICBoaWdobGlnaHQ6IGJvb2xlYW47XG4gICAgb25DbGljazogKCkgPT4gdm9pZDtcbiAgICBvbkZvY3VzOiAoKSA9PiB2b2lkO1xuICB9O1xuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCB7XG4gICAgICBoaWdobGlnaHQsXG4gICAgICBvbkNsaWNrLFxuICAgICAgb25Gb2N1cyxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gKFxuICAgICAgPEJ1dHRvblxuICAgICAgICBzZWxlY3RlZD17aGlnaGxpZ2h0fVxuICAgICAgICByZWY9e2FkZFRvb2x0aXAoe1xuICAgICAgICAgIHRpdGxlOiAnU2VsZWN0IFdvcmtpbmcgU2V0cycsXG4gICAgICAgICAgZGVsYXk6IDUwMCxcbiAgICAgICAgICBwbGFjZW1lbnQ6ICdib3R0b20nLFxuICAgICAgICAgIGtleUJpbmRpbmdDb21tYW5kOiAnd29ya2luZy1zZXRzOnNlbGVjdC1hY3RpdmUnLFxuICAgICAgICB9KX1cbiAgICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgICAgb25Gb2N1cz17b25Gb2N1c30+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1saXN0LXVub3JkZXJlZCBudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWljb25cIiAvPlxuICAgICAgPC9CdXR0b24+XG4gICAgKTtcbiAgfVxufVxuXG5jbGFzcyBEZWZpbmVXb3JraW5nU2V0QnV0dG9uIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IHtcbiAgICBpc0FjdGl2ZTogYm9vbGVhbjtcbiAgICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xuICB9O1xuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCB7XG4gICAgICBpc0FjdGl2ZSxcbiAgICAgIG9uQ2xpY2ssXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCdXR0b25cbiAgICAgICAgc2VsZWN0ZWQ9e2lzQWN0aXZlfVxuICAgICAgICByZWY9e2FkZFRvb2x0aXAoe1xuICAgICAgICAgIHRpdGxlOiBpc0FjdGl2ZSA/ICdDYW5jZWwnIDogJ0RlZmluZSBhIFdvcmtpbmcgU2V0JyxcbiAgICAgICAgICBkZWxheTogNTAwLFxuICAgICAgICAgIHBsYWNlbWVudDogJ2JvdHRvbScsXG4gICAgICAgIH0pfVxuICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICBpY29uOiB0cnVlLFxuICAgICAgICAgICdpY29uLXBsdXMnOiAhaXNBY3RpdmUsXG4gICAgICAgICAgJ2ljb24tZGFzaCc6IGlzQWN0aXZlLFxuICAgICAgICAgICdudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWljb24nOiB0cnVlLFxuICAgICAgICB9KX1cbiAgICAgICAgLz5cbiAgICAgIDwvQnV0dG9uPlxuICAgICk7XG4gIH1cbn1cbiJdfQ==