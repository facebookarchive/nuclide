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

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibButtonGroup2;

function _nuclideUiLibButtonGroup() {
  return _nuclideUiLibButtonGroup2 = require('../../nuclide-ui/lib/ButtonGroup');
}

var WorkingSetSelectionComponent = (function (_React$Component) {
  _inherits(WorkingSetSelectionComponent, _React$Component);

  function WorkingSetSelectionComponent(props) {
    var _this = this;

    _classCallCheck(this, WorkingSetSelectionComponent);

    _get(Object.getPrototypeOf(WorkingSetSelectionComponent.prototype), 'constructor', this).call(this, props);

    var workingSetsStore = props.workingSetsStore;

    this.state = {
      selectionIndex: 0,
      applicableDefinitions: workingSetsStore.getApplicableDefinitions(),
      notApplicableDefinitions: workingSetsStore.getNotApplicableDefinitions()
    };

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    this._disposables.add(workingSetsStore.subscribeToDefinitions(function (definitions) {
      _this.setState({
        applicableDefinitions: definitions.applicable,
        notApplicableDefinitions: definitions.notApplicable
      });
      if (definitions.applicable.length + definitions.notApplicable.length === 0) {
        _this.props.onClose();
      }
    }));

    this._checkFocus = this._checkFocus.bind(this);
    this._toggleWorkingSet = this._toggleWorkingSet.bind(this);
    this._setSelectionIndex = this._setSelectionIndex.bind(this);
    this._deleteWorkingSet = this._deleteWorkingSet.bind(this);
  }

  _createClass(WorkingSetSelectionComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var node = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);
      node.focus();
      this._disposables.add(atom.commands.add(node, {
        'core:move-up': function coreMoveUp() {
          return _this2._moveSelectionIndex(-1);
        },
        'core:move-down': function coreMoveDown() {
          return _this2._moveSelectionIndex(1);
        },
        'core:confirm': function coreConfirm() {
          var def = _this2.state.applicableDefinitions[_this2.state.selectionIndex];
          _this2._toggleWorkingSet(def.name, def.active);
        },
        'core:cancel': this.props.onClose
      }));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps, nextState) {
      var applicableLength = nextState.applicableDefinitions.length;

      if (applicableLength > 0) {
        if (nextState.selectionIndex >= applicableLength) {
          this.setState({ selectionIndex: applicableLength - 1 });
        } else if (nextState.selectionIndex < 0) {
          this.setState({ selectionIndex: 0 });
        }
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var node = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);
      node.focus();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var applicableDefinitions = this.state.applicableDefinitions.map(function (def, index) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(ApplicableDefinitionLine, {
          key: def.name,
          def: def,
          index: index,
          selected: index === _this3.state.selectionIndex,
          toggleWorkingSet: _this3._toggleWorkingSet,
          onSelect: _this3._setSelectionIndex,
          onDeleteWorkingSet: _this3._deleteWorkingSet,
          onEditWorkingSet: _this3.props.onEditWorkingSet
        });
      });

      var notApplicableSection = undefined;
      if (this.state.notApplicableDefinitions.length > 0) {
        var _notApplicableDefinitions = this.state.notApplicableDefinitions.map(function (def) {
          return (_reactForAtom2 || _reactForAtom()).React.createElement(NonApplicableDefinitionLine, {
            key: def.name,
            def: def,
            onDeleteWorkingSet: _this3._deleteWorkingSet
          });
        });

        notApplicableSection = (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement('hr', { className: 'nuclide-file-tree-working-set-separator' }),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            null,
            'The working sets below are not applicable to your current project folders'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'ol',
            { className: 'list-group' },
            _notApplicableDefinitions
          )
        );
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        {
          className: 'select-list',
          tabIndex: '0',
          onBlur: this._checkFocus },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'ol',
          { className: 'list-group mark-active', style: { 'max-height': '80vh' } },
          applicableDefinitions
        ),
        notApplicableSection
      );
    }
  }, {
    key: '_moveSelectionIndex',
    value: function _moveSelectionIndex(step) {
      this.setState({ selectionIndex: this.state.selectionIndex + step });
    }
  }, {
    key: '_setSelectionIndex',
    value: function _setSelectionIndex(selectionIndex) {
      this.setState({ selectionIndex: selectionIndex });
    }
  }, {
    key: '_checkFocus',
    value: function _checkFocus(event) {
      var node = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);
      // If the next active element (`event.relatedTarget`) is not a descendant of this modal, close
      // the modal.
      if (!node.contains(event.relatedTarget)) {
        this.props.onClose();
      }
    }
  }, {
    key: '_toggleWorkingSet',
    value: function _toggleWorkingSet(name, active) {
      if (active) {
        this.props.workingSetsStore.deactivate(name);
      } else {
        this.props.workingSetsStore.activate(name);
      }
    }
  }, {
    key: '_deleteWorkingSet',
    value: function _deleteWorkingSet(name) {
      this.props.workingSetsStore.deleteWorkingSet(name);
    }
  }]);

  return WorkingSetSelectionComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.WorkingSetSelectionComponent = WorkingSetSelectionComponent;

