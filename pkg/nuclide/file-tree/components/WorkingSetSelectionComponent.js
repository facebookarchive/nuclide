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
        'file-tree:workset-select-up': function fileTreeWorksetSelectUp() {
          return _this2._moveSelectionIndex(-1);
        },
        'file-tree:workset-select-down': function fileTreeWorksetSelectDown() {
          return _this2._moveSelectionIndex(1);
        },
        'file-tree:workset-select-toggle': function fileTreeWorksetSelectToggle() {
          var def = _this2.state.definitions[_this2.state.selectionIndex];
          _this2._toggleWorkingSet(def.name, def.active);
        },
        'file-tree:workset-select-close': this.props.onClose
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
          className: 'nuclide-file-tree-working-set-selection-panel padded',
          tabIndex: '0',
          onBlur: this._lostFocus },
        _reactForAtom.React.createElement(
          'div',
          { className: 'select-list' },
          _reactForAtom.React.createElement(
            'ol',
            { className: 'list-group mark-active' },
            this.state.definitions.map(this._renderDefinition)
          )
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
          { className: 'btn-group btn-group-xs pull-right' },
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'inline-block-tight btn',
              onClick: function (event) {
                _this3.props.workingSetsStore.deleteWorkingSet(def.name);
                event.stopPropagation();
              },
              tabIndex: '-1' },
            _reactForAtom.React.createElement('span', { className: 'icon icon-trashcan' })
          ),
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'inline-block-tight btn',
              onClick: function (event) {
                _this3.props.onEditWorkingSet(def.name, def.uris);
                event.stopPropagation();
              },
              onBlur: this._lostFocus },
            _reactForAtom.React.createElement('span', { className: 'icon icon-pencil' })
          )
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXRTZWxlY3Rpb25Db21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWE4QixnQkFBZ0I7O29CQUNaLE1BQU07OzBCQUNqQixZQUFZOzs7O0lBaUJ0Qiw0QkFBNEI7WUFBNUIsNEJBQTRCOztBQUs1QixXQUxBLDRCQUE0QixDQUszQixLQUFZLEVBQUU7OzswQkFMZiw0QkFBNEI7O0FBTXJDLCtCQU5TLDRCQUE0Qiw2Q0FNL0IsS0FBSyxFQUFFOztBQUViLFFBQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDOztBQUVoRCxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsb0JBQWMsRUFBRSxDQUFDO0FBQ2pCLGlCQUFXLEVBQUUsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRTtLQUNyRCxDQUFDOztBQUVGLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQXlCLENBQUM7O0FBRTlDLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUNyRCxZQUFLLFFBQVEsQ0FBQyxFQUFDLFdBQVcsRUFBWCxXQUFXLEVBQUMsQ0FBQyxDQUFDO0FBQzdCLFVBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDNUIsY0FBSyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdEI7S0FDRixDQUFDLENBQ0gsQ0FBQzs7QUFFRixBQUFDLFFBQUksQ0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEQsQUFBQyxRQUFJLENBQU8sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RELEFBQUMsUUFBSSxDQUFPLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDbkU7O2VBN0JVLDRCQUE0Qjs7V0ErQnRCLDZCQUFTOzs7QUFDeEIsVUFBTSxJQUFJLEdBQUcsdUJBQVMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hDLFVBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNiLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNyQyxJQUFJLEVBQ0o7QUFDRSxxQ0FBNkIsRUFBRTtpQkFBTSxPQUFLLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQUE7QUFDakUsdUNBQStCLEVBQUU7aUJBQU0sT0FBSyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7U0FBQTtBQUNsRSx5Q0FBaUMsRUFBRSx1Q0FBTTtBQUN2QyxjQUFNLEdBQUcsR0FBRyxPQUFLLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBSyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUQsaUJBQUssaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDOUM7QUFDRCx3Q0FBZ0MsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87T0FDckQsQ0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRW1CLGdDQUFTO0FBQzNCLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVrQiw2QkFBQyxTQUFnQixFQUFFLFNBQWdCLEVBQVE7QUFDNUQsVUFBSSxTQUFTLENBQUMsY0FBYyxJQUFJLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQzVELFlBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQztPQUNuRSxNQUFNLElBQUksU0FBUyxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQUU7QUFDdkMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO09BQ3BDO0tBRUY7OztXQUVpQiw4QkFBUztBQUN6QixVQUFNLElBQUksR0FBRyx1QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7OztXQUVLLGtCQUFrQjtBQUN0QixhQUNFOzs7QUFDRSxtQkFBUyxFQUFDLHNEQUFzRDtBQUNoRSxrQkFBUSxFQUFDLEdBQUc7QUFDWixnQkFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLEFBQUM7UUFDeEI7O1lBQUssU0FBUyxFQUFDLGFBQWE7VUFDMUI7O2NBQUksU0FBUyxFQUFDLHdCQUF3QjtZQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1dBQ2hEO1NBQ0Q7T0FDRixDQUNOO0tBQ0g7OztXQUVnQiwyQkFBQyxHQUF5QixFQUFFLEtBQWEsRUFBaUI7OztBQUN6RSxVQUFNLE9BQU8sR0FBRztBQUNkLGNBQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtBQUNsQixnQkFBUSxFQUFFLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWM7QUFDN0MsZ0JBQVEsRUFBRSxJQUFJO09BQ2YsQ0FBQzs7QUFFRixhQUNFOzs7QUFDRSxtQkFBUyxFQUFFLDZCQUFXLE9BQU8sQ0FBQyxBQUFDO0FBQy9CLHFCQUFXLEVBQUU7bUJBQU0sT0FBSyxRQUFRLENBQUMsRUFBQyxjQUFjLEVBQUUsS0FBSyxFQUFDLENBQUM7V0FBQSxBQUFDO0FBQzFELGlCQUFPLEVBQUU7bUJBQU0sT0FBSyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7V0FBQSxBQUFDO0FBQzVELGFBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxBQUFDO1FBQ2Q7O1lBQUssU0FBUyxFQUFDLG1DQUFtQztVQUNoRDs7O0FBQ0UsdUJBQVMsRUFBQyx3QkFBd0I7QUFDbEMscUJBQU8sRUFBRSxVQUFBLEtBQUssRUFBSTtBQUNoQix1QkFBSyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZELHFCQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7ZUFDekIsQUFBQztBQUNGLHNCQUFRLEVBQUMsSUFBSTtZQUNiLDRDQUFNLFNBQVMsRUFBQyxvQkFBb0IsR0FBRztXQUNoQztVQUVUOzs7QUFDRSx1QkFBUyxFQUFDLHdCQUF3QjtBQUNsQyxxQkFBTyxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ2hCLHVCQUFLLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRCxxQkFBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2VBQ3pCLEFBQUM7QUFDRixvQkFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLEFBQUM7WUFDeEIsNENBQU0sU0FBUyxFQUFDLGtCQUFrQixHQUFHO1dBQzlCO1NBQ0w7UUFDTjs7O1VBQ0csR0FBRyxDQUFDLElBQUk7U0FDSjtPQUNKLENBQ0w7S0FDSDs7O1dBRWtCLDZCQUFDLElBQVksRUFBUTtBQUN0QyxVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLElBQUksRUFBQyxDQUFDLENBQUM7S0FDbkU7OztXQUVTLHNCQUFTO0FBQ2pCLGtCQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2hDOzs7V0FFVSx1QkFBUztBQUNsQixVQUFNLElBQUksR0FBRyx1QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsVUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQztBQUNyQyxhQUFPLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDdEIsWUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO0FBQ3BCLGlCQUFPO1NBQ1I7O0FBRUQsZUFBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7T0FDakM7O0FBRUQsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0Qjs7O1dBRWdCLDJCQUFDLElBQVksRUFBRSxNQUFlLEVBQUU7QUFDL0MsVUFBSSxNQUFNLEVBQUU7QUFDVixZQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM5QyxNQUFNO0FBQ0wsWUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDNUM7S0FDRjs7O1NBdEpVLDRCQUE0QjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiV29ya2luZ1NldFNlbGVjdGlvbkNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQge1JlYWN0LCBSZWFjdERPTX0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQgdHlwZSB7V29ya2luZ1NldERlZmluaXRpb259IGZyb20gJy4uLy4uL3dvcmtpbmctc2V0cyc7XG5pbXBvcnQgdHlwZSB7V29ya2luZ1NldHNTdG9yZX0gZnJvbSAnLi4vLi4vd29ya2luZy1zZXRzL2xpYi9Xb3JraW5nU2V0c1N0b3JlJztcblxuXG50eXBlIFByb3BzID0ge1xuICB3b3JraW5nU2V0c1N0b3JlOiBXb3JraW5nU2V0c1N0b3JlO1xuICBvbkNsb3NlOiAoKSA9PiB2b2lkO1xuICBvbkVkaXRXb3JraW5nU2V0OiAobmFtZTogc3RyaW5nLCB1cmlzOiBBcnJheTxzdHJpbmc+KSA9PiB2b2lkO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgc2VsZWN0aW9uSW5kZXg6IG51bWJlcjtcbiAgZGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPjtcbn07XG5cbmV4cG9ydCBjbGFzcyBXb3JraW5nU2V0U2VsZWN0aW9uQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICBjb25zdCB3b3JraW5nU2V0c1N0b3JlID0gcHJvcHMud29ya2luZ1NldHNTdG9yZTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzZWxlY3Rpb25JbmRleDogMCxcbiAgICAgIGRlZmluaXRpb25zOiB3b3JraW5nU2V0c1N0b3JlLmdldERlZmluaXRpb25zKCkgfHwgW10sXG4gICAgfTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIHdvcmtpbmdTZXRzU3RvcmUuc3Vic2NyaWJlVG9EZWZpbml0aW9ucyhkZWZpbml0aW9ucyA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RlZmluaXRpb25zfSk7XG4gICAgICAgIGlmIChkZWZpbml0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLnByb3BzLm9uQ2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuXG4gICAgKHRoaXM6IGFueSkuX2xvc3RGb2N1cyA9IHRoaXMuX2xvc3RGb2N1cy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9jaGVja0ZvY3VzID0gdGhpcy5fY2hlY2tGb2N1cy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9yZW5kZXJEZWZpbml0aW9uID0gdGhpcy5fcmVuZGVyRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIG5vZGUuZm9jdXMoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICBub2RlLFxuICAgICAge1xuICAgICAgICAnZmlsZS10cmVlOndvcmtzZXQtc2VsZWN0LXVwJzogKCkgPT4gdGhpcy5fbW92ZVNlbGVjdGlvbkluZGV4KC0xKSxcbiAgICAgICAgJ2ZpbGUtdHJlZTp3b3Jrc2V0LXNlbGVjdC1kb3duJzogKCkgPT4gdGhpcy5fbW92ZVNlbGVjdGlvbkluZGV4KDEpLFxuICAgICAgICAnZmlsZS10cmVlOndvcmtzZXQtc2VsZWN0LXRvZ2dsZSc6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBkZWYgPSB0aGlzLnN0YXRlLmRlZmluaXRpb25zW3RoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXhdO1xuICAgICAgICAgIHRoaXMuX3RvZ2dsZVdvcmtpbmdTZXQoZGVmLm5hbWUsIGRlZi5hY3RpdmUpO1xuICAgICAgICB9LFxuICAgICAgICAnZmlsZS10cmVlOndvcmtzZXQtc2VsZWN0LWNsb3NlJzogdGhpcy5wcm9wcy5vbkNsb3NlLFxuICAgICAgfVxuICAgICkpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVwZGF0ZShuZXh0UHJvcHM6IFByb3BzLCBuZXh0U3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gICAgaWYgKG5leHRTdGF0ZS5zZWxlY3Rpb25JbmRleCA+PSBuZXh0U3RhdGUuZGVmaW5pdGlvbnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3Rpb25JbmRleDogbmV4dFN0YXRlLmRlZmluaXRpb25zLmxlbmd0aCAtIDF9KTtcbiAgICB9IGVsc2UgaWYgKG5leHRTdGF0ZS5zZWxlY3Rpb25JbmRleCA8IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbkluZGV4OiAwfSk7XG4gICAgfVxuXG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIG5vZGUuZm9jdXMoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWZpbGUtdHJlZS13b3JraW5nLXNldC1zZWxlY3Rpb24tcGFuZWwgcGFkZGVkXCJcbiAgICAgICAgdGFiSW5kZXg9XCIwXCJcbiAgICAgICAgb25CbHVyPXt0aGlzLl9sb3N0Rm9jdXN9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNlbGVjdC1saXN0XCI+XG4gICAgICAgICAgPG9sIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXAgbWFyay1hY3RpdmVcIj5cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlLmRlZmluaXRpb25zLm1hcCh0aGlzLl9yZW5kZXJEZWZpbml0aW9uKX1cbiAgICAgICAgICA8L29sPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRGVmaW5pdGlvbihkZWY6IFdvcmtpbmdTZXREZWZpbml0aW9uLCBpbmRleDogbnVtYmVyKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3QgY2xhc3NlcyA9IHtcbiAgICAgIGFjdGl2ZTogZGVmLmFjdGl2ZSxcbiAgICAgIHNlbGVjdGVkOiBpbmRleCA9PT0gdGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleCxcbiAgICAgIGNsZWFyZml4OiB0cnVlLFxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGxpXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhjbGFzc2VzKX1cbiAgICAgICAgb25Nb3VzZU92ZXI9eygpID0+IHRoaXMuc2V0U3RhdGUoe3NlbGVjdGlvbkluZGV4OiBpbmRleH0pfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLl90b2dnbGVXb3JraW5nU2V0KGRlZi5uYW1lLCBkZWYuYWN0aXZlKX1cbiAgICAgICAga2V5PXtkZWYubmFtZX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC14cyBwdWxsLXJpZ2h0XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrLXRpZ2h0IGJ0blwiXG4gICAgICAgICAgICBvbkNsaWNrPXtldmVudCA9PiB7XG4gICAgICAgICAgICAgIHRoaXMucHJvcHMud29ya2luZ1NldHNTdG9yZS5kZWxldGVXb3JraW5nU2V0KGRlZi5uYW1lKTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgdGFiSW5kZXg9XCItMVwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLXRyYXNoY2FuXCIgLz5cbiAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9jay10aWdodCBidG5cIlxuICAgICAgICAgICAgb25DbGljaz17ZXZlbnQgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRWRpdFdvcmtpbmdTZXQoZGVmLm5hbWUsIGRlZi51cmlzKTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25CbHVyPXt0aGlzLl9sb3N0Rm9jdXN9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLXBlbmNpbFwiIC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8c3Bhbj5cbiAgICAgICAgICB7ZGVmLm5hbWV9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgfVxuXG4gIF9tb3ZlU2VsZWN0aW9uSW5kZXgoc3RlcDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0aW9uSW5kZXg6IHRoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXggKyBzdGVwfSk7XG4gIH1cblxuICBfbG9zdEZvY3VzKCk6IHZvaWQge1xuICAgIHNldEltbWVkaWF0ZSh0aGlzLl9jaGVja0ZvY3VzKTtcbiAgfVxuXG4gIF9jaGVja0ZvY3VzKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgd2hpbGUgKGVsZW1lbnQgIT0gbnVsbCkge1xuICAgICAgaWYgKGVsZW1lbnQgPT09IG5vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICB9XG5cbiAgX3RvZ2dsZVdvcmtpbmdTZXQobmFtZTogc3RyaW5nLCBhY3RpdmU6IGJvb2xlYW4pIHtcbiAgICBpZiAoYWN0aXZlKSB7XG4gICAgICB0aGlzLnByb3BzLndvcmtpbmdTZXRzU3RvcmUuZGVhY3RpdmF0ZShuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wcy53b3JraW5nU2V0c1N0b3JlLmFjdGl2YXRlKG5hbWUpO1xuICAgIH1cbiAgfVxufVxuIl19