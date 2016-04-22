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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideUiLibButtonGroup = require('../../nuclide-ui/lib/ButtonGroup');

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
          _nuclideUiLibButtonGroup.ButtonGroup,
          { className: 'pull-right' },
          _reactForAtom.React.createElement(_nuclideUiLibButton.Button, {
            icon: 'trashcan',
            onClick: this._deleteButtonOnClick,
            tabIndex: '-1',
            title: 'Delete this working set'
          }),
          _reactForAtom.React.createElement(_nuclideUiLibButton.Button, {
            icon: 'pencil',
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
        _reactForAtom.React.createElement(_nuclideUiLibButton.Button, {
          className: 'pull-right',
          icon: 'trashcan',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXRTZWxlY3Rpb25Db21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQkFjdUIsWUFBWTs7OztvQkFDRCxNQUFNOzs0QkFDVixnQkFBZ0I7O2tDQUN6Qiw2QkFBNkI7O3VDQUN4QixrQ0FBa0M7O0lBYy9DLDRCQUE0QjtZQUE1Qiw0QkFBNEI7O0FBSzVCLFdBTEEsNEJBQTRCLENBSzNCLEtBQVksRUFBRTs7OzBCQUxmLDRCQUE0Qjs7QUFNckMsK0JBTlMsNEJBQTRCLDZDQU0vQixLQUFLLEVBQUU7O0FBRWIsUUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7O0FBRWhELFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxvQkFBYyxFQUFFLENBQUM7QUFDakIsMkJBQXFCLEVBQUUsZ0JBQWdCLENBQUMsd0JBQXdCLEVBQUU7QUFDbEUsOEJBQXdCLEVBQUUsZ0JBQWdCLENBQUMsMkJBQTJCLEVBQUU7S0FDekUsQ0FBQzs7QUFFRixRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDOztBQUU5QyxRQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FDbkIsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDckQsWUFBSyxRQUFRLENBQUM7QUFDWiw2QkFBcUIsRUFBRSxXQUFXLENBQUMsVUFBVTtBQUM3QyxnQ0FBd0IsRUFBRSxXQUFXLENBQUMsYUFBYTtPQUNwRCxDQUFDLENBQUM7QUFDSCxVQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMxRSxjQUFLLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN0QjtLQUNGLENBQUMsQ0FDSCxDQUFDOztBQUVGLEFBQUMsUUFBSSxDQUFPLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJ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bCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXREZWZpbml0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXdvcmtpbmctc2V0cyc7XG5pbXBvcnQgdHlwZSB7V29ya2luZ1NldHNTdG9yZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS13b3JraW5nLXNldHMvbGliL1dvcmtpbmdTZXRzU3RvcmUnO1xuXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0LCBSZWFjdERPTX0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtCdXR0b259IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbic7XG5pbXBvcnQge0J1dHRvbkdyb3VwfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b25Hcm91cCc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHdvcmtpbmdTZXRzU3RvcmU6IFdvcmtpbmdTZXRzU3RvcmU7XG4gIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG4gIG9uRWRpdFdvcmtpbmdTZXQ6IChuYW1lOiBzdHJpbmcsIHVyaXM6IEFycmF5PHN0cmluZz4pID0+IHZvaWQ7XG59O1xuXG50eXBlIFN0YXRlID0ge1xuICBzZWxlY3Rpb25JbmRleDogbnVtYmVyO1xuICBhcHBsaWNhYmxlRGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPjtcbiAgbm90QXBwbGljYWJsZURlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj47XG59O1xuXG5leHBvcnQgY2xhc3MgV29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgY29uc3Qgd29ya2luZ1NldHNTdG9yZSA9IHByb3BzLndvcmtpbmdTZXRzU3RvcmU7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2VsZWN0aW9uSW5kZXg6IDAsXG4gICAgICBhcHBsaWNhYmxlRGVmaW5pdGlvbnM6IHdvcmtpbmdTZXRzU3RvcmUuZ2V0QXBwbGljYWJsZURlZmluaXRpb25zKCksXG4gICAgICBub3RBcHBsaWNhYmxlRGVmaW5pdGlvbnM6IHdvcmtpbmdTZXRzU3RvcmUuZ2V0Tm90QXBwbGljYWJsZURlZmluaXRpb25zKCksXG4gICAgfTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIHdvcmtpbmdTZXRzU3RvcmUuc3Vic2NyaWJlVG9EZWZpbml0aW9ucyhkZWZpbml0aW9ucyA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGFwcGxpY2FibGVEZWZpbml0aW9uczogZGVmaW5pdGlvbnMuYXBwbGljYWJsZSxcbiAgICAgICAgICBub3RBcHBsaWNhYmxlRGVmaW5pdGlvbnM6IGRlZmluaXRpb25zLm5vdEFwcGxpY2FibGUsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZGVmaW5pdGlvbnMuYXBwbGljYWJsZS5sZW5ndGggKyBkZWZpbml0aW9ucy5ub3RBcHBsaWNhYmxlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG5cbiAgICAodGhpczogYW55KS5fY2hlY2tGb2N1cyA9IHRoaXMuX2NoZWNrRm9jdXMuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdG9nZ2xlV29ya2luZ1NldCA9IHRoaXMuX3RvZ2dsZVdvcmtpbmdTZXQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fc2V0U2VsZWN0aW9uSW5kZXggPSB0aGlzLl9zZXRTZWxlY3Rpb25JbmRleC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9kZWxldGVXb3JraW5nU2V0ID0gdGhpcy5fZGVsZXRlV29ya2luZ1NldC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIG5vZGUuZm9jdXMoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICBub2RlLFxuICAgICAge1xuICAgICAgICAnY29yZTptb3ZlLXVwJzogKCkgPT4gdGhpcy5fbW92ZVNlbGVjdGlvbkluZGV4KC0xKSxcbiAgICAgICAgJ2NvcmU6bW92ZS1kb3duJzogKCkgPT4gdGhpcy5fbW92ZVNlbGVjdGlvbkluZGV4KDEpLFxuICAgICAgICAnY29yZTpjb25maXJtJzogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGRlZiA9IHRoaXMuc3RhdGUuYXBwbGljYWJsZURlZmluaXRpb25zW3RoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXhdO1xuICAgICAgICAgIHRoaXMuX3RvZ2dsZVdvcmtpbmdTZXQoZGVmLm5hbWUsIGRlZi5hY3RpdmUpO1xuICAgICAgICB9LFxuICAgICAgICAnY29yZTpjYW5jZWwnOiB0aGlzLnByb3BzLm9uQ2xvc2UsXG4gICAgICB9XG4gICAgKSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVXBkYXRlKG5leHRQcm9wczogUHJvcHMsIG5leHRTdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgICBjb25zdCBhcHBsaWNhYmxlTGVuZ3RoID0gbmV4dFN0YXRlLmFwcGxpY2FibGVEZWZpbml0aW9ucy5sZW5ndGg7XG5cbiAgICBpZiAoYXBwbGljYWJsZUxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChuZXh0U3RhdGUuc2VsZWN0aW9uSW5kZXggPj0gYXBwbGljYWJsZUxlbmd0aCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3Rpb25JbmRleDogYXBwbGljYWJsZUxlbmd0aCAtIDF9KTtcbiAgICAgIH0gZWxzZSBpZiAobmV4dFN0YXRlLnNlbGVjdGlvbkluZGV4IDwgMCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3Rpb25JbmRleDogMH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgbm9kZS5mb2N1cygpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IGFwcGxpY2FibGVEZWZpbml0aW9ucyA9IHRoaXMuc3RhdGUuYXBwbGljYWJsZURlZmluaXRpb25zLm1hcCgoZGVmLCBpbmRleCkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPEFwcGxpY2FibGVEZWZpbml0aW9uTGluZVxuICAgICAgICAgIGtleT17ZGVmLm5hbWV9XG4gICAgICAgICAgZGVmPXtkZWZ9XG4gICAgICAgICAgaW5kZXg9e2luZGV4fVxuICAgICAgICAgIHNlbGVjdGVkPXtpbmRleCA9PT0gdGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleH1cbiAgICAgICAgICB0b2dnbGVXb3JraW5nU2V0PXt0aGlzLl90b2dnbGVXb3JraW5nU2V0fVxuICAgICAgICAgIG9uU2VsZWN0PXt0aGlzLl9zZXRTZWxlY3Rpb25JbmRleH1cbiAgICAgICAgICBvbkRlbGV0ZVdvcmtpbmdTZXQ9e3RoaXMuX2RlbGV0ZVdvcmtpbmdTZXR9XG4gICAgICAgICAgb25FZGl0V29ya2luZ1NldD17dGhpcy5wcm9wcy5vbkVkaXRXb3JraW5nU2V0fVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGxldCBub3RBcHBsaWNhYmxlU2VjdGlvbjtcbiAgICBpZiAodGhpcy5zdGF0ZS5ub3RBcHBsaWNhYmxlRGVmaW5pdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgbm90QXBwbGljYWJsZURlZmluaXRpb25zID0gdGhpcy5zdGF0ZS5ub3RBcHBsaWNhYmxlRGVmaW5pdGlvbnMubWFwKGRlZiA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPE5vbkFwcGxpY2FibGVEZWZpbml0aW9uTGluZVxuICAgICAgICAgICAga2V5PXtkZWYubmFtZX1cbiAgICAgICAgICAgIGRlZj17ZGVmfVxuICAgICAgICAgICAgb25EZWxldGVXb3JraW5nU2V0PXt0aGlzLl9kZWxldGVXb3JraW5nU2V0fVxuICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgbm90QXBwbGljYWJsZVNlY3Rpb24gPSAoXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGhyIGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlLXdvcmtpbmctc2V0LXNlcGFyYXRvclwiIC8+XG4gICAgICAgICAgPHNwYW4+VGhlIHdvcmtpbmcgc2V0cyBiZWxvdyBhcmUgbm90IGFwcGxpY2FibGUgdG8geW91ciBjdXJyZW50IHByb2plY3QgZm9sZGVyczwvc3Bhbj5cbiAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAgICAge25vdEFwcGxpY2FibGVEZWZpbml0aW9uc31cbiAgICAgICAgICA8L29sPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwic2VsZWN0LWxpc3RcIlxuICAgICAgICB0YWJJbmRleD1cIjBcIlxuICAgICAgICBvbkJsdXI9e3RoaXMuX2NoZWNrRm9jdXN9PlxuICAgICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC1ncm91cCBtYXJrLWFjdGl2ZVwiPlxuICAgICAgICAgIHthcHBsaWNhYmxlRGVmaW5pdGlvbnN9XG4gICAgICAgIDwvb2w+XG4gICAgICAgIHtub3RBcHBsaWNhYmxlU2VjdGlvbn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfbW92ZVNlbGVjdGlvbkluZGV4KHN0ZXA6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbkluZGV4OiB0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4ICsgc3RlcH0pO1xuICB9XG5cbiAgX3NldFNlbGVjdGlvbkluZGV4KHNlbGVjdGlvbkluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3Rpb25JbmRleH0pO1xuICB9XG5cbiAgX2NoZWNrRm9jdXMoZXZlbnQ6IFN5bnRoZXRpY0ZvY3VzRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgLy8gSWYgdGhlIG5leHQgYWN0aXZlIGVsZW1lbnQgKGBldmVudC5yZWxhdGVkVGFyZ2V0YCkgaXMgbm90IGEgZGVzY2VuZGFudCBvZiB0aGlzIG1vZGFsLCBjbG9zZVxuICAgIC8vIHRoZSBtb2RhbC5cbiAgICBpZiAoIW5vZGUuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCkpIHtcbiAgICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIF90b2dnbGVXb3JraW5nU2V0KG5hbWU6IHN0cmluZywgYWN0aXZlOiBib29sZWFuKSB7XG4gICAgaWYgKGFjdGl2ZSkge1xuICAgICAgdGhpcy5wcm9wcy53b3JraW5nU2V0c1N0b3JlLmRlYWN0aXZhdGUobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHMud29ya2luZ1NldHNTdG9yZS5hY3RpdmF0ZShuYW1lKTtcbiAgICB9XG4gIH1cblxuICBfZGVsZXRlV29ya2luZ1NldChuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLndvcmtpbmdTZXRzU3RvcmUuZGVsZXRlV29ya2luZ1NldChuYW1lKTtcbiAgfVxufVxuXG50eXBlIEFwcGxpY2FibGVEZWZpbml0aW9uTGluZVByb3BzID0ge1xuICBkZWY6IFdvcmtpbmdTZXREZWZpbml0aW9uO1xuICBpbmRleDogbnVtYmVyO1xuICBzZWxlY3RlZDogYm9vbGVhbjtcbiAgdG9nZ2xlV29ya2luZ1NldDogKG5hbWU6IHN0cmluZywgYWN0aXZlOiBib29sZWFuKSA9PiB2b2lkO1xuICBvblNlbGVjdDogKGluZGV4OiBudW1iZXIpID0+IHZvaWQ7XG4gIG9uRGVsZXRlV29ya2luZ1NldDogKG5hbWU6IHN0cmluZykgPT4gdm9pZDtcbiAgb25FZGl0V29ya2luZ1NldDogKG5hbWU6IHN0cmluZywgdXJpczogQXJyYXk8c3RyaW5nPikgPT4gdm9pZDtcbn07XG5cbmNsYXNzIEFwcGxpY2FibGVEZWZpbml0aW9uTGluZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBBcHBsaWNhYmxlRGVmaW5pdGlvbkxpbmVQcm9wcztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogQXBwbGljYWJsZURlZmluaXRpb25MaW5lUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAodGhpczogYW55KS5fbGluZU9uQ2xpY2sgPSB0aGlzLl9saW5lT25DbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9kZWxldGVCdXR0b25PbkNsaWNrID0gdGhpcy5fZGVsZXRlQnV0dG9uT25DbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9lZGl0QnV0dG9uT25DbGljayA9IHRoaXMuX2VkaXRCdXR0b25PbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3QgY2xhc3NlcyA9IHtcbiAgICAgIGFjdGl2ZTogdGhpcy5wcm9wcy5kZWYuYWN0aXZlLFxuICAgICAgc2VsZWN0ZWQ6IHRoaXMucHJvcHMuc2VsZWN0ZWQsXG4gICAgICBjbGVhcmZpeDogdHJ1ZSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxsaVxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoY2xhc3Nlcyl9XG4gICAgICAgIG9uTW91c2VPdmVyPXsoKSA9PiB0aGlzLnByb3BzLm9uU2VsZWN0KHRoaXMucHJvcHMuaW5kZXgpfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9saW5lT25DbGlja30+XG4gICAgICAgIDxCdXR0b25Hcm91cCBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0XCI+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgaWNvbj1cInRyYXNoY2FuXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2RlbGV0ZUJ1dHRvbk9uQ2xpY2t9XG4gICAgICAgICAgICB0YWJJbmRleD1cIi0xXCJcbiAgICAgICAgICAgIHRpdGxlPVwiRGVsZXRlIHRoaXMgd29ya2luZyBzZXRcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgaWNvbj1cInBlbmNpbFwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9lZGl0QnV0dG9uT25DbGlja31cbiAgICAgICAgICAgIHRhYkluZGV4PVwiLTFcIlxuICAgICAgICAgICAgdGl0bGU9XCJFZGl0IHRoaXMgd29ya2luZyBzZXRcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvQnV0dG9uR3JvdXA+XG4gICAgICAgIDxzcGFuPlxuICAgICAgICAgIHt0aGlzLnByb3BzLmRlZi5uYW1lfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2xpPlxuICAgICk7XG4gIH1cblxuICBfbGluZU9uQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLnRvZ2dsZVdvcmtpbmdTZXQodGhpcy5wcm9wcy5kZWYubmFtZSwgdGhpcy5wcm9wcy5kZWYuYWN0aXZlKTtcbiAgfVxuXG4gIF9kZWxldGVCdXR0b25PbkNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vbkRlbGV0ZVdvcmtpbmdTZXQodGhpcy5wcm9wcy5kZWYubmFtZSk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cblxuICBfZWRpdEJ1dHRvbk9uQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uRWRpdFdvcmtpbmdTZXQodGhpcy5wcm9wcy5kZWYubmFtZSwgdGhpcy5wcm9wcy5kZWYudXJpcyk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cblxudHlwZSBOb25BcHBsaWNhYmxlRGVmaW5pdGlvbkxpbmVQcm9wcyA9IHtcbiAgZGVmOiBXb3JraW5nU2V0RGVmaW5pdGlvbjtcbiAgb25EZWxldGVXb3JraW5nU2V0OiAobmFtZTogc3RyaW5nKSA9PiB2b2lkO1xufTtcblxuY2xhc3MgTm9uQXBwbGljYWJsZURlZmluaXRpb25MaW5lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IE5vbkFwcGxpY2FibGVEZWZpbml0aW9uTGluZVByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBOb25BcHBsaWNhYmxlRGVmaW5pdGlvbkxpbmVQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgICh0aGlzOiBhbnkpLl9kZWxldGVCdXR0b25PbkNsaWNrID0gdGhpcy5fZGVsZXRlQnV0dG9uT25DbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8bGkgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIj5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT1cInB1bGwtcmlnaHRcIlxuICAgICAgICAgIGljb249XCJ0cmFzaGNhblwiXG4gICAgICAgICAgb25DbGljaz17dGhpcy5fZGVsZXRlQnV0dG9uT25DbGlja31cbiAgICAgICAgICB0YWJJbmRleD1cIi0xXCJcbiAgICAgICAgICB0aXRsZT1cIkRlbGV0ZSB0aGlzIHdvcmtpbmcgc2V0XCJcbiAgICAgICAgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zdWJ0bGVcIj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5kZWYubmFtZX1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgX2RlbGV0ZUJ1dHRvbk9uQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uRGVsZXRlV29ya2luZ1NldCh0aGlzLnByb3BzLmRlZi5uYW1lKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxufVxuIl19