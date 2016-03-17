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

    this._disposables = new _atom.CompositeDisposable();

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

      var node = _reactForAtom.ReactDOM.findDOMNode(this);
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
      var node = _reactForAtom.ReactDOM.findDOMNode(this);
      node.focus();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var applicableDefinitions = this.state.applicableDefinitions.map(function (def, index) {
        return _reactForAtom.React.createElement(ApplicableDefinitionLine, {
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
          return _reactForAtom.React.createElement(NonApplicableDefinitionLine, {
            key: def.name,
            def: def,
            onDeleteWorkingSet: _this3._deleteWorkingSet
          });
        });

        notApplicableSection = _reactForAtom.React.createElement(
          'div',
          null,
          _reactForAtom.React.createElement('hr', { className: 'nuclide-file-tree-working-set-separator' }),
          _reactForAtom.React.createElement(
            'span',
            null,
            'The working sets below are not applicable to your current project folders'
          ),
          _reactForAtom.React.createElement(
            'ol',
            { className: 'list-group' },
            _notApplicableDefinitions
          )
        );
      }

      return _reactForAtom.React.createElement(
        'div',
        {
          className: 'select-list',
          tabIndex: '0',
          onBlur: this._checkFocus },
        _reactForAtom.React.createElement(
          'ol',
          { className: 'list-group mark-active' },
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
      var node = _reactForAtom.ReactDOM.findDOMNode(this);
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
})(_reactForAtom.React.Component);

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

      return _reactForAtom.React.createElement(
        'li',
        {
          className: (0, _classnames2['default'])(classes),
          onMouseOver: function () {
            return _this4.props.onSelect(_this4.props.index);
          },
          onClick: this._lineOnClick },
        _reactForAtom.React.createElement(
          'div',
          { className: 'btn-group pull-right' },
          _reactForAtom.React.createElement('button', {
            className: 'btn icon icon-trashcan',
            onClick: this._deleteButtonOnClick,
            tabIndex: '-1',
            title: 'Delete this working set'
          }),
          _reactForAtom.React.createElement('button', {
            className: 'btn icon icon-pencil',
            onClick: this._editButtonOnClick,
            tabIndex: '-1',
            title: 'Edit this working set'
          })
        ),
        _reactForAtom.React.createElement(
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
})(_reactForAtom.React.Component);

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
      return _reactForAtom.React.createElement(
        'li',
        { className: 'clearfix' },
        _reactForAtom.React.createElement('button', {
          className: 'btn icon icon-trashcan pull-right',
          onClick: this._deleteButtonOnClick,
          tabIndex: '-1',
          title: 'Delete this working set'
        }),
        _reactForAtom.React.createElement(
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
})(_reactForAtom.React.Component);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXRTZWxlY3Rpb25Db21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXOEIsZ0JBQWdCOztvQkFDWixNQUFNOzswQkFDakIsWUFBWTs7OztJQWlCdEIsNEJBQTRCO1lBQTVCLDRCQUE0Qjs7QUFLNUIsV0FMQSw0QkFBNEIsQ0FLM0IsS0FBWSxFQUFFOzs7MEJBTGYsNEJBQTRCOztBQU1yQywrQkFOUyw0QkFBNEIsNkNBTS9CLEtBQUssRUFBRTs7QUFFYixRQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQzs7QUFFaEQsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLG9CQUFjLEVBQUUsQ0FBQztBQUNqQiwyQkFBcUIsRUFBRSxnQkFBZ0IsQ0FBQyx3QkFBd0IsRUFBRTtBQUNsRSw4QkFBd0IsRUFBRSxnQkFBZ0IsQ0FBQywyQkFBMkIsRUFBRTtLQUN6RSxDQUFDOztBQUVGLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7O0FBRTlDLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUNyRCxZQUFLLFFBQVEsQ0FBQztBQUNaLDZCQUFxQixFQUFFLFdBQVcsQ0FBQyxVQUFVO0FBQzdDLGdDQUF3QixFQUFFLFdBQVcsQ0FBQyxhQUFhO09BQ3BELENBQUMsQ0FBQztBQUNILFVBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFFLGNBQUssS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3RCO0tBQ0YsQ0FBQyxDQUNILENBQUM7O0FBRUYsQUFBQyxRQUFJLENBQU8sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RELEFBQUMsUUFBSSxD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QUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0RSxXQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7S0FDekI7OztTQXhERyx3QkFBd0I7R0FBUyxvQkFBTSxTQUFTOztJQWdFaEQsMkJBQTJCO1lBQTNCLDJCQUEyQjs7QUFHcEIsV0FIUCwyQkFBMkIsQ0FHbkIsS0FBdUMsRUFBRTswQkFIakQsMkJBQTJCOztBQUk3QiwrQkFKRSwyQkFBMkIsNkNBSXZCLEtBQUssRUFBRTs7QUFFYixBQUFDLFFBQUksQ0FBTyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3pFOztlQVBHLDJCQUEyQjs7V0FTekIsa0JBQWtCO0FBQ3RCLGFBQ0U7O1VBQUksU0FBUyxFQUFDLFVBQVU7UUFDdEI7QUFDRSxtQkFBUyxFQUFDLG1DQUFtQztBQUM3QyxpQkFBTyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQUFBQztBQUNuQyxrQkFBUSxFQUFDLElBQUk7QUFDYixlQUFLLEVBQUMseUJBQXlCO1VBQy9CO1FBQ0Y7O1lBQU0sU0FBUyxFQUFDLGFBQWE7VUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSTtTQUNmO09BQ0osQ0FDTDtLQUNIOzs7V0FFbUIsOEJBQUMsS0FBaUIsRUFBUTtBQUM1QyxVQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25ELFdBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUN6Qjs7O1NBNUJHLDJCQUEyQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiV29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3QsIFJlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0RGVmaW5pdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS13b3JraW5nLXNldHMnO1xuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzL2xpYi9Xb3JraW5nU2V0c1N0b3JlJztcblxudHlwZSBQcm9wcyA9IHtcbiAgd29ya2luZ1NldHNTdG9yZTogV29ya2luZ1NldHNTdG9yZTtcbiAgb25DbG9zZTogKCkgPT4gdm9pZDtcbiAgb25FZGl0V29ya2luZ1NldDogKG5hbWU6IHN0cmluZywgdXJpczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZDtcbn07XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHNlbGVjdGlvbkluZGV4OiBudW1iZXI7XG4gIGFwcGxpY2FibGVEZWZpbml0aW9uczogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+O1xuICBub3RBcHBsaWNhYmxlRGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPjtcbn07XG5cbmV4cG9ydCBjbGFzcyBXb3JraW5nU2V0U2VsZWN0aW9uQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICBjb25zdCB3b3JraW5nU2V0c1N0b3JlID0gcHJvcHMud29ya2luZ1NldHNTdG9yZTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzZWxlY3Rpb25JbmRleDogMCxcbiAgICAgIGFwcGxpY2FibGVEZWZpbml0aW9uczogd29ya2luZ1NldHNTdG9yZS5nZXRBcHBsaWNhYmxlRGVmaW5pdGlvbnMoKSxcbiAgICAgIG5vdEFwcGxpY2FibGVEZWZpbml0aW9uczogd29ya2luZ1NldHNTdG9yZS5nZXROb3RBcHBsaWNhYmxlRGVmaW5pdGlvbnMoKSxcbiAgICB9O1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgd29ya2luZ1NldHNTdG9yZS5zdWJzY3JpYmVUb0RlZmluaXRpb25zKGRlZmluaXRpb25zID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgYXBwbGljYWJsZURlZmluaXRpb25zOiBkZWZpbml0aW9ucy5hcHBsaWNhYmxlLFxuICAgICAgICAgIG5vdEFwcGxpY2FibGVEZWZpbml0aW9uczogZGVmaW5pdGlvbnMubm90QXBwbGljYWJsZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChkZWZpbml0aW9ucy5hcHBsaWNhYmxlLmxlbmd0aCArIGRlZmluaXRpb25zLm5vdEFwcGxpY2FibGUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcblxuICAgICh0aGlzOiBhbnkpLl9jaGVja0ZvY3VzID0gdGhpcy5fY2hlY2tGb2N1cy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl90b2dnbGVXb3JraW5nU2V0ID0gdGhpcy5fdG9nZ2xlV29ya2luZ1NldC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9zZXRTZWxlY3Rpb25JbmRleCA9IHRoaXMuX3NldFNlbGVjdGlvbkluZGV4LmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2RlbGV0ZVdvcmtpbmdTZXQgPSB0aGlzLl9kZWxldGVXb3JraW5nU2V0LmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgbm9kZS5mb2N1cygpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgIG5vZGUsXG4gICAgICB7XG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiAoKSA9PiB0aGlzLl9tb3ZlU2VsZWN0aW9uSW5kZXgoLTEpLFxuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PiB0aGlzLl9tb3ZlU2VsZWN0aW9uSW5kZXgoMSksXG4gICAgICAgICdjb3JlOmNvbmZpcm0nOiAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgZGVmID0gdGhpcy5zdGF0ZS5hcHBsaWNhYmxlRGVmaW5pdGlvbnNbdGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleF07XG4gICAgICAgICAgdGhpcy5fdG9nZ2xlV29ya2luZ1NldChkZWYubmFtZSwgZGVmLmFjdGl2ZSk7XG4gICAgICAgIH0sXG4gICAgICAgICdjb3JlOmNhbmNlbCc6IHRoaXMucHJvcHMub25DbG9zZSxcbiAgICAgIH1cbiAgICApKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzOiBQcm9wcywgbmV4dFN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICAgIGNvbnN0IGFwcGxpY2FibGVMZW5ndGggPSBuZXh0U3RhdGUuYXBwbGljYWJsZURlZmluaXRpb25zLmxlbmd0aDtcblxuICAgIGlmIChhcHBsaWNhYmxlTGVuZ3RoID4gMCkge1xuICAgICAgaWYgKG5leHRTdGF0ZS5zZWxlY3Rpb25JbmRleCA+PSBhcHBsaWNhYmxlTGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbkluZGV4OiBhcHBsaWNhYmxlTGVuZ3RoIC0gMX0pO1xuICAgICAgfSBlbHNlIGlmIChuZXh0U3RhdGUuc2VsZWN0aW9uSW5kZXggPCAwKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbkluZGV4OiAwfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBub2RlLmZvY3VzKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3QgYXBwbGljYWJsZURlZmluaXRpb25zID0gdGhpcy5zdGF0ZS5hcHBsaWNhYmxlRGVmaW5pdGlvbnMubWFwKChkZWYsIGluZGV4KSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8QXBwbGljYWJsZURlZmluaXRpb25MaW5lXG4gICAgICAgICAga2V5PXtkZWYubmFtZX1cbiAgICAgICAgICBkZWY9e2RlZn1cbiAgICAgICAgICBpbmRleD17aW5kZXh9XG4gICAgICAgICAgc2VsZWN0ZWQ9e2luZGV4ID09PSB0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4fVxuICAgICAgICAgIHRvZ2dsZVdvcmtpbmdTZXQ9e3RoaXMuX3RvZ2dsZVdvcmtpbmdTZXR9XG4gICAgICAgICAgb25TZWxlY3Q9e3RoaXMuX3NldFNlbGVjdGlvbkluZGV4fVxuICAgICAgICAgIG9uRGVsZXRlV29ya2luZ1NldD17dGhpcy5fZGVsZXRlV29ya2luZ1NldH1cbiAgICAgICAgICBvbkVkaXRXb3JraW5nU2V0PXt0aGlzLnByb3BzLm9uRWRpdFdvcmtpbmdTZXR9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgbGV0IG5vdEFwcGxpY2FibGVTZWN0aW9uO1xuICAgIGlmICh0aGlzLnN0YXRlLm5vdEFwcGxpY2FibGVEZWZpbml0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBub3RBcHBsaWNhYmxlRGVmaW5pdGlvbnMgPSB0aGlzLnN0YXRlLm5vdEFwcGxpY2FibGVEZWZpbml0aW9ucy5tYXAoZGVmID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8Tm9uQXBwbGljYWJsZURlZmluaXRpb25MaW5lXG4gICAgICAgICAgICBrZXk9e2RlZi5uYW1lfVxuICAgICAgICAgICAgZGVmPXtkZWZ9XG4gICAgICAgICAgICBvbkRlbGV0ZVdvcmtpbmdTZXQ9e3RoaXMuX2RlbGV0ZVdvcmtpbmdTZXR9XG4gICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICBub3RBcHBsaWNhYmxlU2VjdGlvbiA9IChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aHIgY2xhc3NOYW1lPVwibnVjbGlkZS1maWxlLXRyZWUtd29ya2luZy1zZXQtc2VwYXJhdG9yXCIgLz5cbiAgICAgICAgICA8c3Bhbj5UaGUgd29ya2luZyBzZXRzIGJlbG93IGFyZSBub3QgYXBwbGljYWJsZSB0byB5b3VyIGN1cnJlbnQgcHJvamVjdCBmb2xkZXJzPC9zcGFuPlxuICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJsaXN0LWdyb3VwXCI+XG4gICAgICAgICAgICB7bm90QXBwbGljYWJsZURlZmluaXRpb25zfVxuICAgICAgICAgIDwvb2w+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJzZWxlY3QtbGlzdFwiXG4gICAgICAgIHRhYkluZGV4PVwiMFwiXG4gICAgICAgIG9uQmx1cj17dGhpcy5fY2hlY2tGb2N1c30+XG4gICAgICAgIDxvbCBjbGFzc05hbWU9XCJsaXN0LWdyb3VwIG1hcmstYWN0aXZlXCI+XG4gICAgICAgICAge2FwcGxpY2FibGVEZWZpbml0aW9uc31cbiAgICAgICAgPC9vbD5cbiAgICAgICAge25vdEFwcGxpY2FibGVTZWN0aW9ufVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9tb3ZlU2VsZWN0aW9uSW5kZXgoc3RlcDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0aW9uSW5kZXg6IHRoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXggKyBzdGVwfSk7XG4gIH1cblxuICBfc2V0U2VsZWN0aW9uSW5kZXgoc2VsZWN0aW9uSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbkluZGV4fSk7XG4gIH1cblxuICBfY2hlY2tGb2N1cyhldmVudDogU3ludGhldGljRm9jdXNFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICAvLyBJZiB0aGUgbmV4dCBhY3RpdmUgZWxlbWVudCAoYGV2ZW50LnJlbGF0ZWRUYXJnZXRgKSBpcyBub3QgYSBkZXNjZW5kYW50IG9mIHRoaXMgbW9kYWwsIGNsb3NlXG4gICAgLy8gdGhlIG1vZGFsLlxuICAgIGlmICghbm9kZS5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgX3RvZ2dsZVdvcmtpbmdTZXQobmFtZTogc3RyaW5nLCBhY3RpdmU6IGJvb2xlYW4pIHtcbiAgICBpZiAoYWN0aXZlKSB7XG4gICAgICB0aGlzLnByb3BzLndvcmtpbmdTZXRzU3RvcmUuZGVhY3RpdmF0ZShuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wcy53b3JraW5nU2V0c1N0b3JlLmFjdGl2YXRlKG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIF9kZWxldGVXb3JraW5nU2V0KG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMud29ya2luZ1NldHNTdG9yZS5kZWxldGVXb3JraW5nU2V0KG5hbWUpO1xuICB9XG59XG5cbnR5cGUgQXBwbGljYWJsZURlZmluaXRpb25MaW5lUHJvcHMgPSB7XG4gIGRlZjogV29ya2luZ1NldERlZmluaXRpb247XG4gIGluZGV4OiBudW1iZXI7XG4gIHNlbGVjdGVkOiBib29sZWFuO1xuICB0b2dnbGVXb3JraW5nU2V0OiAobmFtZTogc3RyaW5nLCBhY3RpdmU6IGJvb2xlYW4pID0+IHZvaWQ7XG4gIG9uU2VsZWN0OiAoaW5kZXg6IG51bWJlcikgPT4gdm9pZDtcbiAgb25EZWxldGVXb3JraW5nU2V0OiAobmFtZTogc3RyaW5nKSA9PiB2b2lkO1xuICBvbkVkaXRXb3JraW5nU2V0OiAobmFtZTogc3RyaW5nLCB1cmlzOiBBcnJheTxzdHJpbmc+KSA9PiB2b2lkO1xufTtcblxuY2xhc3MgQXBwbGljYWJsZURlZmluaXRpb25MaW5lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IEFwcGxpY2FibGVEZWZpbml0aW9uTGluZVByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBBcHBsaWNhYmxlRGVmaW5pdGlvbkxpbmVQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgICh0aGlzOiBhbnkpLl9saW5lT25DbGljayA9IHRoaXMuX2xpbmVPbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2RlbGV0ZUJ1dHRvbk9uQ2xpY2sgPSB0aGlzLl9kZWxldGVCdXR0b25PbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2VkaXRCdXR0b25PbkNsaWNrID0gdGhpcy5fZWRpdEJ1dHRvbk9uQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCBjbGFzc2VzID0ge1xuICAgICAgYWN0aXZlOiB0aGlzLnByb3BzLmRlZi5hY3RpdmUsXG4gICAgICBzZWxlY3RlZDogdGhpcy5wcm9wcy5zZWxlY3RlZCxcbiAgICAgIGNsZWFyZml4OiB0cnVlLFxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGxpXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhjbGFzc2VzKX1cbiAgICAgICAgb25Nb3VzZU92ZXI9eygpID0+IHRoaXMucHJvcHMub25TZWxlY3QodGhpcy5wcm9wcy5pbmRleCl9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX2xpbmVPbkNsaWNrfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXAgcHVsbC1yaWdodFwiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBpY29uIGljb24tdHJhc2hjYW5cIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5fZGVsZXRlQnV0dG9uT25DbGlja31cbiAgICAgICAgICAgIHRhYkluZGV4PVwiLTFcIlxuICAgICAgICAgICAgdGl0bGU9XCJEZWxldGUgdGhpcyB3b3JraW5nIHNldFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gaWNvbiBpY29uLXBlbmNpbFwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9lZGl0QnV0dG9uT25DbGlja31cbiAgICAgICAgICAgIHRhYkluZGV4PVwiLTFcIlxuICAgICAgICAgICAgdGl0bGU9XCJFZGl0IHRoaXMgd29ya2luZyBzZXRcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8c3Bhbj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5kZWYubmFtZX1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgX2xpbmVPbkNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy50b2dnbGVXb3JraW5nU2V0KHRoaXMucHJvcHMuZGVmLm5hbWUsIHRoaXMucHJvcHMuZGVmLmFjdGl2ZSk7XG4gIH1cblxuICBfZGVsZXRlQnV0dG9uT25DbGljayhldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25EZWxldGVXb3JraW5nU2V0KHRoaXMucHJvcHMuZGVmLm5hbWUpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG5cbiAgX2VkaXRCdXR0b25PbkNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vbkVkaXRXb3JraW5nU2V0KHRoaXMucHJvcHMuZGVmLm5hbWUsIHRoaXMucHJvcHMuZGVmLnVyaXMpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG59XG5cbnR5cGUgTm9uQXBwbGljYWJsZURlZmluaXRpb25MaW5lUHJvcHMgPSB7XG4gIGRlZjogV29ya2luZ1NldERlZmluaXRpb247XG4gIG9uRGVsZXRlV29ya2luZ1NldDogKG5hbWU6IHN0cmluZykgPT4gdm9pZDtcbn07XG5cbmNsYXNzIE5vbkFwcGxpY2FibGVEZWZpbml0aW9uTGluZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBOb25BcHBsaWNhYmxlRGVmaW5pdGlvbkxpbmVQcm9wcztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogTm9uQXBwbGljYWJsZURlZmluaXRpb25MaW5lUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAodGhpczogYW55KS5fZGVsZXRlQnV0dG9uT25DbGljayA9IHRoaXMuX2RlbGV0ZUJ1dHRvbk9uQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGxpIGNsYXNzTmFtZT1cImNsZWFyZml4XCI+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzc05hbWU9XCJidG4gaWNvbiBpY29uLXRyYXNoY2FuIHB1bGwtcmlnaHRcIlxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2RlbGV0ZUJ1dHRvbk9uQ2xpY2t9XG4gICAgICAgICAgdGFiSW5kZXg9XCItMVwiXG4gICAgICAgICAgdGl0bGU9XCJEZWxldGUgdGhpcyB3b3JraW5nIHNldFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc3VidGxlXCI+XG4gICAgICAgICAge3RoaXMucHJvcHMuZGVmLm5hbWV9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgfVxuXG4gIF9kZWxldGVCdXR0b25PbkNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vbkRlbGV0ZVdvcmtpbmdTZXQodGhpcy5wcm9wcy5kZWYubmFtZSk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cbiJdfQ==