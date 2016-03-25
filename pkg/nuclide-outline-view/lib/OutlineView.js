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

var _reactForAtom = require('react-for-atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideLogging = require('../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();

var OutlineView = (function (_React$Component) {
  _inherits(OutlineView, _React$Component);

  function OutlineView(props) {
    _classCallCheck(this, OutlineView);

    _get(Object.getPrototypeOf(OutlineView.prototype), 'constructor', this).call(this, props);
    this.state = {
      outline: {
        kind: 'empty'
      }
    };
  }

  _createClass(OutlineView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      (0, _assert2['default'])(this.subscription == null);
      this.subscription = this.props.outlines.subscribe(function (outline) {
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
      return _reactForAtom.React.createElement(
        'div',
        { className: 'pane-item padded nuclide-outline-view' },
        _reactForAtom.React.createElement(OutlineViewComponent, { outline: this.state.outline })
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

exports.OutlineView = OutlineView;

var OutlineViewComponent = (function (_React$Component2) {
  _inherits(OutlineViewComponent, _React$Component2);

  function OutlineViewComponent() {
    _classCallCheck(this, OutlineViewComponent);

    _get(Object.getPrototypeOf(OutlineViewComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(OutlineViewComponent, [{
    key: 'render',
    value: function render() {
      var outline = this.props.outline;
      switch (outline.kind) {
        case 'empty':
        case 'not-text-editor':
          return null;
        case 'no-provider':
          return _reactForAtom.React.createElement(
            'span',
            null,
            'Outline view does not currently support ',
            outline.grammar,
            '.'
          );
        case 'provider-no-outline':
          return _reactForAtom.React.createElement(
            'span',
            null,
            'No outline available.'
          );
        case 'outline':
          return _reactForAtom.React.createElement(
            'div',
            null,
            renderTrees(outline.editor, outline.outline.outlineTrees)
          );
        default:
          var errorText = 'Encountered unexpected outline kind ' + outline.kind;
          logger.error(errorText);
          return _reactForAtom.React.createElement(
            'span',
            null,
            'Internal Error:',
            _reactForAtom.React.createElement('br', null),
            errorText
          );
      }
    }
  }]);

  return OutlineViewComponent;
})(_reactForAtom.React.Component);

function renderTree(editor, outline) {
  var onClick = function onClick() {
    var pane = atom.workspace.paneForItem(editor);
    if (pane == null) {
      return;
    }
    pane.activate();
    pane.activateItem(editor);
    editor.setCursorBufferPosition(outline.startPosition);
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
      renderTrees(editor, outline.children)
    )
  );
}

function renderTrees(editor, outlines) {
  return outlines.map(function (outline) {
    return renderTree(editor, outline);
  });
}
//# sourceMappingURL=data:application/json;base64,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LENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEQsUUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLGFBQU87S0FDUjtBQUNELFFBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNoQixRQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFCLFVBQU0sQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7R0FDdkQsQ0FBQztBQUNGLFNBQ0U7O01BQUksU0FBUyxFQUFDLFdBQVc7SUFDdkI7O1FBQUksU0FBUyxFQUFDLGtCQUFrQjtNQUM5Qjs7VUFBSyxTQUFTLEVBQUMscUNBQXFDLEVBQUMsT0FBTyxFQUFFLE9BQU8sQUFBQztRQUNuRSxPQUFPLENBQUMsV0FBVztPQUNoQjtNQUNMLFdBQVcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQztLQUNuQztHQUNGLENBQ0w7Q0FDSDs7QUFFRCxTQUFTLFdBQVcsQ0FBQyxNQUF1QixFQUFFLFFBQTRCLEVBQXVCO0FBQy9GLFNBQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE9BQU87V0FBSSxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztHQUFBLENBQUMsQ0FBQztDQUM3RCIsImZpbGUiOiJPdXRsaW5lVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQgdHlwZSB7T3V0bGluZUZvclVpLCBPdXRsaW5lVHJlZX0gZnJvbSAnLi4nO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIG91dGxpbmU6IE91dGxpbmVGb3JVaTtcbn07XG5cbnR5cGUgUHJvcHMgPSB7XG4gIG91dGxpbmVzOiBPYnNlcnZhYmxlPE91dGxpbmVGb3JVaT47XG59O1xuXG5leHBvcnQgY2xhc3MgT3V0bGluZVZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZTogU3RhdGU7XG4gIHByb3BzOiBQcm9wcztcblxuICBzdWJzY3JpcHRpb246ID9JRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG91dGxpbmU6IHtcbiAgICAgICAga2luZDogJ2VtcHR5JyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLnN1YnNjcmlwdGlvbiA9PSBudWxsKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IHRoaXMucHJvcHMub3V0bGluZXMuc3Vic2NyaWJlKG91dGxpbmUgPT4ge1xuICAgICAgLy8gSWYgdGhlIG91dGxpbmUgdmlldyBoYXMgZm9jdXMsIHdlIGRvbid0IHdhbnQgdG8gcmUtcmVuZGVyIGFueXRoaW5nLlxuICAgICAgaWYgKHRoaXMgIT09IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7b3V0bGluZX0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuc3Vic2NyaXB0aW9uICE9IG51bGwpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IG51bGw7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lLWl0ZW0gcGFkZGVkIG51Y2xpZGUtb3V0bGluZS12aWV3XCI+XG4gICAgICAgIDxPdXRsaW5lVmlld0NvbXBvbmVudCBvdXRsaW5lPXt0aGlzLnN0YXRlLm91dGxpbmV9IC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ091dGxpbmUgVmlldyc7XG4gIH1cblxuICBnZXRJY29uTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbGlzdC11bm9yZGVyZWQnO1xuICB9XG59XG5cbnR5cGUgT3V0bGluZVZpZXdDb21wb25lbnRQcm9wcyA9IHtcbiAgb3V0bGluZTogT3V0bGluZUZvclVpO1xufVxuXG5jbGFzcyBPdXRsaW5lVmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBPdXRsaW5lVmlld0NvbXBvbmVudFByb3BzO1xuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBvdXRsaW5lID0gdGhpcy5wcm9wcy5vdXRsaW5lO1xuICAgIHN3aXRjaCAob3V0bGluZS5raW5kKSB7XG4gICAgICBjYXNlICdlbXB0eSc6XG4gICAgICBjYXNlICdub3QtdGV4dC1lZGl0b3InOlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIGNhc2UgJ25vLXByb3ZpZGVyJzpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIE91dGxpbmUgdmlldyBkb2VzIG5vdCBjdXJyZW50bHkgc3VwcG9ydCB7b3V0bGluZS5ncmFtbWFyfS5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgICBjYXNlICdwcm92aWRlci1uby1vdXRsaW5lJzpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIE5vIG91dGxpbmUgYXZhaWxhYmxlLlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgJ291dGxpbmUnOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICB7cmVuZGVyVHJlZXMob3V0bGluZS5lZGl0b3IsIG91dGxpbmUub3V0bGluZS5vdXRsaW5lVHJlZXMpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gYEVuY291bnRlcmVkIHVuZXhwZWN0ZWQgb3V0bGluZSBraW5kICR7b3V0bGluZS5raW5kfWA7XG4gICAgICAgIGxvZ2dlci5lcnJvcihlcnJvclRleHQpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgSW50ZXJuYWwgRXJyb3I6PGJyIC8+XG4gICAgICAgICAgICB7ZXJyb3JUZXh0fVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG4gIH1cblxufVxuXG5mdW5jdGlvbiByZW5kZXJUcmVlKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBvdXRsaW5lOiBPdXRsaW5lVHJlZSk6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcik7XG4gICAgaWYgKHBhbmUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwYW5lLmFjdGl2YXRlKCk7XG4gICAgcGFuZS5hY3RpdmF0ZUl0ZW0oZWRpdG9yKTtcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ob3V0bGluZS5zdGFydFBvc2l0aW9uKTtcbiAgfTtcbiAgcmV0dXJuIChcbiAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC10cmVlXCI+XG4gICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1uZXN0ZWQtaXRlbVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbSBudWNsaWRlLW91dGxpbmUtdmlldy1pdGVtXCIgb25DbGljaz17b25DbGlja30+XG4gICAgICAgICAge291dGxpbmUuZGlzcGxheVRleHR9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7cmVuZGVyVHJlZXMoZWRpdG9yLCBvdXRsaW5lLmNoaWxkcmVuKX1cbiAgICAgIDwvbGk+XG4gICAgPC91bD5cbiAgKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyVHJlZXMoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIG91dGxpbmVzOiBBcnJheTxPdXRsaW5lVHJlZT4pOiBBcnJheTxSZWFjdEVsZW1lbnQ+IHtcbiAgcmV0dXJuIG91dGxpbmVzLm1hcChvdXRsaW5lID0+IHJlbmRlclRyZWUoZWRpdG9yLCBvdXRsaW5lKSk7XG59XG4iXX0=