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
            'icon-dash': this.props.isActive,
            'nuclide-file-tree-toolbar-icon': true
          })
        })
      );
    }
  }]);

  return DefineWorkingSetButton;
})(_reactForAtom.React.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlVG9vbGJhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBYThCLGdCQUFnQjs7b0JBQ1osTUFBTTs7MEJBQ2pCLFlBQVk7Ozs7c0JBQ2IsUUFBUTs7OzsyQkFDTCxvQkFBb0I7OzRDQUNGLGdDQUFnQzs7OENBQzlCLGtDQUFrQzs7Z0NBQ3JELHNCQUFzQjs7OztrQ0FDcEIsd0JBQXdCOzs7OzJCQUMzQixvQkFBb0I7O0lBZWhDLHdCQUF3QjtZQUF4Qix3QkFBd0I7O0FBV3hCLFdBWEEsd0JBQXdCLENBV3ZCLEtBQWEsRUFBRTs7OzBCQVhoQix3QkFBd0I7O0FBWWpDLCtCQVpTLHdCQUF3Qiw2Q0FZM0IsS0FBSyxFQUFFOztBQUViLFFBQUksQ0FBQyxNQUFNLEdBQUcsOEJBQWMsV0FBVyxFQUFFLENBQUM7QUFDMUMsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLHVCQUFpQixFQUFFLEtBQUs7QUFDeEIseUJBQW1CLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDO0FBQ3pFLGtDQUE0QixFQUFFLEtBQUs7QUFDbkMsMkJBQXFCLEVBQUUsRUFBRTtLQUMxQixDQUFDOztBQUVGLFFBQUksQ0FBQyw0QkFBNEIsR0FBRyxLQUFLLENBQUM7QUFDMUMsUUFBSSxDQUFDLFFBQVEsR0FBRyxnQ0FBZ0IsV0FBVyxFQUFFLENBQUM7O0FBRTlDLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7QUFDOUMsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUNqRSxVQUFBLFdBQVc7YUFBSSxNQUFLLFFBQVEsQ0FBQyxFQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFDLENBQUM7S0FBQSxDQUM5RSxDQUFDLENBQUM7O0FBRUgsQUFBQyxRQUFJ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QUMsS0FBSyxDQUFDLFFBQVE7QUFDaEMsNENBQWdDLEVBQUUsSUFBSTtXQUN2QyxDQUFDLEFBQUM7VUFDRDtPQUNLLENBQ1Q7S0FDSDs7O1NBNUJHLHNCQUFzQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiRmlsZVRyZWVUb29sYmFyQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyplc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbmltcG9ydCB7UmVhY3QsIFJlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2FkZFRvb2x0aXB9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge1dvcmtpbmdTZXRTZWxlY3Rpb25Db21wb25lbnR9IGZyb20gJy4vV29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge1dvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudH0gZnJvbSAnLi9Xb3JraW5nU2V0TmFtZUFuZFNhdmVDb21wb25lbnQnO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi4vbGliL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IEZpbGVUcmVlQWN0aW9ucyBmcm9tICcuLi9saWIvRmlsZVRyZWVBY3Rpb25zJztcbmltcG9ydCB7V29ya2luZ1NldH0gZnJvbSAnLi4vLi4vd29ya2luZy1zZXRzJztcblxuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9IGZyb20gJy4uLy4uL3dvcmtpbmctc2V0cyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHdvcmtpbmdTZXRzU3RvcmU6IFdvcmtpbmdTZXRzU3RvcmU7XG59O1xuXG50eXBlIFN0YXRlID0ge1xuICBzZWxlY3Rpb25Jc0FjdGl2ZTogYm9vbGVhbjtcbiAgZGVmaW5pdGlvbnNBcmVFbXB0eTogYm9vbGVhbjtcbiAgaXNVcGRhdGluZ0V4aXN0aW5nV29ya2luZ1NldDogYm9vbGVhbjtcbiAgdXBkYXRlZFdvcmtpbmdTZXROYW1lOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgY2xhc3MgRmlsZVRyZWVUb29sYmFyQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pblByb2Nlc3NPZkNsb3NpbmdTZWxlY3Rpb246IGJvb2xlYW47XG4gIF9wcmV2TmFtZTogc3RyaW5nO1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9hY3Rpb25zOiBGaWxlVHJlZUFjdGlvbnM7XG4gIF9jbG9zZVdvcmtpbmdTZXRzU2VsZWN0b3I6ID8oKSA9PiB2b2lkO1xuICBzdGF0ZTogU3RhdGU7XG4gIHByb3BzOiBQcm9wcztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNlbGVjdGlvbklzQWN0aXZlOiBmYWxzZSxcbiAgICAgIGRlZmluaXRpb25zQXJlRW1wdHk6IHByb3BzLndvcmtpbmdTZXRzU3RvcmUuZ2V0RGVmaW5pdGlvbnMoKS5sZW5ndGggPT09IDAsXG4gICAgICBpc1VwZGF0aW5nRXhpc3RpbmdXb3JraW5nU2V0OiBmYWxzZSxcbiAgICAgIHVwZGF0ZWRXb3JraW5nU2V0TmFtZTogJycsXG4gICAgfTtcblxuICAgIHRoaXMuX2luUHJvY2Vzc09mQ2xvc2luZ1NlbGVjdGlvbiA9IGZhbHNlO1xuICAgIHRoaXMuX2FjdGlvbnMgPSBGaWxlVHJlZUFjdGlvbnMuZ2V0SW5zdGFuY2UoKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQocHJvcHMud29ya2luZ1NldHNTdG9yZS5zdWJzY3JpYmVUb0RlZmluaXRpb25zKFxuICAgICAgZGVmaW5pdGlvbnMgPT4gdGhpcy5zZXRTdGF0ZSh7ZGVmaW5pdGlvbnNBcmVFbXB0eTogZGVmaW5pdGlvbnMubGVuZ3RoID09PSAwfSlcbiAgICApKTtcblxuICAgICh0aGlzOiBhbnkpLl90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yID0gdGhpcy5fdG9nZ2xlV29ya2luZ1NldHNTZWxlY3Rvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9jaGVja0lmQ2xvc2luZ1NlbGVjdG9yID0gdGhpcy5fY2hlY2tJZkNsb3NpbmdTZWxlY3Rvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9lZGl0V29ya2luZ1NldCA9IHRoaXMuX2VkaXRXb3JraW5nU2V0LmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3NhdmVXb3JraW5nU2V0ID0gdGhpcy5fc2F2ZVdvcmtpbmdTZXQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdXBkYXRlV29ya2luZ1NldCA9IHRoaXMuX3VwZGF0ZVdvcmtpbmdTZXQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdG9nZ2xlV29ya2luZ1NldEVkaXRNb2RlID0gdGhpcy5fdG9nZ2xlV29ya2luZ1NldEVkaXRNb2RlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3dvcmtpbmctc2V0czpzZWxlY3QtYWN0aXZlJyxcbiAgICAgIHRoaXMuX3RvZ2dsZVdvcmtpbmdTZXRzU2VsZWN0b3IsXG4gICAgKSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBQcm9wcywgcHJldlN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICAgIGlmICghcHJldlN0YXRlLnNlbGVjdGlvbklzQWN0aXZlICYmIHRoaXMuc3RhdGUuc2VsZWN0aW9uSXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuX2Nsb3NlV29ya2luZ1NldHNTZWxlY3RvciA9IHRoaXMuX3JlbmRlcldvcmtpbmdTZXRTZWxlY3Rpb25QYW5lbCgpO1xuICAgIH0gZWxzZSBpZiAocHJldlN0YXRlLnNlbGVjdGlvbklzQWN0aXZlICYmICF0aGlzLnN0YXRlLnNlbGVjdGlvbklzQWN0aXZlKSB7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fY2xvc2VXb3JraW5nU2V0c1NlbGVjdG9yKTtcbiAgICAgIHRoaXMuX2Nsb3NlV29ya2luZ1NldHNTZWxlY3RvcigpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCB3b3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0V29ya2luZ1NldCgpO1xuICAgIGNvbnN0IGVkaXRlZFdvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5nZXRFZGl0ZWRXb3JraW5nU2V0KCk7XG4gICAgY29uc3QgaXNFZGl0aW5nV29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmlzRWRpdGluZ1dvcmtpbmdTZXQoKTtcblxuICAgIGxldCBzZWxlY3RXb3JraW5nU2V0QnV0dG9uO1xuICAgIGlmICghdGhpcy5zdGF0ZS5kZWZpbml0aW9uc0FyZUVtcHR5ICYmICFpc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICBzZWxlY3RXb3JraW5nU2V0QnV0dG9uID0gKFxuICAgICAgICA8U2VsZWN0V29ya2luZ1NldEJ1dHRvblxuICAgICAgICAgIGhpZ2hsaWdodD17IXdvcmtpbmdTZXQuaXNFbXB0eSgpfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX3RvZ2dsZVdvcmtpbmdTZXRzU2VsZWN0b3J9XG4gICAgICAgICAgb25Gb2N1cz17dGhpcy5fY2hlY2tJZkNsb3NpbmdTZWxlY3Rvcn1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHdvcmtpbmdTZXROYW1lQW5kU2F2ZTtcbiAgICBpZiAoIWVkaXRlZFdvcmtpbmdTZXQuaXNFbXB0eSgpKSB7XG4gICAgICB3b3JraW5nU2V0TmFtZUFuZFNhdmUgPSAoXG4gICAgICAgIDxXb3JraW5nU2V0TmFtZUFuZFNhdmVDb21wb25lbnRcbiAgICAgICAgICBpc0VkaXRpbmc9e3RoaXMuc3RhdGUuaXNVcGRhdGluZ0V4aXN0aW5nV29ya2luZ1NldH1cbiAgICAgICAgICBpbml0aWFsTmFtZT17dGhpcy5zdGF0ZS51cGRhdGVkV29ya2luZ1NldE5hbWV9XG4gICAgICAgICAgb25VcGRhdGU9e3RoaXMuX3VwZGF0ZVdvcmtpbmdTZXR9XG4gICAgICAgICAgb25TYXZlPXt0aGlzLl9zYXZlV29ya2luZ1NldH1cbiAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fdG9nZ2xlV29ya2luZ1NldEVkaXRNb2RlfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoe1xuICAgICAgICAgICdudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyJzogdHJ1ZSxcbiAgICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhci1mYWRlcic6XG4gICAgICAgICAgICB3b3JraW5nU2V0LmlzRW1wdHkoKSAmJlxuICAgICAgICAgICAgIXRoaXMuc3RhdGUuc2VsZWN0aW9uSXNBY3RpdmUgJiZcbiAgICAgICAgICAgICF0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCksXG4gICAgICAgIH0pfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXAgcHVsbC1yaWdodFwiPlxuICAgICAgICAgIHtzZWxlY3RXb3JraW5nU2V0QnV0dG9ufVxuICAgICAgICAgIDxEZWZpbmVXb3JraW5nU2V0QnV0dG9uXG4gICAgICAgICAgICBpc0FjdGl2ZT17aXNFZGl0aW5nV29ya2luZ1NldH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX3RvZ2dsZVdvcmtpbmdTZXRFZGl0TW9kZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiIC8+XG4gICAgICAgIHt3b3JraW5nU2V0TmFtZUFuZFNhdmV9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX3RvZ2dsZVdvcmtpbmdTZXRzU2VsZWN0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2luUHJvY2Vzc09mQ2xvc2luZ1NlbGVjdGlvbikge1xuICAgICAgdGhpcy5faW5Qcm9jZXNzT2ZDbG9zaW5nU2VsZWN0aW9uID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0aW9uSXNBY3RpdmU6ICF0aGlzLnN0YXRlLnNlbGVjdGlvbklzQWN0aXZlfSk7XG4gIH1cblxuICBfcmVuZGVyV29ya2luZ1NldFNlbGVjdGlvblBhbmVsKCk6ICgpID0+IHZvaWQge1xuICAgIGNvbnN0IHJlYWN0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtpdGVtOiByZWFjdERpdn0pO1xuXG4gICAgbGV0IGNsb3NlZCA9IGZhbHNlO1xuICAgIGNvbnN0IG9uQ2xvc2UgPSAoKSA9PiB7XG4gICAgICBpZiAoY2xvc2VkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNsb3NlZCA9IHRydWU7XG5cbiAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUocmVhY3REaXYpO1xuICAgICAgcGFuZWwuZGVzdHJveSgpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0aW9uSXNBY3RpdmU6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIFJlYWN0RE9NLnJlbmRlcigoXG4gICAgICA8V29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudFxuICAgICAgICB3b3JraW5nU2V0c1N0b3JlPXt0aGlzLnByb3BzLndvcmtpbmdTZXRzU3RvcmV9XG4gICAgICAgIG9uQ2xvc2U9e29uQ2xvc2V9XG4gICAgICAgIG9uRWRpdFdvcmtpbmdTZXQ9e3RoaXMuX2VkaXRXb3JraW5nU2V0fVxuICAgICAgLz5cbiAgICApLCByZWFjdERpdik7XG5cbiAgICByZXR1cm4gb25DbG9zZTtcbiAgfVxuXG4gIF90b2dnbGVXb3JraW5nU2V0RWRpdE1vZGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRWRpdGluZ1dvcmtpbmdTZXQoKSkge1xuICAgICAgdGhpcy5fZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc3RhcnRFZGl0aW5nV29ya2luZ1NldChuZXcgV29ya2luZ1NldCgpKTtcbiAgICB9XG4gIH1cblxuICBfc2F2ZVdvcmtpbmdTZXQobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgd29ya2luZ1NldHNTdG9yZSA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXRzU3RvcmUoKTtcbiAgICBpbnZhcmlhbnQod29ya2luZ1NldHNTdG9yZSk7XG4gICAgY29uc3QgZWRpdGVkV29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmdldEVkaXRlZFdvcmtpbmdTZXQoKTtcbiAgICB0aGlzLl9maW5pc2hFZGl0aW5nV29ya2luZ1NldCgpO1xuXG4gICAgd29ya2luZ1NldHNTdG9yZS5zYXZlV29ya2luZ1NldChuYW1lLCBlZGl0ZWRXb3JraW5nU2V0KTtcbiAgICB3b3JraW5nU2V0c1N0b3JlLmFjdGl2YXRlKG5hbWUpO1xuICB9XG5cbiAgX3VwZGF0ZVdvcmtpbmdTZXQocHJldk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgd29ya2luZ1NldHNTdG9yZSA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXRzU3RvcmUoKTtcbiAgICBpbnZhcmlhbnQod29ya2luZ1NldHNTdG9yZSk7XG4gICAgY29uc3QgZWRpdGVkV29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmdldEVkaXRlZFdvcmtpbmdTZXQoKTtcbiAgICB0aGlzLl9maW5pc2hFZGl0aW5nV29ya2luZ1NldCgpO1xuXG4gICAgd29ya2luZ1NldHNTdG9yZS51cGRhdGUocHJldk5hbWUsIG5hbWUsIGVkaXRlZFdvcmtpbmdTZXQpO1xuICB9XG5cbiAgX2NoZWNrSWZDbG9zaW5nU2VsZWN0b3IoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0aW9uSXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuX2luUHJvY2Vzc09mQ2xvc2luZ1NlbGVjdGlvbiA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgX2VkaXRXb3JraW5nU2V0KG5hbWU6IHN0cmluZywgdXJpczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX3ByZXZOYW1lID0gbmFtZTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXQ6IHRydWUsXG4gICAgICB1cGRhdGVkV29ya2luZ1NldE5hbWU6IG5hbWUsXG4gICAgICBzZWxlY3Rpb25Jc0FjdGl2ZTogZmFsc2UsXG4gICAgfSk7XG4gICAgdGhpcy5fc3RhcnRFZGl0aW5nV29ya2luZ1NldChuZXcgV29ya2luZ1NldCh1cmlzKSk7XG4gIH1cblxuICBfc3RhcnRFZGl0aW5nV29ya2luZ1NldCh3b3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zdGFydEVkaXRpbmdXb3JraW5nU2V0KHdvcmtpbmdTZXQpO1xuICB9XG5cbiAgX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNVcGRhdGluZ0V4aXN0aW5nV29ya2luZ1NldDogZmFsc2UsXG4gICAgICB1cGRhdGVkV29ya2luZ1NldE5hbWU6ICcnLFxuICAgIH0pO1xuICAgIHRoaXMuX2FjdGlvbnMuZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcbiAgfVxufVxuXG5jbGFzcyBTZWxlY3RXb3JraW5nU2V0QnV0dG9uIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IHtcbiAgICBoaWdobGlnaHQ6IGJvb2xlYW47XG4gICAgb25DbGljazogKCkgPT4gdm9pZDtcbiAgICBvbkZvY3VzOiAoKSA9PiB2b2lkO1xuICB9O1xuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGJ1dHRvblxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoe1xuICAgICAgICAgIGJ0bjogdHJ1ZSxcbiAgICAgICAgICBzZWxlY3RlZDogdGhpcy5wcm9wcy5oaWdobGlnaHQsXG4gICAgICAgIH0pfVxuICAgICAgICByZWY9e2FkZFRvb2x0aXAoe1xuICAgICAgICAgIHRpdGxlOiAnU2VsZWN0IFdvcmtpbmcgU2V0cycsXG4gICAgICAgICAgZGVsYXk6IDUwMCxcbiAgICAgICAgICBwbGFjZW1lbnQ6ICdib3R0b20nLFxuICAgICAgICAgIGtleUJpbmRpbmdDb21tYW5kOiAnd29ya2luZy1zZXRzOnNlbGVjdC1hY3RpdmUnLFxuICAgICAgICB9KX1cbiAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrfVxuICAgICAgICBvbkZvY3VzPXt0aGlzLnByb3BzLm9uRm9jdXN9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tbGlzdC11bm9yZGVyZWQgbnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhci1pY29uXCIgLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICk7XG4gIH1cbn1cblxuY2xhc3MgRGVmaW5lV29ya2luZ1NldEJ1dHRvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiB7XG4gICAgaXNBY3RpdmU6IGJvb2xlYW47XG4gICAgb25DbGljazogKCkgPT4gdm9pZDtcbiAgfTtcblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxidXR0b25cbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICBidG46IHRydWUsXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMucHJvcHMuaXNBY3RpdmUsXG4gICAgICAgIH0pfVxuICAgICAgICByZWY9e2FkZFRvb2x0aXAoe1xuICAgICAgICAgIHRpdGxlOiB0aGlzLnByb3BzLmlzQWN0aXZlID8gJ0NhbmNlbCcgOiAnRGVmaW5lIGEgV29ya2luZyBTZXQnLFxuICAgICAgICAgIGRlbGF5OiA1MDAsXG4gICAgICAgICAgcGxhY2VtZW50OiAnYm90dG9tJyxcbiAgICAgICAgfSl9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja30+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgaWNvbjogdHJ1ZSxcbiAgICAgICAgICAnaWNvbi1wbHVzJzogIXRoaXMucHJvcHMuaXNBY3RpdmUsXG4gICAgICAgICAgJ2ljb24tZGFzaCc6IHRoaXMucHJvcHMuaXNBY3RpdmUsXG4gICAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXRvb2xiYXItaWNvbic6IHRydWUsXG4gICAgICAgIH0pfVxuICAgICAgICAvPlxuICAgICAgPC9idXR0b24+XG4gICAgKTtcbiAgfVxufVxuIl19