var ApplicableDefinitionLine = (function (_React$Component2) {
  _inherits(ApplicableDefinitionLine, _React$Component2);

  function ApplicableDefinitionLine(props) {
    _classCallCheck(this, ApplicableDefinitionLine);

    _get(Object.getPrototypeOf(ApplicableDefinitionLine.prototype), 'constructor', this).call(this, props);

    this._lineOnClick = this._lineOnClick.bind(this);
    this._deleteButtonOnClick = this._deleteButtonOnClick.bind(this);
    this._editButtonOnClick = this._editButtonOnClick.bind(this);
  }

  _createClass(ApplicableDefinitionLine, [{
    key: 'render',
    value: function render() {
      var _this4 = this;

      var classes = {
        active: this.props.def.active,
        selected: this.props.selected,
        clearfix: true
      };

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'li',
        {
          className: (0, (_classnames2 || _classnames()).default)(classes),
          onMouseOver: function () {
            return _this4.props.onSelect(_this4.props.index);
          },
          onClick: this._lineOnClick },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibButtonGroup2 || _nuclideUiLibButtonGroup()).ButtonGroup,
          { className: 'pull-right' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
            icon: 'trashcan',
            onClick: this._deleteButtonOnClick,
            tabIndex: '-1',
            title: 'Delete this working set'
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
            icon: 'pencil',
            onClick: this._editButtonOnClick,
            tabIndex: '-1',
            title: 'Edit this working set'
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          null,
          this.props.def.name
        )
      );
    }
  }, {
    key: '_lineOnClick',
    value: function _lineOnClick(event) {
      this.props.toggleWorkingSet(this.props.def.name, this.props.def.active);
    }
  }, {
    key: '_deleteButtonOnClick',
    value: function _deleteButtonOnClick(event) {
      this.props.onDeleteWorkingSet(this.props.def.name);
      event.stopPropagation();
    }
  }, {
    key: '_editButtonOnClick',
    value: function _editButtonOnClick(event) {
      this.props.onEditWorkingSet(this.props.def.name, this.props.def.uris);
      event.stopPropagation();
    }
  }]);

  return ApplicableDefinitionLine;
})((_reactForAtom2 || _reactForAtom()).React.Component);

var NonApplicableDefinitionLine = (function (_React$Component3) {
  _inherits(NonApplicableDefinitionLine, _React$Component3);

  function NonApplicableDefinitionLine(props) {
    _classCallCheck(this, NonApplicableDefinitionLine);

    _get(Object.getPrototypeOf(NonApplicableDefinitionLine.prototype), 'constructor', this).call(this, props);

    this._deleteButtonOnClick = this._deleteButtonOnClick.bind(this);
  }

  _createClass(NonApplicableDefinitionLine, [{
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'li',
        { className: 'clearfix' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
          className: 'pull-right',
          icon: 'trashcan',
          onClick: this._deleteButtonOnClick,
          tabIndex: '-1',
          title: 'Delete this working set'
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: 'text-subtle' },
          this.props.def.name
        )
      );
    }
  }, {
    key: '_deleteButtonOnClick',
    value: function _deleteButtonOnClick(event) {
      this.props.onDeleteWorkingSet(this.props.def.name);
      event.stopPropagation();
    }
  }]);

  return NonApplicableDefinitionLine;
})((_reactForAtom2 || _reactForAtom()).React.Component);