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

var WorkingSetSelectionComponent = (function (_React$Component) {
  _inherits(WorkingSetSelectionComponent, _React$Component);

  function WorkingSetSelectionComponent(props) {
    var _this = this;

    _classCallCheck(this, WorkingSetSelectionComponent);

    _get(Object.getPrototypeOf(WorkingSetSelectionComponent.prototype), 'constructor', this).call(this, props);

    var workingSetsStore = props.workingSetsStore;

    this.state = {
      selectionIndex: 0,
      definitions: workingSetsStore.getDefinitions() || []
    };

    this._disposables = new _atom.CompositeDisposable();

    this._disposables.add(workingSetsStore.subscribeToDefinitions(function (definitions) {
      _this.setState({ definitions: definitions });
      if (definitions.length === 0) {
        _this.props.onClose();
      }
    }));

    this._lostFocus = this._lostFocus.bind(this);
    this._checkFocus = this._checkFocus.bind(this);
    this._renderDefinition = this._renderDefinition.bind(this);
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
          var def = _this2.state.definitions[_this2.state.selectionIndex];
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
      if (nextState.selectionIndex >= nextState.definitions.length) {
        this.setState({ selectionIndex: nextState.definitions.length - 1 });
      } else if (nextState.selectionIndex < 0) {
        this.setState({ selectionIndex: 0 });
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
      return _reactForAtom.React.createElement(
        'div',
        {
          className: 'select-list',
          tabIndex: '0',
          onBlur: this._lostFocus },
        _reactForAtom.React.createElement(
          'ol',
          { className: 'list-group mark-active' },
          this.state.definitions.map(this._renderDefinition)
        )
      );
    }
  }, {
    key: '_renderDefinition',
    value: function _renderDefinition(def, index) {
      var _this3 = this;

      var classes = {
        active: def.active,
        selected: index === this.state.selectionIndex,
        clearfix: true
      };

      return _reactForAtom.React.createElement(
        'li',
        {
          className: (0, _classnames2['default'])(classes),
          onMouseOver: function () {
            return _this3.setState({ selectionIndex: index });
          },
          onClick: function () {
            return _this3._toggleWorkingSet(def.name, def.active);
          },
          key: def.name },
        _reactForAtom.React.createElement(
          'div',
          { className: 'btn-group pull-right' },
          _reactForAtom.React.createElement('button', {
            className: 'btn icon icon-trashcan',
            onClick: function (event) {
              _this3.props.workingSetsStore.deleteWorkingSet(def.name);
              event.stopPropagation();
            },
            tabIndex: '-1'
          }),
          _reactForAtom.React.createElement('button', {
            className: 'btn icon icon-pencil',
            tabIndex: '-1',
            onClick: function (event) {
              _this3.props.onEditWorkingSet(def.name, def.uris);
              event.stopPropagation();
            },
            onBlur: this._lostFocus
          })
        ),
        _reactForAtom.React.createElement(
          'span',
          null,
          def.name
        )
      );
    }
  }, {
    key: '_moveSelectionIndex',
    value: function _moveSelectionIndex(step) {
      this.setState({ selectionIndex: this.state.selectionIndex + step });
    }
  }, {
    key: '_lostFocus',
    value: function _lostFocus() {
      setImmediate(this._checkFocus);
    }
  }, {
    key: '_checkFocus',
    value: function _checkFocus() {
      var node = _reactForAtom.ReactDOM.findDOMNode(this);
      var element = document.activeElement;
      while (element != null) {
        if (element === node) {
          return;
        }

        element = element.parentElement;
      }

      this.props.onClose();
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
  }]);

  return WorkingSetSelectionComponent;
})(_reactForAtom.React.Component);

