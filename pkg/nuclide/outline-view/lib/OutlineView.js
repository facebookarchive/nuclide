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

exports.createOutlineViewClass = createOutlineViewClass;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function createOutlineViewClass(outlines) {
  return (function (_React$Component) {
    _inherits(OutlineView, _React$Component);

    _createClass(OutlineView, null, [{
      key: 'gadgetId',
      value: 'nuclide-outline-view',
      enumerable: true
    }, {
      key: 'defaultLocation',
      value: 'right',
      enumerable: true
    }]);

    function OutlineView(props) {
      _classCallCheck(this, OutlineView);

      _get(Object.getPrototypeOf(OutlineView.prototype), 'constructor', this).call(this, props);
      this.state = { outline: null };
    }

    _createClass(OutlineView, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this = this;

        (0, _assert2['default'])(this.subscription == null);
        this.subscription = outlines.subscribe(function (outline) {
          // If the outline view has focus, we don't want to re-render anything.
          if (_this !== atom.workspace.getActivePaneItem()) {
            _this.setState({ outline: outline });
          }
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        (0, _assert2['default'])(this.subscription != null);
        this.subscription.dispose();
        this.subscription = null;
      }
    }, {
      key: 'render',
      value: function render() {
        var contents = undefined;
        if (this.state.outline == null) {
          contents = _reactForAtom.React.createElement(
            'span',
            null,
            'No outline available'
          );
        } else {
          contents = _reactForAtom.React.createElement(OutlineViewComponent, { outline: this.state.outline });
        }
        return _reactForAtom.React.createElement(
          'div',
          { className: 'pane-item padded nuclide-outline-view' },
          contents
        );
      }
    }, {
      key: 'getTitle',
      value: function getTitle() {
        return 'Outline View';
      }
    }, {
      key: 'getIconName',
      value: function getIconName() {
        return 'list-unordered';
      }
    }]);

    return OutlineView;
  })(_reactForAtom.React.Component);
}

