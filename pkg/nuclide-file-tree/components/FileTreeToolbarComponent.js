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

var _libFileTreeStore2 = _interopRequireDefault(_libFileTreeStore);

var _libFileTreeActions = require('../lib/FileTreeActions');

var _libFileTreeActions2 = _interopRequireDefault(_libFileTreeActions);

var _nuclideWorkingSets = require('../../nuclide-working-sets');

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
      return _reactForAtom.React.createElement(
        'button',
        {
          className: (0, _classnames2['default'])({
            btn: true,
            selected: this.props.highlight
          }),
          ref: (0, _nuclideAtomHelpers.addTooltip)({
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
          ref: (0, _nuclideAtomHelpers.addTooltip)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlVG9vbGJhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVc4QixnQkFBZ0I7O29CQUNaLE1BQU07OzBCQUNqQixZQUFZOzs7O3NCQUNiLFFBQVE7Ozs7a0NBQ0wsNEJBQTRCOzs0Q0FDVixnQ0FBZ0M7OzhDQUM5QixrQ0FBa0M7O2dDQUNyRCxzQkFBc0I7Ozs7a0NBQ3BCLHdCQUF3Qjs7OztrQ0FDM0IsNEJBQTRCOztJQWV4Qyx3QkFBd0I7WUFBeEIsd0JBQXdCOztBQVd4QixXQVhBLHdCQUF3QixDQVd2QixLQUFhLEVBQUU7OzswQkFYaEIsd0JBQXdCOztBQVlqQywrQkFaUyx3QkFBd0IsNkNBWTNCLEtBQUssRUFBRTs7QUFFYixRQUFJLENBQUMsTUFBTSxHQUFHLDhCQUFjLFdBQVcsRUFBRSxDQUFDO0FBQzFDLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCx1QkFBaUIsRUFBRSxLQUFLO0FBQ3hCLHlCQUFtQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQztBQUN6RSxrQ0FBNEIsRUFBRSxLQUFLO0FBQ25DLDJCQUFxQixFQUFFLEVBQUU7S0FDMUIsQ0FBQzs7QUFFRixRQUFJLENBQUMsNEJBQTRCLEdBQUcsS0FBSyxDQUFDO0FBQzFDLFFBQUksQ0FBQyxRQUFRLEdBQUcsZ0NBQWdCLFdBQVcsRUFBRSxDQUFDOztBQUU5QyxRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0FBQzlDLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FDakUsVUFBQSxXQUFXLEVBQUk7QUFDYixVQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFDckYsWUFBSyxRQUFRLENBQUMsRUFBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0tBQzdDLENBQ0YsQ0FBQyxDQUFDOztBQUVILEFBQUMsUUFBSSxDQUFPLDBCQUEwQixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEYsQUFBQyxRQUFJLENBQU8sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5RSxBQUFDLFFBQUksQ0FBTyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsQUFBQyxRQUFJLENBQU8sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlELEFBQUMsUUFBSSxDQUFPLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEUsQUFBQyxRQUFJLENBQU8seUJBQXlCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNuRjs7ZUF2Q1Usd0JBQXdCOztXQXlDbEIsNkJBQVM7QUFDeEIsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ3JDLGdCQUFnQixFQUNoQiw0QkFBNEIsRUFDNUIsSUFBSSxDQUFDLDBCQUEwQixDQUNoQyxDQUFDLENBQUM7S0FDSjs7O1dBRW1CLGdDQUFTO0FBQzNCLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVpQiw0QkFBQyxTQUFnQixFQUFFLFNBQWdCLEVBQVE7QUFDM0QsVUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFO0FBQ2hFLFlBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztPQUN6RSxNQUFNLElBQUksU0FBUyxDQUFDLGlCQUFpQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRTtBQUN2RSxpQ0FBVSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUMxQyxZQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztPQUNsQztLQUNGOzs7V0FFSyxrQkFBa0I7QUFDdEIsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUMvQyxVQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUMzRCxVQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs7QUFFOUQsVUFBSSxzQkFBc0IsWUFBQSxDQUFDO0FBQzNCLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixJQUFJLENBQUMsbUJBQW1CLEVBQUU7QUFDM0QsOEJBQXNCLEdBQ3BCLGtDQUFDLHNCQUFzQjtBQUNyQixtQkFBUyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxBQUFDO0FBQ2pDLGlCQUFPLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixBQUFDO0FBQ3pDLGlCQUFPLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixBQUFDO1VBQ3RDLEFBQ0gsQ0FBQztPQUNIOztBQUVELFVBQUkscUJBQXFCLFlBQUEsQ0FBQztBQUMxQixVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDL0IsNkJBQXFCLEdBQ25CO0FBQ0UsbUJBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixBQUFDO0FBQ25ELHFCQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQUFBQztBQUM5QyxrQkFBUSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQUFBQztBQUNqQyxnQkFBTSxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7QUFDN0Isa0JBQVEsRUFBRSxJQUFJLENBQUMseUJBQXlCLEFBQUM7VUFDekMsQUFDSCxDQUFDO09BQ0g7O0FBRUQsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBRSw2QkFBVztBQUNwQix1Q0FBMkIsRUFBRSxJQUFJO0FBQ2pDLDZDQUFpQyxFQUMvQixVQUFVLENBQUMsT0FBTyxFQUFFLElBQ3BCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsSUFDN0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFO1dBQ3JDLENBQUMsQUFBQztRQUNIOztZQUFLLFNBQVMsRUFBQyxzQkFBc0I7VUFDbEMsc0JBQXNCO1VBQ3ZCLGtDQUFDLHNCQUFzQjtBQUNyQixvQkFBUSxFQUFFLG1CQUFtQixBQUFDO0FBQzlCLG1CQUFPLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixBQUFDO1lBQ3hDO1NBQ0U7UUFDTiwyQ0FBSyxTQUFTLEVBQUMsVUFBVSxHQUFHO1FBQzNCLHFCQUFxQjtPQUNsQixDQUNOO0tBQ0g7OztXQUV5QixzQ0FBUztBQUNqQyxVQUFJLElBQUksQ0FBQyw0QkFBNEIsRUFBRTtBQUNyQyxZQUFJLENBQUMsNEJBQTRCLEdBQUcsS0FBSyxDQUFDO0FBQzFDLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFDLENBQUMsQ0FBQztLQUNuRTs7O1dBRThCLDJDQUFlOzs7QUFDNUMsVUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvQyxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDOztBQUU3RCxVQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDbkIsVUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLEdBQVM7QUFDcEIsWUFBSSxNQUFNLEVBQUU7QUFDVixpQkFBTztTQUNSO0FBQ0QsY0FBTSxHQUFHLElBQUksQ0FBQzs7QUFFZCwrQkFBUyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxQyxhQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEIsZUFBSyxRQUFRLENBQUMsRUFBQyxpQkFBaUIsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO09BQzNDLENBQUM7O0FBRUYsNkJBQVMsTUFBTSxDQUNiO0FBQ0Usd0JBQWdCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQUFBQztBQUM5QyxlQUFPLEVBQUUsT0FBTyxBQUFDO0FBQ2pCLHdCQUFnQixFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7UUFDdkMsRUFDRCxRQUFRLENBQUMsQ0FBQzs7QUFFYixhQUFPLE9BQU8sQ0FBQztLQUNoQjs7O1dBRXdCLHFDQUFTO0FBQ2hDLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxFQUFFO0FBQ3JDLFlBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO09BQ2pDLE1BQU07QUFDTCxZQUFJLENBQUMsdUJBQXVCLENBQUMsb0NBQWdCLENBQUMsQ0FBQztPQUNoRDtLQUNGOzs7V0FFYyx5QkFBQyxJQUFZLEVBQVE7QUFDbEMsVUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDM0QsK0JBQVUsZ0JBQWdCLENBQUMsQ0FBQztBQUM1QixVQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUMzRCxVQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzs7QUFFaEMsc0JBQWdCLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3hELHNCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNqQzs7O1dBRWdCLDJCQUFDLFFBQWdCLEVBQUUsSUFBWSxFQUFRO0FBQ3RELFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNELCtCQUFVLGdCQUFnQixDQUFDLENBQUM7QUFDNUIsVUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDM0QsVUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7O0FBRWhDLHNCQUFnQixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7S0FDM0Q7OztXQUVzQixtQ0FBUztBQUM5QixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUU7QUFDaEMsWUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQztPQUMxQztLQUNGOzs7V0FFYyx5QkFBQyxJQUFZLEVBQUUsSUFBbUIsRUFBUTtBQUN2RCxVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osb0NBQTRCLEVBQUUsSUFBSTtBQUNsQyw2QkFBcUIsRUFBRSxJQUFJO0FBQzNCLHlCQUFpQixFQUFFLEtBQUs7T0FDekIsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLHVCQUF1QixDQUFDLG1DQUFlLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDcEQ7OztXQUVzQixpQ0FBQyxVQUFzQixFQUFRO0FBQ3BELFVBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDbEQ7OztXQUV1QixvQ0FBUztBQUMvQixVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osb0NBQTRCLEVBQUUsS0FBSztBQUNuQyw2QkFBcUIsRUFBRSxFQUFFO09BQzFCLENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztLQUN6Qzs7O1NBMU1VLHdCQUF3QjtHQUFTLG9CQUFNLFNBQVM7Ozs7SUE2TXZELHNCQUFzQjtZQUF0QixzQkFBc0I7O1dBQXRCLHNCQUFzQjswQkFBdEIsc0JBQXNCOzsrQkFBdEIsc0JBQXNCOzs7ZUFBdEIsc0JBQXNCOztXQU9wQixrQkFBa0I7QUFDdEIsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBRSw2QkFBVztBQUNwQixlQUFHLEVBQUUsSUFBSTtBQUNULG9CQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTO1dBQy9CLENBQUMsQUFBQztBQUNILGFBQUcsRUFBRSxvQ0FBVztBQUNkLGlCQUFLLEVBQUUscUJBQXFCO0FBQzVCLGlCQUFLLEVBQUUsR0FBRztBQUNWLHFCQUFTLEVBQUUsUUFBUTtBQUNuQiw2QkFBaUIsRUFBRSw0QkFBNEI7V0FDaEQsQ0FBQyxBQUFDO0FBQ0gsaUJBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQUFBQztBQUM1QixpQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxBQUFDO1FBQzVCLDRDQUFNLFNBQVMsRUFBQyx5REFBeUQsR0FBRztPQUNyRSxDQUNUO0tBQ0g7OztTQXpCRyxzQkFBc0I7R0FBUyxvQkFBTSxTQUFTOztJQTRCOUMsc0JBQXNCO1lBQXRCLHNCQUFzQjs7V0FBdEIsc0JBQXNCOzBCQUF0QixzQkFBc0I7OytCQUF0QixzQkFBc0I7OztlQUF0QixzQkFBc0I7O1dBTXBCLGtCQUFrQjtBQUN0QixhQUNFOzs7QUFDRSxtQkFBUyxFQUFFLDZCQUFXO0FBQ3BCLGVBQUcsRUFBRSxJQUFJO0FBQ1Qsb0JBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7V0FDOUIsQ0FBQyxBQUFDO0FBQ0gsYUFBRyxFQUFFLG9DQUFXO0FBQ2QsaUJBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLEdBQUcsc0JBQXNCO0FBQzlELGlCQUFLLEVBQUUsR0FBRztBQUNWLHFCQUFTLEVBQUUsUUFBUTtXQUNwQixDQUFDLEFBQUM7QUFDSCxpQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxBQUFDO1FBQzVCLDRDQUFNLFNBQVMsRUFBRSw2QkFBVztBQUMxQixnQkFBSSxFQUFFLElBQUk7QUFDVix1QkFBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRO0FBQ2pDLHVCQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRO0FBQ2hDLDRDQUFnQyxFQUFFLElBQUk7V0FDdkMsQ0FBQyxBQUFDO1VBQ0Q7T0FDSyxDQUNUO0tBQ0g7OztTQTVCRyxzQkFBc0I7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkZpbGVUcmVlVG9vbGJhckNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3QsIFJlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2FkZFRvb2x0aXB9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7V29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Xb3JraW5nU2V0U2VsZWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7V29ya2luZ1NldE5hbWVBbmRTYXZlQ29tcG9uZW50fSBmcm9tICcuL1dvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudCc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuLi9saWIvRmlsZVRyZWVTdG9yZSc7XG5pbXBvcnQgRmlsZVRyZWVBY3Rpb25zIGZyb20gJy4uL2xpYi9GaWxlVHJlZUFjdGlvbnMnO1xuaW1wb3J0IHtXb3JraW5nU2V0fSBmcm9tICcuLi8uLi9udWNsaWRlLXdvcmtpbmctc2V0cyc7XG5cbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi9udWNsaWRlLXdvcmtpbmctc2V0cyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHdvcmtpbmdTZXRzU3RvcmU6IFdvcmtpbmdTZXRzU3RvcmU7XG59O1xuXG50eXBlIFN0YXRlID0ge1xuICBzZWxlY3Rpb25Jc0FjdGl2ZTogYm9vbGVhbjtcbiAgZGVmaW5pdGlvbnNBcmVFbXB0eTogYm9vbGVhbjtcbiAgaXNVcGRhdGluZ0V4aXN0aW5nV29ya2luZ1NldDogYm9vbGVhbjtcbiAgdXBkYXRlZFdvcmtpbmdTZXROYW1lOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgY2xhc3MgRmlsZVRyZWVUb29sYmFyQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pblByb2Nlc3NPZkNsb3NpbmdTZWxlY3Rpb246IGJvb2xlYW47XG4gIF9wcmV2TmFtZTogc3RyaW5nO1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9hY3Rpb25zOiBGaWxlVHJlZUFjdGlvbnM7XG4gIF9jbG9zZVdvcmtpbmdTZXRzU2VsZWN0b3I6ID8oKSA9PiB2b2lkO1xuICBzdGF0ZTogU3RhdGU7XG4gIHByb3BzOiBQcm9wcztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNlbGVjdGlvbklzQWN0aXZlOiBmYWxzZSxcbiAgICAgIGRlZmluaXRpb25zQXJlRW1wdHk6IHByb3BzLndvcmtpbmdTZXRzU3RvcmUuZ2V0RGVmaW5pdGlvbnMoKS5sZW5ndGggPT09IDAsXG4gICAgICBpc1VwZGF0aW5nRXhpc3RpbmdXb3JraW5nU2V0OiBmYWxzZSxcbiAgICAgIHVwZGF0ZWRXb3JraW5nU2V0TmFtZTogJycsXG4gICAgfTtcblxuICAgIHRoaXMuX2luUHJvY2Vzc09mQ2xvc2luZ1NlbGVjdGlvbiA9IGZhbHNlO1xuICAgIHRoaXMuX2FjdGlvbnMgPSBGaWxlVHJlZUFjdGlvbnMuZ2V0SW5zdGFuY2UoKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQocHJvcHMud29ya2luZ1NldHNTdG9yZS5zdWJzY3JpYmVUb0RlZmluaXRpb25zKFxuICAgICAgZGVmaW5pdGlvbnMgPT4ge1xuICAgICAgICBjb25zdCBlbXB0eSA9IGRlZmluaXRpb25zLmFwcGxpY2FibGUubGVuZ3RoICsgZGVmaW5pdGlvbnMubm90QXBwbGljYWJsZS5sZW5ndGggPT09IDA7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RlZmluaXRpb25zQXJlRW1wdHk6IGVtcHR5fSk7XG4gICAgICB9XG4gICAgKSk7XG5cbiAgICAodGhpczogYW55KS5fdG9nZ2xlV29ya2luZ1NldHNTZWxlY3RvciA9IHRoaXMuX3RvZ2dsZVdvcmtpbmdTZXRzU2VsZWN0b3IuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tJZkNsb3NpbmdTZWxlY3RvciA9IHRoaXMuX2NoZWNrSWZDbG9zaW5nU2VsZWN0b3IuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fZWRpdFdvcmtpbmdTZXQgPSB0aGlzLl9lZGl0V29ya2luZ1NldC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9zYXZlV29ya2luZ1NldCA9IHRoaXMuX3NhdmVXb3JraW5nU2V0LmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3VwZGF0ZVdvcmtpbmdTZXQgPSB0aGlzLl91cGRhdGVXb3JraW5nU2V0LmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3RvZ2dsZVdvcmtpbmdTZXRFZGl0TW9kZSA9IHRoaXMuX3RvZ2dsZVdvcmtpbmdTZXRFZGl0TW9kZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICd3b3JraW5nLXNldHM6c2VsZWN0LWFjdGl2ZScsXG4gICAgICB0aGlzLl90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yLFxuICAgICkpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMsIHByZXZTdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgICBpZiAoIXByZXZTdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZSAmJiB0aGlzLnN0YXRlLnNlbGVjdGlvbklzQWN0aXZlKSB7XG4gICAgICB0aGlzLl9jbG9zZVdvcmtpbmdTZXRzU2VsZWN0b3IgPSB0aGlzLl9yZW5kZXJXb3JraW5nU2V0U2VsZWN0aW9uUGFuZWwoKTtcbiAgICB9IGVsc2UgaWYgKHByZXZTdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZSAmJiAhdGhpcy5zdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZSkge1xuICAgICAgaW52YXJpYW50KHRoaXMuX2Nsb3NlV29ya2luZ1NldHNTZWxlY3Rvcik7XG4gICAgICB0aGlzLl9jbG9zZVdvcmtpbmdTZXRzU2VsZWN0b3IoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3Qgd29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXQoKTtcbiAgICBjb25zdCBlZGl0ZWRXb3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0RWRpdGVkV29ya2luZ1NldCgpO1xuICAgIGNvbnN0IGlzRWRpdGluZ1dvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCk7XG5cbiAgICBsZXQgc2VsZWN0V29ya2luZ1NldEJ1dHRvbjtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZGVmaW5pdGlvbnNBcmVFbXB0eSAmJiAhaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgc2VsZWN0V29ya2luZ1NldEJ1dHRvbiA9IChcbiAgICAgICAgPFNlbGVjdFdvcmtpbmdTZXRCdXR0b25cbiAgICAgICAgICBoaWdobGlnaHQ9eyF3b3JraW5nU2V0LmlzRW1wdHkoKX1cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMuX2NoZWNrSWZDbG9zaW5nU2VsZWN0b3J9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCB3b3JraW5nU2V0TmFtZUFuZFNhdmU7XG4gICAgaWYgKCFlZGl0ZWRXb3JraW5nU2V0LmlzRW1wdHkoKSkge1xuICAgICAgd29ya2luZ1NldE5hbWVBbmRTYXZlID0gKFxuICAgICAgICA8V29ya2luZ1NldE5hbWVBbmRTYXZlQ29tcG9uZW50XG4gICAgICAgICAgaXNFZGl0aW5nPXt0aGlzLnN0YXRlLmlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXR9XG4gICAgICAgICAgaW5pdGlhbE5hbWU9e3RoaXMuc3RhdGUudXBkYXRlZFdvcmtpbmdTZXROYW1lfVxuICAgICAgICAgIG9uVXBkYXRlPXt0aGlzLl91cGRhdGVXb3JraW5nU2V0fVxuICAgICAgICAgIG9uU2F2ZT17dGhpcy5fc2F2ZVdvcmtpbmdTZXR9XG4gICAgICAgICAgb25DYW5jZWw9e3RoaXMuX3RvZ2dsZVdvcmtpbmdTZXRFZGl0TW9kZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhcic6IHRydWUsXG4gICAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXRvb2xiYXItZmFkZXInOlxuICAgICAgICAgICAgd29ya2luZ1NldC5pc0VtcHR5KCkgJiZcbiAgICAgICAgICAgICF0aGlzLnN0YXRlLnNlbGVjdGlvbklzQWN0aXZlICYmXG4gICAgICAgICAgICAhdGhpcy5fc3RvcmUuaXNFZGl0aW5nV29ya2luZ1NldCgpLFxuICAgICAgICB9KX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIHB1bGwtcmlnaHRcIj5cbiAgICAgICAgICB7c2VsZWN0V29ya2luZ1NldEJ1dHRvbn1cbiAgICAgICAgICA8RGVmaW5lV29ya2luZ1NldEJ1dHRvblxuICAgICAgICAgICAgaXNBY3RpdmU9e2lzRWRpdGluZ1dvcmtpbmdTZXR9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl90b2dnbGVXb3JraW5nU2V0RWRpdE1vZGV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiAvPlxuICAgICAgICB7d29ya2luZ1NldE5hbWVBbmRTYXZlfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pblByb2Nlc3NPZkNsb3NpbmdTZWxlY3Rpb24pIHtcbiAgICAgIHRoaXMuX2luUHJvY2Vzc09mQ2xvc2luZ1NlbGVjdGlvbiA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbklzQWN0aXZlOiAhdGhpcy5zdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZX0pO1xuICB9XG5cbiAgX3JlbmRlcldvcmtpbmdTZXRTZWxlY3Rpb25QYW5lbCgpOiAoKSA9PiB2b2lkIHtcbiAgICBjb25zdCByZWFjdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7aXRlbTogcmVhY3REaXZ9KTtcblxuICAgIGxldCBjbG9zZWQgPSBmYWxzZTtcbiAgICBjb25zdCBvbkNsb3NlID0gKCkgPT4ge1xuICAgICAgaWYgKGNsb3NlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjbG9zZWQgPSB0cnVlO1xuXG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHJlYWN0RGl2KTtcbiAgICAgIHBhbmVsLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbklzQWN0aXZlOiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICBSZWFjdERPTS5yZW5kZXIoKFxuICAgICAgPFdvcmtpbmdTZXRTZWxlY3Rpb25Db21wb25lbnRcbiAgICAgICAgd29ya2luZ1NldHNTdG9yZT17dGhpcy5wcm9wcy53b3JraW5nU2V0c1N0b3JlfVxuICAgICAgICBvbkNsb3NlPXtvbkNsb3NlfVxuICAgICAgICBvbkVkaXRXb3JraW5nU2V0PXt0aGlzLl9lZGl0V29ya2luZ1NldH1cbiAgICAgIC8+XG4gICAgKSwgcmVhY3REaXYpO1xuXG4gICAgcmV0dXJuIG9uQ2xvc2U7XG4gIH1cblxuICBfdG9nZ2xlV29ya2luZ1NldEVkaXRNb2RlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCkpIHtcbiAgICAgIHRoaXMuX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3N0YXJ0RWRpdGluZ1dvcmtpbmdTZXQobmV3IFdvcmtpbmdTZXQoKSk7XG4gICAgfVxuICB9XG5cbiAgX3NhdmVXb3JraW5nU2V0KG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHdvcmtpbmdTZXRzU3RvcmUgPSB0aGlzLl9zdG9yZS5nZXRXb3JraW5nU2V0c1N0b3JlKCk7XG4gICAgaW52YXJpYW50KHdvcmtpbmdTZXRzU3RvcmUpO1xuICAgIGNvbnN0IGVkaXRlZFdvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5nZXRFZGl0ZWRXb3JraW5nU2V0KCk7XG4gICAgdGhpcy5fZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcblxuICAgIHdvcmtpbmdTZXRzU3RvcmUuc2F2ZVdvcmtpbmdTZXQobmFtZSwgZWRpdGVkV29ya2luZ1NldCk7XG4gICAgd29ya2luZ1NldHNTdG9yZS5hY3RpdmF0ZShuYW1lKTtcbiAgfVxuXG4gIF91cGRhdGVXb3JraW5nU2V0KHByZXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHdvcmtpbmdTZXRzU3RvcmUgPSB0aGlzLl9zdG9yZS5nZXRXb3JraW5nU2V0c1N0b3JlKCk7XG4gICAgaW52YXJpYW50KHdvcmtpbmdTZXRzU3RvcmUpO1xuICAgIGNvbnN0IGVkaXRlZFdvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5nZXRFZGl0ZWRXb3JraW5nU2V0KCk7XG4gICAgdGhpcy5fZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcblxuICAgIHdvcmtpbmdTZXRzU3RvcmUudXBkYXRlKHByZXZOYW1lLCBuYW1lLCBlZGl0ZWRXb3JraW5nU2V0KTtcbiAgfVxuXG4gIF9jaGVja0lmQ2xvc2luZ1NlbGVjdG9yKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGlvbklzQWN0aXZlKSB7XG4gICAgICB0aGlzLl9pblByb2Nlc3NPZkNsb3NpbmdTZWxlY3Rpb24gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIF9lZGl0V29ya2luZ1NldChuYW1lOiBzdHJpbmcsIHVyaXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9wcmV2TmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1VwZGF0aW5nRXhpc3RpbmdXb3JraW5nU2V0OiB0cnVlLFxuICAgICAgdXBkYXRlZFdvcmtpbmdTZXROYW1lOiBuYW1lLFxuICAgICAgc2VsZWN0aW9uSXNBY3RpdmU6IGZhbHNlLFxuICAgIH0pO1xuICAgIHRoaXMuX3N0YXJ0RWRpdGluZ1dvcmtpbmdTZXQobmV3IFdvcmtpbmdTZXQodXJpcykpO1xuICB9XG5cbiAgX3N0YXJ0RWRpdGluZ1dvcmtpbmdTZXQod29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc3RhcnRFZGl0aW5nV29ya2luZ1NldCh3b3JraW5nU2V0KTtcbiAgfVxuXG4gIF9maW5pc2hFZGl0aW5nV29ya2luZ1NldCgpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXQ6IGZhbHNlLFxuICAgICAgdXBkYXRlZFdvcmtpbmdTZXROYW1lOiAnJyxcbiAgICB9KTtcbiAgICB0aGlzLl9hY3Rpb25zLmZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk7XG4gIH1cbn1cblxuY2xhc3MgU2VsZWN0V29ya2luZ1NldEJ1dHRvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiB7XG4gICAgaGlnaGxpZ2h0OiBib29sZWFuO1xuICAgIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG4gICAgb25Gb2N1czogKCkgPT4gdm9pZDtcbiAgfTtcblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxidXR0b25cbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICBidG46IHRydWUsXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMucHJvcHMuaGlnaGxpZ2h0LFxuICAgICAgICB9KX1cbiAgICAgICAgcmVmPXthZGRUb29sdGlwKHtcbiAgICAgICAgICB0aXRsZTogJ1NlbGVjdCBXb3JraW5nIFNldHMnLFxuICAgICAgICAgIGRlbGF5OiA1MDAsXG4gICAgICAgICAgcGxhY2VtZW50OiAnYm90dG9tJyxcbiAgICAgICAgICBrZXlCaW5kaW5nQ29tbWFuZDogJ3dvcmtpbmctc2V0czpzZWxlY3QtYWN0aXZlJyxcbiAgICAgICAgfSl9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja31cbiAgICAgICAgb25Gb2N1cz17dGhpcy5wcm9wcy5vbkZvY3VzfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWxpc3QtdW5vcmRlcmVkIG51Y2xpZGUtZmlsZS10cmVlLXRvb2xiYXItaWNvblwiIC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICApO1xuICB9XG59XG5cbmNsYXNzIERlZmluZVdvcmtpbmdTZXRCdXR0b24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczoge1xuICAgIGlzQWN0aXZlOiBib29sZWFuO1xuICAgIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG4gIH07XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgYnRuOiB0cnVlLFxuICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnByb3BzLmlzQWN0aXZlLFxuICAgICAgICB9KX1cbiAgICAgICAgcmVmPXthZGRUb29sdGlwKHtcbiAgICAgICAgICB0aXRsZTogdGhpcy5wcm9wcy5pc0FjdGl2ZSA/ICdDYW5jZWwnIDogJ0RlZmluZSBhIFdvcmtpbmcgU2V0JyxcbiAgICAgICAgICBkZWxheTogNTAwLFxuICAgICAgICAgIHBsYWNlbWVudDogJ2JvdHRvbScsXG4gICAgICAgIH0pfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoe1xuICAgICAgICAgIGljb246IHRydWUsXG4gICAgICAgICAgJ2ljb24tcGx1cyc6ICF0aGlzLnByb3BzLmlzQWN0aXZlLFxuICAgICAgICAgICdpY29uLWRhc2gnOiB0aGlzLnByb3BzLmlzQWN0aXZlLFxuICAgICAgICAgICdudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWljb24nOiB0cnVlLFxuICAgICAgICB9KX1cbiAgICAgICAgLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICk7XG4gIH1cbn1cbiJdfQ==