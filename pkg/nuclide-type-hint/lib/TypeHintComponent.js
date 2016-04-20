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
//# sourceMappingURL=data:application/json;base64,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a0I7VUFDZixPQUFPLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBckIsT0FBTzs7QUFDZCxVQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtBQUMvQixlQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDdEM7QUFDRCxhQUNFOztVQUFJLFNBQVMsRUFBQyxXQUFXO1FBQ3RCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUM7T0FDOUIsQ0FDTDtLQUNIOzs7U0FoRkcsaUJBQWlCO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJUeXBlSGludENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIaW50VHJlZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS10eXBlLWhpbnQtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7VGV4dEJ1ZmZlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0F0b21UZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tVGV4dEVkaXRvcic7XG5cbnR5cGUgVHlwZUhpbnRDb21wb25lbnRQcm9wcyA9IHtcbiAgY29udGVudDogc3RyaW5nIHwgSGludFRyZWU7XG4gIGdyYW1tYXI6IGF0b20kR3JhbW1hcjtcbn07XG5cbnR5cGUgVHlwZUhpbnRDb21wb25lbnRTdGF0ZSA9IHtcbiAgZXhwYW5kZWROb2RlczogU2V0PEhpbnRUcmVlPjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlVHlwZUhpbnRDb21wb25lbnQoXG4gIGNvbnRlbnQ6IHN0cmluZyB8IEhpbnRUcmVlLFxuICBncmFtbWFyOiBhdG9tJEdyYW1tYXIsXG4pOiBSZWFjdENsYXNzIHtcbiAgcmV0dXJuICgpID0+IDxUeXBlSGludENvbXBvbmVudCBjb250ZW50PXtjb250ZW50fSBncmFtbWFyPXtncmFtbWFyfSAvPjtcbn1cblxuY2xhc3MgVHlwZUhpbnRDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogVHlwZUhpbnRDb21wb25lbnRQcm9wcztcbiAgc3RhdGU6IFR5cGVIaW50Q29tcG9uZW50U3RhdGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFR5cGVIaW50Q29tcG9uZW50UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGV4cGFuZGVkTm9kZXM6IG5ldyBTZXQoKSxcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyUHJpbWl0aXZlKHZhbHVlOiBzdHJpbmcpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgVGV4dEJ1ZmZlcih2YWx1ZSk7XG4gICAgY29uc3Qge2dyYW1tYXJ9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXR5cGUtaGludC10ZXh0LWVkaXRvci1jb250YWluZXJcIj5cbiAgICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS10eXBlLWhpbnQtdGV4dC1lZGl0b3JcIlxuICAgICAgICAgIGd1dHRlckhpZGRlbj17dHJ1ZX1cbiAgICAgICAgICByZWFkT25seT17dHJ1ZX1cbiAgICAgICAgICBzeW5jVGV4dENvbnRlbnRzPXtmYWxzZX1cbiAgICAgICAgICBhdXRvR3Jvdz17dHJ1ZX1cbiAgICAgICAgICBncmFtbWFyPXtncmFtbWFyfVxuICAgICAgICAgIHRleHRCdWZmZXI9e2J1ZmZlcn1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVDaGV2cm9uQ2xpY2sodHJlZTogSGludFRyZWUsIGV2ZW50OiBTeW50aGV0aWNFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IHtleHBhbmRlZE5vZGVzfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGV4cGFuZGVkTm9kZXMuaGFzKHRyZWUpKSB7XG4gICAgICBleHBhbmRlZE5vZGVzLmRlbGV0ZSh0cmVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwYW5kZWROb2Rlcy5hZGQodHJlZSk7XG4gICAgfVxuICAgIC8vIEZvcmNlIHVwZGF0ZS5cbiAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gIH1cblxuICByZW5kZXJIaWVyYXJjaGljYWwodHJlZTogSGludFRyZWUpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBpZiAodHJlZS5jaGlsZHJlbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJQcmltaXRpdmUodHJlZS52YWx1ZSk7XG4gICAgfVxuICAgIGNvbnN0IGNoaWxkcmVuID0gdHJlZS5jaGlsZHJlbi5tYXAoY2hpbGQgPT4gdGhpcy5yZW5kZXJIaWVyYXJjaGljYWwoY2hpbGQpKTtcbiAgICBjb25zdCBpc0V4cGFuZGVkID0gdGhpcy5zdGF0ZS5leHBhbmRlZE5vZGVzLmhhcyh0cmVlKTtcbiAgICBjb25zdCBjaGlsZHJlbkxpc3QgPSBpc0V4cGFuZGVkXG4gICAgICA/IDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgIDwvdWw+XG4gICAgICA6IG51bGw7XG4gICAgY29uc3QgY2xhc3NOYW1lID1cbiAgICAgICdpY29uIG51Y2xpZGUtdHlwZS1oaW50LWV4cGFuZGFibGUtY2hldnJvbiAnICtcbiAgICAgIGBpY29uLWNoZXZyb24tJHtpc0V4cGFuZGVkID8gJ2Rvd24nIDogJ3JpZ2h0J31gO1xuICAgIHJldHVybiAoXG4gICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1uZXN0ZWQtaXRlbVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiPlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2hldnJvbkNsaWNrLmJpbmQodGhpcywgdHJlZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge3RyZWUudmFsdWV9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2NoaWxkcmVuTGlzdH1cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCB7Y29udGVudH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlclByaW1pdGl2ZShjb250ZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAge3RoaXMucmVuZGVySGllcmFyY2hpY2FsKGNvbnRlbnQpfVxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG59XG4iXX0=