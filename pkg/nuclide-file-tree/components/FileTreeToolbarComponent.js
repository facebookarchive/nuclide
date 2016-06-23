Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideUiLibAddTooltip2;

function _nuclideUiLibAddTooltip() {
  return _nuclideUiLibAddTooltip2 = _interopRequireDefault(require('../../nuclide-ui/lib/add-tooltip'));
}

var _WorkingSetSelectionComponent2;

function _WorkingSetSelectionComponent() {
  return _WorkingSetSelectionComponent2 = require('./WorkingSetSelectionComponent');
}

var _WorkingSetNameAndSaveComponent2;

function _WorkingSetNameAndSaveComponent() {
  return _WorkingSetNameAndSaveComponent2 = require('./WorkingSetNameAndSaveComponent');
}

var _libFileTreeStore2;

function _libFileTreeStore() {
  return _libFileTreeStore2 = require('../lib/FileTreeStore');
}

var _libFileTreeActions2;

function _libFileTreeActions() {
  return _libFileTreeActions2 = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _nuclideWorkingSets2;

function _nuclideWorkingSets() {
  return _nuclideWorkingSets2 = require('../../nuclide-working-sets');
}

var FileTreeToolbarComponent = (function (_React$Component) {
  _inherits(FileTreeToolbarComponent, _React$Component);

  function FileTreeToolbarComponent(props) {
    var _this = this;

    _classCallCheck(this, FileTreeToolbarComponent);

    _get(Object.getPrototypeOf(FileTreeToolbarComponent.prototype), 'constructor', this).call(this, props);

    this._store = (_libFileTreeStore2 || _libFileTreeStore()).FileTreeStore.getInstance();
    this.state = {
      selectionIsActive: false,
      definitionsAreEmpty: props.workingSetsStore.getDefinitions().length === 0,
      isUpdatingExistingWorkingSet: false,
      updatedWorkingSetName: ''
    };

    this._inProcessOfClosingSelection = false;
    this._actions = (_libFileTreeActions2 || _libFileTreeActions()).default.getInstance();

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
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
        (0, (_assert2 || _assert()).default)(this._closeWorkingSetsSelector);
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
        selectWorkingSetButton = (_reactForAtom2 || _reactForAtom()).React.createElement(SelectWorkingSetButton, {
          highlight: !workingSet.isEmpty(),
          onClick: this._toggleWorkingSetsSelector,
          onFocus: this._checkIfClosingSelector
        });
      }

      var workingSetNameAndSave = undefined;
      if (isEditingWorkingSet && !editedWorkingSetIsEmpty) {
        workingSetNameAndSave = (_reactForAtom2 || _reactForAtom()).React.createElement((_WorkingSetNameAndSaveComponent2 || _WorkingSetNameAndSaveComponent()).WorkingSetNameAndSaveComponent, {
          isEditing: this.state.isUpdatingExistingWorkingSet,
          initialName: this.state.updatedWorkingSetName,
          onUpdate: this._updateWorkingSet,
          onSave: this._saveWorkingSet,
          onCancel: this._toggleWorkingSetEditMode
        });
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        {
          className: (0, (_classnames2 || _classnames()).default)({
            'nuclide-file-tree-toolbar': true,
            'nuclide-file-tree-toolbar-fader': workingSet.isEmpty() && !this.state.selectionIsActive && !this._store.isEditingWorkingSet()
          }) },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'btn-group pull-right' },
          selectWorkingSetButton,
          (_reactForAtom2 || _reactForAtom()).React.createElement(DefineWorkingSetButton, {
            isActive: isEditingWorkingSet,
            onClick: this._toggleWorkingSetEditMode
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement('div', { className: 'clearfix' }),
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

        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(reactDiv);
        panel.destroy();
        _this2.setState({ selectionIsActive: false });
      };

      (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_WorkingSetSelectionComponent2 || _WorkingSetSelectionComponent()).WorkingSetSelectionComponent, {
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
        this._startEditingWorkingSet(new (_nuclideWorkingSets2 || _nuclideWorkingSets()).WorkingSet());
      }
    }
  }, {
    key: '_saveWorkingSet',
    value: function _saveWorkingSet(name) {
      var workingSetsStore = this._store.getWorkingSetsStore();
      (0, (_assert2 || _assert()).default)(workingSetsStore);

      var editedWorkingSet = this._store.getEditedWorkingSet();
      this._finishEditingWorkingSet();
      workingSetsStore.saveWorkingSet(name, editedWorkingSet);
      workingSetsStore.activate(name);
    }
  }, {
    key: '_updateWorkingSet',
    value: function _updateWorkingSet(prevName, name) {
      var workingSetsStore = this._store.getWorkingSetsStore();
      (0, (_assert2 || _assert()).default)(workingSetsStore);
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
      this._startEditingWorkingSet(new (_nuclideWorkingSets2 || _nuclideWorkingSets()).WorkingSet(uris));
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
})((_reactForAtom2 || _reactForAtom()).React.Component);

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

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'button',
        {
          className: (0, (_classnames2 || _classnames()).default)('btn', { selected: highlight }),
          ref: (0, (_nuclideUiLibAddTooltip2 || _nuclideUiLibAddTooltip()).default)({
            title: 'Select Working Sets',
            delay: 500,
            placement: 'bottom',
            keyBindingCommand: 'working-sets:select-active'
          }),
          onClick: onClick,
          onFocus: onFocus },
        (_reactForAtom2 || _reactForAtom()).React.createElement('span', { className: 'icon icon-list-unordered nuclide-file-tree-toolbar-icon' })
      );
    }
  }]);

  return SelectWorkingSetButton;
})((_reactForAtom2 || _reactForAtom()).React.Component);

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

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'button',
        {
          className: (0, (_classnames2 || _classnames()).default)('btn', { selected: isActive }),
          ref: (0, (_nuclideUiLibAddTooltip2 || _nuclideUiLibAddTooltip()).default)({
            title: isActive ? 'Cancel' : 'Define a Working Set',
            delay: 500,
            placement: 'bottom'
          }),
          onClick: onClick },
        (_reactForAtom2 || _reactForAtom()).React.createElement('span', {
          className: (0, (_classnames2 || _classnames()).default)({
            'icon': true,
            'icon-plus': !isActive,
            'icon-dash': isActive,
            'nuclide-file-tree-toolbar-icon': true
          })
        })
      );
    }
  }]);

  return DefineWorkingSetButton;
})((_reactForAtom2 || _reactForAtom()).React.Component);