var OutlineViewComponent = (function (_React$Component2) {
  _inherits(OutlineViewComponent, _React$Component2);

  function OutlineViewComponent() {
    _classCallCheck(this, OutlineViewComponent);

    _get(Object.getPrototypeOf(OutlineViewComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(OutlineViewComponent, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        null,
        this.props.outline.outlineTrees.map(this._renderTree.bind(this))
      );
    }
  }, {
    key: '_renderTree',
    value: function _renderTree(outline) {
      var _this2 = this;

      var onClick = function onClick() {
        atom.workspace.open(_this2.props.outline.file, {
          initialLine: outline.startPosition.row,
          initialColumn: outline.startPosition.column,
          searchAllPanes: true
        });
      };
      return _reactForAtom.React.createElement(
        'ul',
        { className: 'list-tree' },
        _reactForAtom.React.createElement(
          'li',
          { className: 'list-nested-item' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'list-item nuclide-outline-view-item', onClick: onClick },
            outline.displayText
          ),
          outline.children.map(this._renderTree.bind(this))
        )
      );
    }
  }], [{
    key: 'propTypes',
    value: {
      outline: _reactForAtom.React.PropTypes.object.isRequired
    },
    enumerable: true
  }]);

  return OutlineViewComponent;
})(_reactForAtom.React.Component);
//# sourceMappingURL=data:application/json;base64,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VztXQUNoQjtVQUNMLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQy9DO09BQ0YsQ0FDTDtLQUNIOzs7V0E5QmtCO0FBQ2pCLGFBQU8sRUFBRSxvQkFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7S0FDM0M7Ozs7U0FIRyxvQkFBb0I7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6Ik91dGxpbmVWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCB0eXBlIHtPdXRsaW5lLCBPdXRsaW5lVHJlZX0gZnJvbSAnLi9tYWluJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPdXRsaW5lVmlld0NsYXNzKG91dGxpbmVzOiBPYnNlcnZhYmxlPD9PdXRsaW5lPik6IHR5cGVvZiBSZWFjdC5Db21wb25lbnQge1xuICByZXR1cm4gY2xhc3MgT3V0bGluZVZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBnYWRnZXRJZCA9ICdudWNsaWRlLW91dGxpbmUtdmlldyc7XG4gICAgc3RhdGljIGRlZmF1bHRMb2NhdGlvbiA9ICdyaWdodCc7XG5cbiAgICBzdWJzY3JpcHRpb246ID9JRGlzcG9zYWJsZTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICBzdXBlcihwcm9wcyk7XG4gICAgICB0aGlzLnN0YXRlID0ge291dGxpbmU6IG51bGx9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgaW52YXJpYW50KHRoaXMuc3Vic2NyaXB0aW9uID09IG51bGwpO1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb24gPSBvdXRsaW5lcy5zdWJzY3JpYmUob3V0bGluZSA9PiB7XG4gICAgICAgIC8vIElmIHRoZSBvdXRsaW5lIHZpZXcgaGFzIGZvY3VzLCB3ZSBkb24ndCB3YW50IHRvIHJlLXJlbmRlciBhbnl0aGluZy5cbiAgICAgICAgaWYgKHRoaXMgIT09IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtvdXRsaW5lfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgICAgaW52YXJpYW50KHRoaXMuc3Vic2NyaXB0aW9uICE9IG51bGwpO1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cblxuICAgIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICAgIGxldCBjb250ZW50cztcbiAgICAgIGlmICh0aGlzLnN0YXRlLm91dGxpbmUgPT0gbnVsbCkge1xuICAgICAgICBjb250ZW50cyA9IChcbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIE5vIG91dGxpbmUgYXZhaWxhYmxlXG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGVudHMgPSAoXG4gICAgICAgICAgPE91dGxpbmVWaWV3Q29tcG9uZW50IG91dGxpbmU9e3RoaXMuc3RhdGUub3V0bGluZX0gLz5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFuZS1pdGVtIHBhZGRlZCBudWNsaWRlLW91dGxpbmUtdmlld1wiPlxuICAgICAgICAgIHtjb250ZW50c31cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cblxuICAgIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gJ091dGxpbmUgVmlldyc7XG4gICAgfVxuXG4gICAgZ2V0SWNvbk5hbWUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnbGlzdC11bm9yZGVyZWQnO1xuICAgIH1cbiAgfTtcbn1cblxuY2xhc3MgT3V0bGluZVZpZXdDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIG91dGxpbmU6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgfTtcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAge3RoaXMucHJvcHMub3V0bGluZS5vdXRsaW5lVHJlZXMubWFwKHRoaXMuX3JlbmRlclRyZWUuYmluZCh0aGlzKSl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlclRyZWUob3V0bGluZTogT3V0bGluZVRyZWUpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHRoaXMucHJvcHMub3V0bGluZS5maWxlLCB7XG4gICAgICAgIGluaXRpYWxMaW5lOiBvdXRsaW5lLnN0YXJ0UG9zaXRpb24ucm93LFxuICAgICAgICBpbml0aWFsQ29sdW1uOiBvdXRsaW5lLnN0YXJ0UG9zaXRpb24uY29sdW1uLFxuICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgPGxpIGNsYXNzTmFtZT1cImxpc3QtbmVzdGVkLWl0ZW1cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbSBudWNsaWRlLW91dGxpbmUtdmlldy1pdGVtXCIgb25DbGljaz17b25DbGlja30+XG4gICAgICAgICAgICB7b3V0bGluZS5kaXNwbGF5VGV4dH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7b3V0bGluZS5jaGlsZHJlbi5tYXAodGhpcy5fcmVuZGVyVHJlZS5iaW5kKHRoaXMpKX1cbiAgICAgICAgPC9saT5cbiAgICAgIDwvdWw+XG4gICAgKTtcbiAgfVxufVxuIl19