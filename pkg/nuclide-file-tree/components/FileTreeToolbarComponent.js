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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlVG9vbGJhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVc4QixnQkFBZ0I7O29CQUNaLE1BQU07OzBCQUNqQixZQUFZOzs7O3NCQUNiLFFBQVE7Ozs7a0NBQ0wsNEJBQTRCOzs0Q0FDVixnQ0FBZ0M7OzhDQUM5QixrQ0FBa0M7O2dDQUNyRCxzQkFBc0I7Ozs7a0NBQ3BCLHdCQUF3Qjs7OztrQ0FDM0IsNEJBQTRCOztJQWV4Qyx3QkFBd0I7WUFBeEIsd0JBQXdCOztBQVd4QixXQVhBLHdCQUF3QixDQVd2QixLQUFhLEVBQUU7OzswQkFYaEIsd0JBQXdCOztBQVlqQywrQkFaUyx3QkFBd0IsNkNBWTNCLEtBQUssRUFBRTs7QUFFYixRQUFJLENBQUMsTUFBTSxHQUFHLDhCQUFjLFdBQVcsRUFBRSxDQUFDO0FBQzFDLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCx1QkFBaUIsRUFBRSxLQUFLO0FBQ3hCLHlCQUFtQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxNQUFNLEtBQUssQ0FBQztBQUN6RSxrQ0FBNEIsRUFBRSxLQUFLO0FBQ25DLDJCQUFxQixFQUFFLEVBQUU7S0FDMUIsQ0FBQzs7QUFFRixRQUFJLENBQUMsNEJBQTRCLEdBQUcsS0FBSyxDQUFDO0FBQzFDLFFBQUksQ0FBQyxRQUFRLEdBQUcsZ0NBQWdCLFdBQVcsRUFBRSxDQUFDOztBQUU5QyxRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0FBQzlDLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FDakUsVUFBQSxXQUFXLEVBQUk7QUFDYixVQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFDckYsWUFBSyxRQUFR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RUFBRSxJQUFJO0FBQ1YsdUJBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtBQUNqQyx1QkFBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtBQUNoQyw0Q0FBZ0MsRUFBRSxJQUFJO1dBQ3ZDLENBQUMsQUFBQztVQUNEO09BQ0ssQ0FDVDtLQUNIOzs7U0E1Qkcsc0JBQXNCO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJGaWxlVHJlZVRvb2xiYXJDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0LCBSZWFjdERPTX0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHthZGRUb29sdGlwfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge1dvcmtpbmdTZXRTZWxlY3Rpb25Db21wb25lbnR9IGZyb20gJy4vV29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge1dvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudH0gZnJvbSAnLi9Xb3JraW5nU2V0TmFtZUFuZFNhdmVDb21wb25lbnQnO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi4vbGliL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IEZpbGVUcmVlQWN0aW9ucyBmcm9tICcuLi9saWIvRmlsZVRyZWVBY3Rpb25zJztcbmltcG9ydCB7V29ya2luZ1NldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS13b3JraW5nLXNldHMnO1xuXG5pbXBvcnQgdHlwZSB7V29ya2luZ1NldHNTdG9yZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS13b3JraW5nLXNldHMnO1xuXG50eXBlIFByb3BzID0ge1xuICB3b3JraW5nU2V0c1N0b3JlOiBXb3JraW5nU2V0c1N0b3JlO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VsZWN0aW9uSXNBY3RpdmU6IGJvb2xlYW47XG4gIGRlZmluaXRpb25zQXJlRW1wdHk6IGJvb2xlYW47XG4gIGlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXQ6IGJvb2xlYW47XG4gIHVwZGF0ZWRXb3JraW5nU2V0TmFtZTogc3RyaW5nO1xufTtcblxuZXhwb3J0IGNsYXNzIEZpbGVUcmVlVG9vbGJhckNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfaW5Qcm9jZXNzT2ZDbG9zaW5nU2VsZWN0aW9uOiBib29sZWFuO1xuICBfcHJldk5hbWU6IHN0cmluZztcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfYWN0aW9uczogRmlsZVRyZWVBY3Rpb25zO1xuICBfY2xvc2VXb3JraW5nU2V0c1NlbGVjdG9yOiA/KCkgPT4gdm9pZDtcbiAgc3RhdGU6IFN0YXRlO1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzZWxlY3Rpb25Jc0FjdGl2ZTogZmFsc2UsXG4gICAgICBkZWZpbml0aW9uc0FyZUVtcHR5OiBwcm9wcy53b3JraW5nU2V0c1N0b3JlLmdldERlZmluaXRpb25zKCkubGVuZ3RoID09PSAwLFxuICAgICAgaXNVcGRhdGluZ0V4aXN0aW5nV29ya2luZ1NldDogZmFsc2UsXG4gICAgICB1cGRhdGVkV29ya2luZ1NldE5hbWU6ICcnLFxuICAgIH07XG5cbiAgICB0aGlzLl9pblByb2Nlc3NPZkNsb3NpbmdTZWxlY3Rpb24gPSBmYWxzZTtcbiAgICB0aGlzLl9hY3Rpb25zID0gRmlsZVRyZWVBY3Rpb25zLmdldEluc3RhbmNlKCk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHByb3BzLndvcmtpbmdTZXRzU3RvcmUuc3Vic2NyaWJlVG9EZWZpbml0aW9ucyhcbiAgICAgIGRlZmluaXRpb25zID0+IHtcbiAgICAgICAgY29uc3QgZW1wdHkgPSBkZWZpbml0aW9ucy5hcHBsaWNhYmxlLmxlbmd0aCArIGRlZmluaXRpb25zLm5vdEFwcGxpY2FibGUubGVuZ3RoID09PSAwO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtkZWZpbml0aW9uc0FyZUVtcHR5OiBlbXB0eX0pO1xuICAgICAgfVxuICAgICkpO1xuXG4gICAgKHRoaXM6IGFueSkuX3RvZ2dsZVdvcmtpbmdTZXRzU2VsZWN0b3IgPSB0aGlzLl90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2NoZWNrSWZDbG9zaW5nU2VsZWN0b3IgPSB0aGlzLl9jaGVja0lmQ2xvc2luZ1NlbGVjdG9yLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2VkaXRXb3JraW5nU2V0ID0gdGhpcy5fZWRpdFdvcmtpbmdTZXQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fc2F2ZVdvcmtpbmdTZXQgPSB0aGlzLl9zYXZlV29ya2luZ1NldC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl91cGRhdGVXb3JraW5nU2V0ID0gdGhpcy5fdXBkYXRlV29ya2luZ1NldC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl90b2dnbGVXb3JraW5nU2V0RWRpdE1vZGUgPSB0aGlzLl90b2dnbGVXb3JraW5nU2V0RWRpdE1vZGUuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAvLyBUaGlzIGNvbW1hbmQgaXMgZXhwb3NlZCBpbiB0aGUgbnVjbGlkZS13b3JraW5nLXNldHMgbWVudSBjb25maWcuXG4gICAgICAnd29ya2luZy1zZXRzOnNlbGVjdC1hY3RpdmUnLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG51Y2xpZGUtaW50ZXJuYWwvY29tbWFuZC1tZW51LWl0ZW1zXG4gICAgICB0aGlzLl90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yLFxuICAgICkpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMsIHByZXZTdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgICBpZiAoIXByZXZTdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZSAmJiB0aGlzLnN0YXRlLnNlbGVjdGlvbklzQWN0aXZlKSB7XG4gICAgICB0aGlzLl9jbG9zZVdvcmtpbmdTZXRzU2VsZWN0b3IgPSB0aGlzLl9yZW5kZXJXb3JraW5nU2V0U2VsZWN0aW9uUGFuZWwoKTtcbiAgICB9IGVsc2UgaWYgKHByZXZTdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZSAmJiAhdGhpcy5zdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZSkge1xuICAgICAgaW52YXJpYW50KHRoaXMuX2Nsb3NlV29ya2luZ1NldHNTZWxlY3Rvcik7XG4gICAgICB0aGlzLl9jbG9zZVdvcmtpbmdTZXRzU2VsZWN0b3IoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3Qgd29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXQoKTtcbiAgICBjb25zdCBlZGl0ZWRXb3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0RWRpdGVkV29ya2luZ1NldCgpO1xuICAgIGNvbnN0IGlzRWRpdGluZ1dvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCk7XG5cbiAgICBsZXQgc2VsZWN0V29ya2luZ1NldEJ1dHRvbjtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZGVmaW5pdGlvbnNBcmVFbXB0eSAmJiAhaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgc2VsZWN0V29ya2luZ1NldEJ1dHRvbiA9IChcbiAgICAgICAgPFNlbGVjdFdvcmtpbmdTZXRCdXR0b25cbiAgICAgICAgICBoaWdobGlnaHQ9eyF3b3JraW5nU2V0LmlzRW1wdHkoKX1cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMuX2NoZWNrSWZDbG9zaW5nU2VsZWN0b3J9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCB3b3JraW5nU2V0TmFtZUFuZFNhdmU7XG4gICAgaWYgKCFlZGl0ZWRXb3JraW5nU2V0LmlzRW1wdHkoKSkge1xuICAgICAgd29ya2luZ1NldE5hbWVBbmRTYXZlID0gKFxuICAgICAgICA8V29ya2luZ1NldE5hbWVBbmRTYXZlQ29tcG9uZW50XG4gICAgICAgICAgaXNFZGl0aW5nPXt0aGlzLnN0YXRlLmlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXR9XG4gICAgICAgICAgaW5pdGlhbE5hbWU9e3RoaXMuc3RhdGUudXBkYXRlZFdvcmtpbmdTZXROYW1lfVxuICAgICAgICAgIG9uVXBkYXRlPXt0aGlzLl91cGRhdGVXb3JraW5nU2V0fVxuICAgICAgICAgIG9uU2F2ZT17dGhpcy5fc2F2ZVdvcmtpbmdTZXR9XG4gICAgICAgICAgb25DYW5jZWw9e3RoaXMuX3RvZ2dsZVdvcmtpbmdTZXRFZGl0TW9kZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhcic6IHRydWUsXG4gICAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXRvb2xiYXItZmFkZXInOlxuICAgICAgICAgICAgd29ya2luZ1NldC5pc0VtcHR5KCkgJiZcbiAgICAgICAgICAgICF0aGlzLnN0YXRlLnNlbGVjdGlvbklzQWN0aXZlICYmXG4gICAgICAgICAgICAhdGhpcy5fc3RvcmUuaXNFZGl0aW5nV29ya2luZ1NldCgpLFxuICAgICAgICB9KX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIHB1bGwtcmlnaHRcIj5cbiAgICAgICAgICB7c2VsZWN0V29ya2luZ1NldEJ1dHRvbn1cbiAgICAgICAgICA8RGVmaW5lV29ya2luZ1NldEJ1dHRvblxuICAgICAgICAgICAgaXNBY3RpdmU9e2lzRWRpdGluZ1dvcmtpbmdTZXR9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl90b2dnbGVXb3JraW5nU2V0RWRpdE1vZGV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiAvPlxuICAgICAgICB7d29ya2luZ1NldE5hbWVBbmRTYXZlfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF90b2dnbGVXb3JraW5nU2V0c1NlbGVjdG9yKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pblByb2Nlc3NPZkNsb3NpbmdTZWxlY3Rpb24pIHtcbiAgICAgIHRoaXMuX2luUHJvY2Vzc09mQ2xvc2luZ1NlbGVjdGlvbiA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbklzQWN0aXZlOiAhdGhpcy5zdGF0ZS5zZWxlY3Rpb25Jc0FjdGl2ZX0pO1xuICB9XG5cbiAgX3JlbmRlcldvcmtpbmdTZXRTZWxlY3Rpb25QYW5lbCgpOiAoKSA9PiB2b2lkIHtcbiAgICBjb25zdCByZWFjdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7aXRlbTogcmVhY3REaXZ9KTtcblxuICAgIGxldCBjbG9zZWQgPSBmYWxzZTtcbiAgICBjb25zdCBvbkNsb3NlID0gKCkgPT4ge1xuICAgICAgaWYgKGNsb3NlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjbG9zZWQgPSB0cnVlO1xuXG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHJlYWN0RGl2KTtcbiAgICAgIHBhbmVsLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbklzQWN0aXZlOiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICBSZWFjdERPTS5yZW5kZXIoKFxuICAgICAgPFdvcmtpbmdTZXRTZWxlY3Rpb25Db21wb25lbnRcbiAgICAgICAgd29ya2luZ1NldHNTdG9yZT17dGhpcy5wcm9wcy53b3JraW5nU2V0c1N0b3JlfVxuICAgICAgICBvbkNsb3NlPXtvbkNsb3NlfVxuICAgICAgICBvbkVkaXRXb3JraW5nU2V0PXt0aGlzLl9lZGl0V29ya2luZ1NldH1cbiAgICAgIC8+XG4gICAgKSwgcmVhY3REaXYpO1xuXG4gICAgcmV0dXJuIG9uQ2xvc2U7XG4gIH1cblxuICBfdG9nZ2xlV29ya2luZ1NldEVkaXRNb2RlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCkpIHtcbiAgICAgIHRoaXMuX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3N0YXJ0RWRpdGluZ1dvcmtpbmdTZXQobmV3IFdvcmtpbmdTZXQoKSk7XG4gICAgfVxuICB9XG5cbiAgX3NhdmVXb3JraW5nU2V0KG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHdvcmtpbmdTZXRzU3RvcmUgPSB0aGlzLl9zdG9yZS5nZXRXb3JraW5nU2V0c1N0b3JlKCk7XG4gICAgaW52YXJpYW50KHdvcmtpbmdTZXRzU3RvcmUpO1xuICAgIGNvbnN0IGVkaXRlZFdvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5nZXRFZGl0ZWRXb3JraW5nU2V0KCk7XG4gICAgdGhpcy5fZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcblxuICAgIHdvcmtpbmdTZXRzU3RvcmUuc2F2ZVdvcmtpbmdTZXQobmFtZSwgZWRpdGVkV29ya2luZ1NldCk7XG4gICAgd29ya2luZ1NldHNTdG9yZS5hY3RpdmF0ZShuYW1lKTtcbiAgfVxuXG4gIF91cGRhdGVXb3JraW5nU2V0KHByZXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHdvcmtpbmdTZXRzU3RvcmUgPSB0aGlzLl9zdG9yZS5nZXRXb3JraW5nU2V0c1N0b3JlKCk7XG4gICAgaW52YXJpYW50KHdvcmtpbmdTZXRzU3RvcmUpO1xuICAgIGNvbnN0IGVkaXRlZFdvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5nZXRFZGl0ZWRXb3JraW5nU2V0KCk7XG4gICAgdGhpcy5fZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTtcblxuICAgIHdvcmtpbmdTZXRzU3RvcmUudXBkYXRlKHByZXZOYW1lLCBuYW1lLCBlZGl0ZWRXb3JraW5nU2V0KTtcbiAgfVxuXG4gIF9jaGVja0lmQ2xvc2luZ1NlbGVjdG9yKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGlvbklzQWN0aXZlKSB7XG4gICAgICB0aGlzLl9pblByb2Nlc3NPZkNsb3NpbmdTZWxlY3Rpb24gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIF9lZGl0V29ya2luZ1NldChuYW1lOiBzdHJpbmcsIHVyaXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9wcmV2TmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1VwZGF0aW5nRXhpc3RpbmdXb3JraW5nU2V0OiB0cnVlLFxuICAgICAgdXBkYXRlZFdvcmtpbmdTZXROYW1lOiBuYW1lLFxuICAgICAgc2VsZWN0aW9uSXNBY3RpdmU6IGZhbHNlLFxuICAgIH0pO1xuICAgIHRoaXMuX3N0YXJ0RWRpdGluZ1dvcmtpbmdTZXQobmV3IFdvcmtpbmdTZXQodXJpcykpO1xuICB9XG5cbiAgX3N0YXJ0RWRpdGluZ1dvcmtpbmdTZXQod29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc3RhcnRFZGl0aW5nV29ya2luZ1NldCh3b3JraW5nU2V0KTtcbiAgfVxuXG4gIF9maW5pc2hFZGl0aW5nV29ya2luZ1NldCgpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzVXBkYXRpbmdFeGlzdGluZ1dvcmtpbmdTZXQ6IGZhbHNlLFxuICAgICAgdXBkYXRlZFdvcmtpbmdTZXROYW1lOiAnJyxcbiAgICB9KTtcbiAgICB0aGlzLl9hY3Rpb25zLmZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk7XG4gIH1cbn1cblxuY2xhc3MgU2VsZWN0V29ya2luZ1NldEJ1dHRvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiB7XG4gICAgaGlnaGxpZ2h0OiBib29sZWFuO1xuICAgIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG4gICAgb25Gb2N1czogKCkgPT4gdm9pZDtcbiAgfTtcblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxidXR0b25cbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICBidG46IHRydWUsXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMucHJvcHMuaGlnaGxpZ2h0LFxuICAgICAgICB9KX1cbiAgICAgICAgcmVmPXthZGRUb29sdGlwKHtcbiAgICAgICAgICB0aXRsZTogJ1NlbGVjdCBXb3JraW5nIFNldHMnLFxuICAgICAgICAgIGRlbGF5OiA1MDAsXG4gICAgICAgICAgcGxhY2VtZW50OiAnYm90dG9tJyxcbiAgICAgICAgICBrZXlCaW5kaW5nQ29tbWFuZDogJ3dvcmtpbmctc2V0czpzZWxlY3QtYWN0aXZlJyxcbiAgICAgICAgfSl9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja31cbiAgICAgICAgb25Gb2N1cz17dGhpcy5wcm9wcy5vbkZvY3VzfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWxpc3QtdW5vcmRlcmVkIG51Y2xpZGUtZmlsZS10cmVlLXRvb2xiYXItaWNvblwiIC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICApO1xuICB9XG59XG5cbmNsYXNzIERlZmluZVdvcmtpbmdTZXRCdXR0b24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczoge1xuICAgIGlzQWN0aXZlOiBib29sZWFuO1xuICAgIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG4gIH07XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgYnRuOiB0cnVlLFxuICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnByb3BzLmlzQWN0aXZlLFxuICAgICAgICB9KX1cbiAgICAgICAgcmVmPXthZGRUb29sdGlwKHtcbiAgICAgICAgICB0aXRsZTogdGhpcy5wcm9wcy5pc0FjdGl2ZSA/ICdDYW5jZWwnIDogJ0RlZmluZSBhIFdvcmtpbmcgU2V0JyxcbiAgICAgICAgICBkZWxheTogNTAwLFxuICAgICAgICAgIHBsYWNlbWVudDogJ2JvdHRvbScsXG4gICAgICAgIH0pfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoe1xuICAgICAgICAgIGljb246IHRydWUsXG4gICAgICAgICAgJ2ljb24tcGx1cyc6ICF0aGlzLnByb3BzLmlzQWN0aXZlLFxuICAgICAgICAgICdpY29uLWRhc2gnOiB0aGlzLnByb3BzLmlzQWN0aXZlLFxuICAgICAgICAgICdudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWljb24nOiB0cnVlLFxuICAgICAgICB9KX1cbiAgICAgICAgLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICk7XG4gIH1cbn1cbiJdfQ==