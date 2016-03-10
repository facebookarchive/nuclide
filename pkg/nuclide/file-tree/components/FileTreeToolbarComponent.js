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

/*eslint-disable react/prop-types */

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atomHelpers = require('../../atom-helpers');

var _WorkingSetSelectionComponent = require('./WorkingSetSelectionComponent');

var _WorkingSetNameAndSaveComponent = require('./WorkingSetNameAndSaveComponent');

var _libFileTreeStore = require('../lib/FileTreeStore');

var _libFileTreeStore2 = _interopRequireDefault(_libFileTreeStore);

var _libFileTreeActions = require('../lib/FileTreeActions');

var _libFileTreeActions2 = _interopRequireDefault(_libFileTreeActions);

var _workingSets = require('../../working-sets');

var FileTreeToolbarComponent = (function (_React$Component) {
  _inherits(FileTreeToolbarComponent, _React$Component);

  function FileTreeToolbarComponent(props) {
    var _this = this;

    _classCallCheck(this, FileTreeToolbarComponent);

    _get(Object.getPrototypeOf(FileTreeToolbarComponent.prototype), 'constructor', this).call(this, props);

    this._store = _libFileTreeStore2['default'].getInstance();
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
      return _this.setState({ definitionsAreEmpty: definitions.length === 0 });
    }));

    this._toggleWorkingSetsSelector = this._toggleWorkingSetsSelector.bind(this);
    this._closeWorkingSetsSelector = this._closeWorkingSetsSelector.bind(this);
    this._checkIfClosingSelector = this._checkIfClosingSelector.bind(this);
    this._editWorkingSet = this._editWorkingSet.bind(this);
    this._saveWorkingSet = this._saveWorkingSet.bind(this);
    this._updateWorkingSet = this._updateWorkingSet.bind(this);
    this._toggleWorkingSetEditMode = this._toggleWorkingSetEditMode.bind(this);
  }

  _createClass(FileTreeToolbarComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._disposables.add(atom.commands.add('atom-workspace', 'working-sets:select-active', this._toggleWorkingSetsSelector));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      var workingSet = this._store.getWorkingSet();
      var editedWorkingSet = this._store.getEditedWorkingSet();
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
      if (!editedWorkingSet.isEmpty()) {
        workingSetNameAndSave = _reactForAtom.React.createElement(_WorkingSetNameAndSaveComponent.WorkingSetNameAndSaveComponent, {
          isEditing: this.state.isUpdatingExistingWorkingSet,
          initialName: this.state.updatedWorkingSetName,
          onUpdate: this._updateWorkingSet,
          onSave: this._saveWorkingSet,
          onCancel: this._toggleWorkingSetEditMode
        });
      }

      var workingSetSelectionPanel = undefined;
      if (this.state.selectionIsActive) {
        workingSetSelectionPanel = _reactForAtom.React.createElement(_WorkingSetSelectionComponent.WorkingSetSelectionComponent, {
          workingSetsStore: this.props.workingSetsStore,
          onClose: this._closeWorkingSetsSelector,
          onEditWorkingSet: this._editWorkingSet
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
        workingSetNameAndSave,
        workingSetSelectionPanel
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
    key: '_closeWorkingSetsSelector',
    value: function _closeWorkingSetsSelector() {
      this.setState({ selectionIsActive: false });
    }
  }, {
    key: '_toggleWorkingSetEditMode',
    value: function _toggleWorkingSetEditMode() {
      if (this._store.isEditingWorkingSet()) {
        this._finishEditingWorkingSet();
      } else {
        this._startEditingWorkingSet(new _workingSets.WorkingSet());
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
      this._startEditingWorkingSet(new _workingSets.WorkingSet(uris));
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
      return _reactForAtom.React.createElement(
        'button',
        {
          className: (0, _classnames2['default'])({
            btn: true,
            selected: this.props.highlight
          }),
          ref: (0, _atomHelpers.addTooltip)({
            title: 'Select Working Sets',
            delay: 500,
            placement: 'bottom',
            keyBindingCommand: 'working-sets:select-active'
          }),
          onClick: this.props.onClick,
          onFocus: this.props.onFocus },
        _reactForAtom.React.createElement('span', { className: 'icon icon-list-unordered' })
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
      return _reactForAtom.React.createElement(
        'button',
        {
          className: (0, _classnames2['default'])({
            btn: true,
            selected: this.props.isActive
          }),
          ref: (0, _atomHelpers.addTooltip)({
            title: this.props.isActive ? 'Cancel' : 'Define a Working Set',
            delay: 500,
            placement: 'bottom'
          }),
          onClick: this.props.onClick },
        _reactForAtom.React.createElement('span', { className: (0, _classnames2['default'])({
            icon: true,
            'icon-plus': !this.props.isActive,
            'icon-dash': this.props.isActive
          })
        })
      );
    }
  }]);

  return DefineWorkingSetButton;
})(_reactForAtom.React.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlVG9vbGJhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBYW9CLGdCQUFnQjs7b0JBQ0YsTUFBTTs7MEJBQ2pCLFlBQVk7Ozs7c0JBQ2IsUUFBUTs7OzsyQkFDTCxvQkFBb0I7OzRDQUNGLGdDQUFnQzs7OENBQzlCLGtDQUFrQzs7Z0NBQ3JELHNCQUFzQjs7OztrQ0FDcEIsd0JBQXdCOzs7OzJCQUMzQixvQkFBb0I7O0lBZWhDLHdCQUF3QjtZQUF4Qix3QkFBd0I7O0FBVXhCLFdBVkEsd0JBQXdCLENBVXZCLEtBQWEsRUFBRTs7OzBCQVZoQix3QkFBd0I7O0FBV2pDLCtCQVhTLHdCQUF3Qiw2Q0FXM0IsS0FBSyxFQUFFOztBQUViLFFBQUksQ0FBQyxNQUFNLEdBQUcsOEJBQWMsV0FBVyxFQUFFLENBQUM7QUFDMUMsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLHVCQUFpQixFQUFFLEtBQUs7QUFDeEIseUJBQW1CLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDO0FBQ3pFLGtDQUE0QixFQUFFLEtBQUs7QUFDbkMsMkJBQXFCLEVBQUUsRUFBRTtLQUMxQixDQUFDOztBQUVGLFFBQUksQ0FBQyw0QkFBNEIsR0FBRyxLQUFLLENBQUM7QUFDMUMsUUFBSSxDQUFDLFFBQVEsR0FBRyxnQ0FBZ0IsV0FBVyxFQUFFLENBQUM7O0FBRTlDLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7QUFDOUMsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUNqRSxVQUFBLFdBQVc7YUFBSSxNQUFLLFFBQVEsQ0FBQyxFQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFDLENBQUM7S0FBQSxDQUM5RSxDQUFDLENBQUM7O0FBRUgsQUFBQyxRQUFJ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RyxFQUFFLElBQUk7QUFDVCxvQkFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtXQUM5QixDQUFDLEFBQUM7QUFDSCxhQUFHLEVBQUUsNkJBQVc7QUFDZCxpQkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsR0FBRyxzQkFBc0I7QUFDOUQsaUJBQUssRUFBRSxHQUFHO0FBQ1YscUJBQVMsRUFBRSxRQUFRO1dBQ3BCLENBQUMsQUFBQztBQUNILGlCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7UUFDNUIsNENBQU0sU0FBUyxFQUFFLDZCQUFXO0FBQzFCLGdCQUFJLEVBQUUsSUFBSTtBQUNWLHVCQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7QUFDakMsdUJBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7V0FDakMsQ0FBQyxBQUFDO1VBQ0Q7T0FDSyxDQUNUO0tBQ0g7OztTQTNCRyxzQkFBc0I7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkZpbGVUcmVlVG9vbGJhckNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2FkZFRvb2x0aXB9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge1dvcmtpbmdTZXRTZWxlY3Rpb25Db21wb25lbnR9IGZyb20gJy4vV29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge1dvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudH0gZnJvbSAnLi9Xb3JraW5nU2V0TmFtZUFuZFNhdmVDb21wb25lbnQnO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi4vbGliL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IEZpbGVUcmVlQWN0aW9ucyBmcm9tICcuLi9saWIvRmlsZVRyZWVBY3Rpb25zJztcbmltcG9ydCB7V29ya2luZ1NldH0gZnJvbSAnLi4vLi4vd29ya2luZy1zZXRzJztcblxuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9IGZyb20gJy4uLy4uL3dvcmtpbmctc2V0cyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHdvcmtpbmdTZXRzU3RvcmU6IFdvcmtpbmdTZXRzU3RvcmU7XG59O1xuXG50eXBlIFN0YXRlID0ge1xuICBzZWxlY3Rpb25Jc0FjdGl2ZTogYm9vbGVhbjtcbiAgZGVmaW5pdGlvbnNBcmVFbXB0eTogYm9vbGVhbjtcbiAgaXNVcGRhdGluZ0V4aXN0aW5nV29ya2luZ1NldDogYm9vbGVhbjtcbiAgdXBkYXRlZFdvcmtpbmdTZXROYW1lOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgY2xhc3MgRmlsZVRyZWVUb29sYmFyQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pblByb2Nlc3NPZkNsb3NpbmdTZWxlY3Rpb246IGJvb2xlYW47XG4gIF9wcmV2TmFtZTogc3RyaW5nO1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9hY3Rpb25zOiBGaWxlVHJlZUFjdGlvbnM7XG4gIHN0YXRlOiBTdGF0ZTtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2VsZWN0aW9uSXNBY3RpdmU6IGZhbHNlLFxuICAgICAgZGVmaW5pdGlvbnNBcmVFbXB0eTogcHJvcHMud29ya2luZ1NldHNTdG9yZS5nZXREZWZpbml0aW9ucygpLmxlbmd0aCA9PT0gMCxcbiAgICAgIGlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXQ6IGZhbHNlLFxuICAgICAgdXBkYXRlZFdvcmtpbmdTZXROYW1lOiAnJyxcbiAgICB9O1xuXG4gICAgdGhpcy5faW5Qcm9jZXNzT2ZDbG9zaW5nU2VsZWN0aW9uID0gZmFsc2U7XG4gICAgdGhpcy5fYWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZSgpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChwcm9wcy53b3JraW5nU2V0c1N0b3JlLnN1YnNjcmliZVRvRGVmaW5pdGlvbnMoXG4gICAgICBkZWZpbml0aW9ucyA9PiB0aGlzLnNldFN0YXRlKHtkZWZpbml0aW9uc0FyZUVtcHR5OiBkZWZpbml0aW9ucy5sZW5ndGggPT09IDB9KVxuICAgICkpO1xuXG4gICAgKHRoaXM6IGFueSkuX3RvZ2dsZVdvcmtpbmdTZXRzU2VsZWN0b3IgPSB0aGlzLl90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2Nsb3NlV29ya2luZ1NldHNTZWxlY3RvciA9IHRoaXMuX2Nsb3NlV29ya2luZ1NldHNTZWxlY3Rvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9jaGVja0lmQ2xvc2luZ1NlbGVjdG9yID0gdGhpcy5fY2hlY2tJZkNsb3NpbmdTZWxlY3Rvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9lZGl0V29ya2luZ1NldCA9IHRoaXMuX2VkaXRXb3JraW5nU2V0LmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3NhdmVXb3JraW5nU2V0ID0gdGhpcy5fc2F2ZVdvcmtpbmdTZXQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdXBkYXRlV29ya2luZ1NldCA9IHRoaXMuX3VwZGF0ZVdvcmtpbmdTZXQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdG9nZ2xlV29ya2luZ1NldEVkaXRNb2RlID0gdGhpcy5fdG9nZ2xlV29ya2luZ1NldEVkaXRNb2RlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3dvcmtpbmctc2V0czpzZWxlY3QtYWN0aXZlJyxcbiAgICAgIHRoaXMuX3RvZ2dsZVdvcmtpbmdTZXRzU2VsZWN0b3IsXG4gICAgKSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3Qgd29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXQoKTtcbiAgICBjb25zdCBlZGl0ZWRXb3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0RWRpdGVkV29ya2luZ1NldCgpO1xuICAgIGNvbnN0IGlzRWRpdGluZ1dvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCk7XG5cbiAgICBsZXQgc2VsZWN0V29ya2luZ1NldEJ1dHRvbjtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZGVmaW5pdGlvbnNBcmVFbXB0eSAmJiAhaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgc2VsZWN0V29ya2luZ1NldEJ1dHRvbiA9IChcbiAgICAgICAgPFNlbGVjdFdvcmtpbmdTZXRCdXR0b25cbiAgICAgICAgICBoaWdobGlnaHQ9eyF3b3JraW5nU2V0LmlzRW1wdHkoKX1cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMuX2NoZWNrSWZDbG9zaW5nU2VsZWN0b3J9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCB3b3JraW5nU2V0TmFtZUFuZFNhdmU7XG4gICAgaWYgKCFlZGl0ZWRXb3JraW5nU2V0LmlzRW1wdHkoKSkge1xuICAgICAgd29ya2luZ1NldE5hbWVBbmRTYXZlID0gKFxuICAgICAgICA8V29ya2luZ1NldE5hbWVBbmRTYXZlQ29tcG9uZW50XG4gICAgICAgICAgaXNFZGl0aW5nPXt0aGlzLnN0YXRlLmlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXR9XG4gICAgICAgICAgaW5pdGlhbE5hbWU9e3RoaXMuc3RhdGUudXBkYXRlZFdvcmtpbmdTZXROYW1lfVxuICAgICAgICAgIG9uVXBkYXRlPXt0aGlzLl91cGRhdGVXb3JraW5nU2V0fVxuICAgICAgICAgIG9uU2F2ZT17dGhpcy5fc2F2ZVdvcmtpbmdTZXR9XG4gICAgICAgICAgb25DYW5jZWw9e3RoaXMuX3RvZ2dsZVdvcmtpbmdTZXRFZGl0TW9kZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHdvcmtpbmdTZXRTZWxlY3Rpb25QYW5lbDtcbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZSkge1xuICAgICAgd29ya2luZ1NldFNlbGVjdGlvblBhbmVsID0gKFxuICAgICAgICA8V29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudFxuICAgICAgICAgIHdvcmtpbmdTZXRzU3RvcmU9e3RoaXMucHJvcHMud29ya2luZ1NldHNTdG9yZX1cbiAgICAgICAgICBvbkNsb3NlPXt0aGlzLl9jbG9zZVdvcmtpbmdTZXRzU2VsZWN0b3J9XG4gICAgICAgICAgb25FZGl0V29ya2luZ1NldD17dGhpcy5fZWRpdFdvcmtpbmdTZXR9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoe1xuICAgICAgICAgICdudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyJzogdHJ1ZSxcbiAgICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhci1mYWRlcic6XG4gICAgICAgICAgICB3b3JraW5nU2V0LmlzRW1wdHkoKSAmJlxuICAgICAgICAgICAgIXRoaXMuc3RhdGUuc2VsZWN0aW9uSXNBY3RpdmUgJiZcbiAgICAgICAgICAgICF0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCksXG4gICAgICAgIH0pfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXAgcHVsbC1yaWdodFwiPlxuICAgICAgICAgIHtzZWxlY3RXb3JraW5nU2V0QnV0dG9ufVxuICAgICAgICAgIDxEZWZpbmVXb3JraW5nU2V0QnV0dG9uXG4gICAgICAgICAgICBpc0FjdGl2ZT17aXNFZGl0aW5nV29ya2luZ1NldH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX3RvZ2dsZVdvcmtpbmdTZXRFZGl0TW9kZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiIC8+XG4gICAgICAgIHt3b3JraW5nU2V0TmFtZUFuZFNhdmV9XG4gICAgICAgIHt3b3JraW5nU2V0U2VsZWN0aW9uUGFuZWx9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX3RvZ2dsZVdvcmtpbmdTZXRzU2VsZWN0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2luUHJvY2Vzc09mQ2xvc2luZ1NlbGVjdGlvbikge1xuICAgICAgdGhpcy5faW5Qcm9jZXNzT2ZDbG9zaW5nU2VsZWN0aW9uID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0aW9uSXNBY3RpdmU6ICF0aGlzLnN0YXRlLnNlbGVjdGlvbklzQWN0aXZlfSk7XG4gIH1cblxuICBfY2xvc2VXb3JraW5nU2V0c1NlbGVjdG9yKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbklzQWN0aXZlOiBmYWxzZX0pO1xuICB9XG5cbiAgX3RvZ2dsZVdvcmtpbmdTZXRFZGl0TW9kZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFZGl0aW5nV29ya2luZ1NldCgpKSB7XG4gICAgICB0aGlzLl9maW5pc2hFZGl0aW5nV29ya2luZ1NldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zdGFydEVkaXRpbmdXb3JraW5nU2V0KG5ldyBXb3JraW5nU2V0KCkpO1xuICAgIH1cbiAgfVxuXG4gIF9zYXZlV29ya2luZ1NldChuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB3b3JraW5nU2V0c1N0b3JlID0gdGhpcy5fc3RvcmUuZ2V0V29ya2luZ1NldHNTdG9yZSgpO1xuICAgIGludmFyaWFudCh3b3JraW5nU2V0c1N0b3JlKTtcbiAgICBjb25zdCBlZGl0ZWRXb3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0RWRpdGVkV29ya2luZ1NldCgpO1xuICAgIHRoaXMuX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk7XG5cbiAgICB3b3JraW5nU2V0c1N0b3JlLnNhdmVXb3JraW5nU2V0KG5hbWUsIGVkaXRlZFdvcmtpbmdTZXQpO1xuICAgIHdvcmtpbmdTZXRzU3RvcmUuYWN0aXZhdGUobmFtZSk7XG4gIH1cblxuICBfdXBkYXRlV29ya2luZ1NldChwcmV2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB3b3JraW5nU2V0c1N0b3JlID0gdGhpcy5fc3RvcmUuZ2V0V29ya2luZ1NldHNTdG9yZSgpO1xuICAgIGludmFyaWFudCh3b3JraW5nU2V0c1N0b3JlKTtcbiAgICBjb25zdCBlZGl0ZWRXb3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0RWRpdGVkV29ya2luZ1NldCgpO1xuICAgIHRoaXMuX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk7XG5cbiAgICB3b3JraW5nU2V0c1N0b3JlLnVwZGF0ZShwcmV2TmFtZSwgbmFtZSwgZWRpdGVkV29ya2luZ1NldCk7XG4gIH1cblxuICBfY2hlY2tJZkNsb3NpbmdTZWxlY3RvcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZSkge1xuICAgICAgdGhpcy5faW5Qcm9jZXNzT2ZDbG9zaW5nU2VsZWN0aW9uID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBfZWRpdFdvcmtpbmdTZXQobmFtZTogc3RyaW5nLCB1cmlzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fcHJldk5hbWUgPSBuYW1lO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNVcGRhdGluZ0V4aXN0aW5nV29ya2luZ1NldDogdHJ1ZSxcbiAgICAgIHVwZGF0ZWRXb3JraW5nU2V0TmFtZTogbmFtZSxcbiAgICAgIHNlbGVjdGlvbklzQWN0aXZlOiBmYWxzZSxcbiAgICB9KTtcbiAgICB0aGlzLl9zdGFydEVkaXRpbmdXb3JraW5nU2V0KG5ldyBXb3JraW5nU2V0KHVyaXMpKTtcbiAgfVxuXG4gIF9zdGFydEVkaXRpbmdXb3JraW5nU2V0KHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnN0YXJ0RWRpdGluZ1dvcmtpbmdTZXQod29ya2luZ1NldCk7XG4gIH1cblxuICBfZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1VwZGF0aW5nRXhpc3RpbmdXb3JraW5nU2V0OiBmYWxzZSxcbiAgICAgIHVwZGF0ZWRXb3JraW5nU2V0TmFtZTogJycsXG4gICAgfSk7XG4gICAgdGhpcy5fYWN0aW9ucy5maW5pc2hFZGl0aW5nV29ya2luZ1NldCgpO1xuICB9XG59XG5cbmNsYXNzIFNlbGVjdFdvcmtpbmdTZXRCdXR0b24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczoge1xuICAgIGhpZ2hsaWdodDogYm9vbGVhbjtcbiAgICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xuICAgIG9uRm9jdXM6ICgpID0+IHZvaWQ7XG4gIH07XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgYnRuOiB0cnVlLFxuICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnByb3BzLmhpZ2hsaWdodCxcbiAgICAgICAgfSl9XG4gICAgICAgIHJlZj17YWRkVG9vbHRpcCh7XG4gICAgICAgICAgdGl0bGU6ICdTZWxlY3QgV29ya2luZyBTZXRzJyxcbiAgICAgICAgICBkZWxheTogNTAwLFxuICAgICAgICAgIHBsYWNlbWVudDogJ2JvdHRvbScsXG4gICAgICAgICAga2V5QmluZGluZ0NvbW1hbmQ6ICd3b3JraW5nLXNldHM6c2VsZWN0LWFjdGl2ZScsXG4gICAgICAgIH0pfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9XG4gICAgICAgIG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c30+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1saXN0LXVub3JkZXJlZFwiIC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICApO1xuICB9XG59XG5cbmNsYXNzIERlZmluZVdvcmtpbmdTZXRCdXR0b24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczoge1xuICAgIGlzQWN0aXZlOiBib29sZWFuO1xuICAgIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG4gIH07XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgYnRuOiB0cnVlLFxuICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnByb3BzLmlzQWN0aXZlLFxuICAgICAgICB9KX1cbiAgICAgICAgcmVmPXthZGRUb29sdGlwKHtcbiAgICAgICAgICB0aXRsZTogdGhpcy5wcm9wcy5pc0FjdGl2ZSA/ICdDYW5jZWwnIDogJ0RlZmluZSBhIFdvcmtpbmcgU2V0JyxcbiAgICAgICAgICBkZWxheTogNTAwLFxuICAgICAgICAgIHBsYWNlbWVudDogJ2JvdHRvbScsXG4gICAgICAgIH0pfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoe1xuICAgICAgICAgIGljb246IHRydWUsXG4gICAgICAgICAgJ2ljb24tcGx1cyc6ICF0aGlzLnByb3BzLmlzQWN0aXZlLFxuICAgICAgICAgICdpY29uLWRhc2gnOiB0aGlzLnByb3BzLmlzQWN0aXZlLFxuICAgICAgICB9KX1cbiAgICAgICAgLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICk7XG4gIH1cbn1cbiJdfQ==