exports.WorkingSetSelectionComponent = WorkingSetSelectionComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXRTZWxlY3Rpb25Db21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWE4QixnQkFBZ0I7O29CQUNaLE1BQU07OzBCQUNqQixZQUFZOzs7O0lBaUJ0Qiw0QkFBNEI7WUFBNUIsNEJBQTRCOztBQUs1QixXQUxBLDRCQUE0QixDQUszQixLQUFZLEVBQUU7OzswQkFMZiw0QkFBNEI7O0FBTXJDLCtCQU5TLDRCQUE0Qiw2Q0FNL0IsS0FBSyxFQUFFOztBQUViLFFBQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDOztBQUVoRCxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsb0JBQWMsRUFBRSxDQUFDO0FBQ2pCLGlCQUFXLEVBQUUsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRTtLQUNyRCxDQUFDOztBQUVGLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7O0FBRTlDLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUNyRCxZQUFLLFFBQVEsQ0FBQyxFQUFDLFdBQVcsRUFBWCxXQUFXLEVBQUMsQ0FBQyxDQUFDO0FBQzdCLFVBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDNUIsY0FBSyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdEI7S0FDRixDQUFDLENBQ0gsQ0FBQzs7QUFFRixBQUFDLFFBQUksQ0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEQsQUFBQyxRQUFJLENBQU8sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RELEFBQUMsUUFBSSxDQUFPLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJ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QWUsRUFBRTtBQUMvQyxVQUFJLE1BQU0sRUFBRTtBQUNWLFlBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzlDLE1BQU07QUFDTCxZQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM1QztLQUNGOzs7U0FuSlUsNEJBQTRCO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJXb3JraW5nU2V0U2VsZWN0aW9uQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyplc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbmltcG9ydCB7UmVhY3QsIFJlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0RGVmaW5pdGlvbn0gZnJvbSAnLi4vLi4vd29ya2luZy1zZXRzJztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi93b3JraW5nLXNldHMvbGliL1dvcmtpbmdTZXRzU3RvcmUnO1xuXG5cbnR5cGUgUHJvcHMgPSB7XG4gIHdvcmtpbmdTZXRzU3RvcmU6IFdvcmtpbmdTZXRzU3RvcmU7XG4gIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG4gIG9uRWRpdFdvcmtpbmdTZXQ6IChuYW1lOiBzdHJpbmcsIHVyaXM6IEFycmF5PHN0cmluZz4pID0+IHZvaWQ7XG59O1xuXG50eXBlIFN0YXRlID0ge1xuICBzZWxlY3Rpb25JbmRleDogbnVtYmVyO1xuICBkZWZpbml0aW9uczogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+O1xufTtcblxuZXhwb3J0IGNsYXNzIFdvcmtpbmdTZXRTZWxlY3Rpb25Db21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIGNvbnN0IHdvcmtpbmdTZXRzU3RvcmUgPSBwcm9wcy53b3JraW5nU2V0c1N0b3JlO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNlbGVjdGlvbkluZGV4OiAwLFxuICAgICAgZGVmaW5pdGlvbnM6IHdvcmtpbmdTZXRzU3RvcmUuZ2V0RGVmaW5pdGlvbnMoKSB8fCBbXSxcbiAgICB9O1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgd29ya2luZ1NldHNTdG9yZS5zdWJzY3JpYmVUb0RlZmluaXRpb25zKGRlZmluaXRpb25zID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGVmaW5pdGlvbnN9KTtcbiAgICAgICAgaWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG5cbiAgICAodGhpczogYW55KS5fbG9zdEZvY3VzID0gdGhpcy5fbG9zdEZvY3VzLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2NoZWNrRm9jdXMgPSB0aGlzLl9jaGVja0ZvY3VzLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3JlbmRlckRlZmluaXRpb24gPSB0aGlzLl9yZW5kZXJEZWZpbml0aW9uLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgbm9kZS5mb2N1cygpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgIG5vZGUsXG4gICAgICB7XG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiAoKSA9PiB0aGlzLl9tb3ZlU2VsZWN0aW9uSW5kZXgoLTEpLFxuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiAoKSA9PiB0aGlzLl9tb3ZlU2VsZWN0aW9uSW5kZXgoMSksXG4gICAgICAgICdjb3JlOmNvbmZpcm0nOiAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgZGVmID0gdGhpcy5zdGF0ZS5kZWZpbml0aW9uc1t0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4XTtcbiAgICAgICAgICB0aGlzLl90b2dnbGVXb3JraW5nU2V0KGRlZi5uYW1lLCBkZWYuYWN0aXZlKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ2NvcmU6Y2FuY2VsJzogdGhpcy5wcm9wcy5vbkNsb3NlLFxuICAgICAgfVxuICAgICkpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVwZGF0ZShuZXh0UHJvcHM6IFByb3BzLCBuZXh0U3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gICAgaWYgKG5leHRTdGF0ZS5zZWxlY3Rpb25JbmRleCA+PSBuZXh0U3RhdGUuZGVmaW5pdGlvbnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3Rpb25JbmRleDogbmV4dFN0YXRlLmRlZmluaXRpb25zLmxlbmd0aCAtIDF9KTtcbiAgICB9IGVsc2UgaWYgKG5leHRTdGF0ZS5zZWxlY3Rpb25JbmRleCA8IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbkluZGV4OiAwfSk7XG4gICAgfVxuXG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIG5vZGUuZm9jdXMoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJzZWxlY3QtbGlzdFwiXG4gICAgICAgIHRhYkluZGV4PVwiMFwiXG4gICAgICAgIG9uQmx1cj17dGhpcy5fbG9zdEZvY3VzfT5cblxuICAgICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC1ncm91cCBtYXJrLWFjdGl2ZVwiPlxuICAgICAgICAgIHt0aGlzLnN0YXRlLmRlZmluaXRpb25zLm1hcCh0aGlzLl9yZW5kZXJEZWZpbml0aW9uKX1cbiAgICAgICAgPC9vbD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRGVmaW5pdGlvbihkZWY6IFdvcmtpbmdTZXREZWZpbml0aW9uLCBpbmRleDogbnVtYmVyKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3QgY2xhc3NlcyA9IHtcbiAgICAgIGFjdGl2ZTogZGVmLmFjdGl2ZSxcbiAgICAgIHNlbGVjdGVkOiBpbmRleCA9PT0gdGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleCxcbiAgICAgIGNsZWFyZml4OiB0cnVlLFxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGxpXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhjbGFzc2VzKX1cbiAgICAgICAgb25Nb3VzZU92ZXI9eygpID0+IHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbkluZGV4OiBpbmRleH0pfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLl90b2dnbGVXb3JraW5nU2V0KGRlZi5uYW1lLCBkZWYuYWN0aXZlKX1cbiAgICAgICAga2V5PXtkZWYubmFtZX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIHB1bGwtcmlnaHRcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gaWNvbiBpY29uLXRyYXNoY2FuXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e2V2ZW50ID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5wcm9wcy53b3JraW5nU2V0c1N0b3JlLmRlbGV0ZVdvcmtpbmdTZXQoZGVmLm5hbWUpO1xuICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICB0YWJJbmRleD1cIi0xXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBpY29uIGljb24tcGVuY2lsXCJcbiAgICAgICAgICAgIHRhYkluZGV4PVwiLTFcIlxuICAgICAgICAgICAgb25DbGljaz17ZXZlbnQgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRWRpdFdvcmtpbmdTZXQoZGVmLm5hbWUsIGRlZi51cmlzKTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25CbHVyPXt0aGlzLl9sb3N0Rm9jdXN9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxzcGFuPlxuICAgICAgICAgIHtkZWYubmFtZX1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgX21vdmVTZWxlY3Rpb25JbmRleChzdGVwOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3Rpb25JbmRleDogdGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleCArIHN0ZXB9KTtcbiAgfVxuXG4gIF9sb3N0Rm9jdXMoKTogdm9pZCB7XG4gICAgc2V0SW1tZWRpYXRlKHRoaXMuX2NoZWNrRm9jdXMpO1xuICB9XG5cbiAgX2NoZWNrRm9jdXMoKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICB3aGlsZSAoZWxlbWVudCAhPSBudWxsKSB7XG4gICAgICBpZiAoZWxlbWVudCA9PT0gbm9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gIH1cblxuICBfdG9nZ2xlV29ya2luZ1NldChuYW1lOiBzdHJpbmcsIGFjdGl2ZTogYm9vbGVhbikge1xuICAgIGlmIChhY3RpdmUpIHtcbiAgICAgIHRoaXMucHJvcHMud29ya2luZ1NldHNTdG9yZS5kZWFjdGl2YXRlKG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3BzLndvcmtpbmdTZXRzU3RvcmUuYWN0aXZhdGUobmFtZSk7XG4gICAgfVxuICB9XG59XG4iXX0=