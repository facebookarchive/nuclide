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

exports.makeTypeHintComponent = makeTypeHintComponent;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibAtomTextEditor = require('../../nuclide-ui/lib/AtomTextEditor');

function makeTypeHintComponent(content, grammar) {
  return function () {
    return _reactForAtom.React.createElement(TypeHintComponent, { content: content, grammar: grammar });
  };
}

var TypeHintComponent = (function (_React$Component) {
  _inherits(TypeHintComponent, _React$Component);

  function TypeHintComponent(props) {
    _classCallCheck(this, TypeHintComponent);

    _get(Object.getPrototypeOf(TypeHintComponent.prototype), 'constructor', this).call(this, props);
    this.state = {
      expandedNodes: new Set()
    };
  }

  _createClass(TypeHintComponent, [{
    key: 'renderPrimitive',
    value: function renderPrimitive(value) {
      var buffer = new _atom.TextBuffer(value);
      var grammar = this.props.grammar;

      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-type-hint-text-editor-container' },
        _reactForAtom.React.createElement(_nuclideUiLibAtomTextEditor.AtomTextEditor, {
          className: 'nuclide-type-hint-text-editor',
          gutterHidden: true,
          readOnly: true,
          syncTextContents: false,
          autoGrow: true,
          grammar: grammar,
          textBuffer: buffer
        })
      );
    }
  }, {
    key: 'handleChevronClick',
    value: function handleChevronClick(tree, event) {
      var expandedNodes = this.state.expandedNodes;

      if (expandedNodes.has(tree)) {
        expandedNodes['delete'](tree);
      } else {
        expandedNodes.add(tree);
      }
      // Force update.
      this.forceUpdate();
    }
  }, {
    key: 'renderHierarchical',
    value: function renderHierarchical(tree) {
      var _this = this;

      if (tree.children == null) {
        return this.renderPrimitive(tree.value);
      }
      var children = tree.children.map(function (child) {
        return _this.renderHierarchical(child);
      });
      var isExpanded = this.state.expandedNodes.has(tree);
      var childrenList = isExpanded ? _reactForAtom.React.createElement(
        'ul',
        { className: 'list-tree' },
        children
      ) : null;
      var className = 'icon nuclide-type-hint-expandable-chevron ' + ('icon-chevron-' + (isExpanded ? 'down' : 'right'));
      return _reactForAtom.React.createElement(
        'li',
        { className: 'list-nested-item' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'list-item' },
          _reactForAtom.React.createElement(
            'span',
            null,
            _reactForAtom.React.createElement('span', {
              className: className,
              onClick: this.handleChevronClick.bind(this, tree)
            }),
            tree.value
          )
        ),
        childrenList
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var content = this.props.content;

      if (typeof content === 'string') {
        return this.renderPrimitive(content);
      }
      return _reactForAtom.React.createElement(
        'ul',
        { className: 'list-tree' },
        this.renderHierarchical(content)
      );
    }
  }]);

  return TypeHintComponent;
})(_reactForAtom.React.Component);
//# sourceMappingURL=data:application/json;base64,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aUI7VUFDZCxPQUFPLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBckIsT0FBTzs7QUFDZCxVQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtBQUMvQixlQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDdEM7QUFDRCxhQUNFOztVQUFJLFNBQVMsRUFBQyxXQUFXO1FBQ3RCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUM7T0FDOUIsQ0FDTDtLQUNIOzs7U0FoRkcsaUJBQWlCO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJUeXBlSGludENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIaW50VHJlZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS10eXBlLWhpbnQtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7VGV4dEJ1ZmZlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0F0b21UZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tVGV4dEVkaXRvcic7XG5cbnR5cGUgVHlwZUhpbnRDb21wb25lbnRQcm9wcyA9IHtcbiAgY29udGVudDogc3RyaW5nIHwgSGludFRyZWU7XG4gIGdyYW1tYXI6IGF0b20kR3JhbW1hcjtcbn07XG5cbnR5cGUgVHlwZUhpbnRDb21wb25lbnRTdGF0ZSA9IHtcbiAgZXhwYW5kZWROb2RlczogU2V0PEhpbnRUcmVlPjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlVHlwZUhpbnRDb21wb25lbnQoXG4gIGNvbnRlbnQ6IHN0cmluZyB8IEhpbnRUcmVlLFxuICBncmFtbWFyOiBhdG9tJEdyYW1tYXIsXG4pOiBSZWFjdENsYXNzIHtcbiAgcmV0dXJuICgpID0+IDxUeXBlSGludENvbXBvbmVudCBjb250ZW50PXtjb250ZW50fSBncmFtbWFyPXtncmFtbWFyfSAvPjtcbn1cblxuY2xhc3MgVHlwZUhpbnRDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogVHlwZUhpbnRDb21wb25lbnRQcm9wcztcbiAgc3RhdGU6IFR5cGVIaW50Q29tcG9uZW50U3RhdGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFR5cGVIaW50Q29tcG9uZW50UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGV4cGFuZGVkTm9kZXM6IG5ldyBTZXQoKSxcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyUHJpbWl0aXZlKHZhbHVlOiBzdHJpbmcpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKHZhbHVlKTtcbiAgICBjb25zdCB7Z3JhbW1hcn0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtdHlwZS1oaW50LXRleHQtZWRpdG9yLWNvbnRhaW5lclwiPlxuICAgICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLXR5cGUtaGludC10ZXh0LWVkaXRvclwiXG4gICAgICAgICAgZ3V0dGVySGlkZGVuPXt0cnVlfVxuICAgICAgICAgIHJlYWRPbmx5PXt0cnVlfVxuICAgICAgICAgIHN5bmNUZXh0Q29udGVudHM9e2ZhbHNlfVxuICAgICAgICAgIGF1dG9Hcm93PXt0cnVlfVxuICAgICAgICAgIGdyYW1tYXI9e2dyYW1tYXJ9XG4gICAgICAgICAgdGV4dEJ1ZmZlcj17YnVmZmVyfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGhhbmRsZUNoZXZyb25DbGljayh0cmVlOiBIaW50VHJlZSwgZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgY29uc3Qge2V4cGFuZGVkTm9kZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoZXhwYW5kZWROb2Rlcy5oYXModHJlZSkpIHtcbiAgICAgIGV4cGFuZGVkTm9kZXMuZGVsZXRlKHRyZWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBhbmRlZE5vZGVzLmFkZCh0cmVlKTtcbiAgICB9XG4gICAgLy8gRm9yY2UgdXBkYXRlLlxuICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgfVxuXG4gIHJlbmRlckhpZXJhcmNoaWNhbCh0cmVlOiBIaW50VHJlZSk6IFJlYWN0RWxlbWVudCB7XG4gICAgaWYgKHRyZWUuY2hpbGRyZW4gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyUHJpbWl0aXZlKHRyZWUudmFsdWUpO1xuICAgIH1cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRyZWUuY2hpbGRyZW4ubWFwKGNoaWxkID0+IHRoaXMucmVuZGVySGllcmFyY2hpY2FsKGNoaWxkKSk7XG4gICAgY29uc3QgaXNFeHBhbmRlZCA9IHRoaXMuc3RhdGUuZXhwYW5kZWROb2Rlcy5oYXModHJlZSk7XG4gICAgY29uc3QgY2hpbGRyZW5MaXN0ID0gaXNFeHBhbmRlZFxuICAgICAgPyA8dWwgY2xhc3NOYW1lPVwibGlzdC10cmVlXCI+XG4gICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICA8L3VsPlxuICAgICAgOiBudWxsO1xuICAgIGNvbnN0IGNsYXNzTmFtZSA9XG4gICAgICAnaWNvbiBudWNsaWRlLXR5cGUtaGludC1leHBhbmRhYmxlLWNoZXZyb24gJyArXG4gICAgICBgaWNvbi1jaGV2cm9uLSR7aXNFeHBhbmRlZCA/ICdkb3duJyA6ICdyaWdodCd9YDtcbiAgICByZXR1cm4gKFxuICAgICAgPGxpIGNsYXNzTmFtZT1cImxpc3QtbmVzdGVkLWl0ZW1cIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsaXN0LWl0ZW1cIj5cbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZUNoZXZyb25DbGljay5iaW5kKHRoaXMsIHRyZWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHt0cmVlLnZhbHVlfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtjaGlsZHJlbkxpc3R9XG4gICAgICA8L2xpPlxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7Y29udGVudH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlclByaW1pdGl2ZShjb250ZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAge3RoaXMucmVuZGVySGllcmFyY2hpY2FsKGNvbnRlbnQpfVxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG59XG4iXX0=