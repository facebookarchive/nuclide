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

var _reactForAtom = require('react-for-atom');

/* eslint-disable react/prop-types */

var TypeHintComponent = (function (_React$Component) {
  _inherits(TypeHintComponent, _React$Component);

  _createClass(TypeHintComponent, null, [{
    key: 'defaultProps',
    value: {
      content: '<type unavailable>'
    },
    enumerable: true
  }]);

  function TypeHintComponent(props) {
    _classCallCheck(this, TypeHintComponent);

    _get(Object.getPrototypeOf(TypeHintComponent.prototype), 'constructor', this).call(this, props);
    this.state = {
      expandedNodes: new Set()
    };
  }

  /* eslint-enable react/prop-types */

  _createClass(TypeHintComponent, [{
    key: 'renderPrimitive',
    value: function renderPrimitive(value) {
      return _reactForAtom.React.createElement(
        'li',
        { className: 'list-item' },
        _reactForAtom.React.createElement(
          'span',
          null,
          value
        )
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
      var result = typeof this.props.content === 'string' ? this.renderPrimitive(this.props.content) : this.renderHierarchical(this.props.content);
      return _reactForAtom.React.createElement(
        'ul',
        { className: 'list-tree' },
        result
      );
    }
  }]);

  return TypeHintComponent;
})(_reactForAtom.React.Component);

exports.TypeHintComponent = TypeHintComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVIaW50Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWFvQixnQkFBZ0I7Ozs7SUFXdkIsaUJBQWlCO1lBQWpCLGlCQUFpQjs7ZUFBakIsaUJBQWlCOztXQUlOO0FBQ3BCLGFBQU8sRUFBRSxvQkFBb0I7S0FDOUI7Ozs7QUFFVSxXQVJBLGlCQUFpQixDQVFoQixLQUE2QixFQUFFOzBCQVJoQyxpQkFBaUI7O0FBUzFCLCtCQVRTLGlCQUFpQiw2Q0FTcEIsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLG1CQUFhLEVBQUUsSUFBSSxHQUFHLEVBQUU7S0FDekIsQ0FBQztHQUNIOzs7O2VBYlUsaUJBQWlCOztXQWViLHlCQUFDLEtBQWEsRUFBZ0I7QUFDM0MsYUFDRTs7VUFBSSxTQUFTLEVBQUMsV0FBVztRQUN2Qjs7O1VBQU8sS0FBSztTQUFRO09BQ2pCLENBQ0w7S0FDSDs7O1dBRWlCLDRCQUFDLElBQWMsRUFBRSxLQUFxQixFQUFRO1VBQ3ZELGFBQWEsR0FBSSxJQUFJLENBQUMsS0FBSyxDQUEzQixhQUFhOztBQUNwQixVQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDM0IscUJBQWEsVUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzVCLE1BQU07QUFDTCxxQkFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN6Qjs7QUFFRCxVQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDcEI7OztXQUVpQiw0QkFBQyxJQUFjLEVBQWdCOzs7QUFDL0MsVUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtBQUN6QixlQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ3pDO0FBQ0QsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2VBQUksTUFBSyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDNUUsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RELFVBQU0sWUFBWSxHQUFHLFVBQVUsR0FDM0I7O1VBQUksU0FBUyxFQUFDLFdBQVc7UUFDdEIsUUFBUTtPQUNOLEdBQ0wsSUFBSSxDQUFDO0FBQ1QsVUFBTSxTQUFTLEdBQ2IsNENBQTRDLHVCQUM1QixVQUFVLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQSxDQUFFLENBQUM7QUFDbEQsYUFDRTs7VUFBSSxTQUFTLEVBQUMsa0JBQWtCO1FBQzlCOztZQUFLLFNBQVMsRUFBQyxXQUFXO1VBQ3hCOzs7WUFDRTtBQUNFLHVCQUFTLEVBQUUsU0FBUyxBQUFDO0FBQ3JCLHFCQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEFBQUM7Y0FDbEQ7WUFDRCxJQUFJLENBQUMsS0FBSztXQUNOO1NBQ0g7UUFDTCxZQUFZO09BQ1YsQ0FDTDtLQUNIOzs7V0FFSyxrQkFBaUI7QUFDckIsVUFBTSxNQUFNLEdBQUcsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxRQUFRLEdBQ2pELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FDeEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEQsYUFDRTs7VUFBSSxTQUFTLEVBQUMsV0FBVztRQUN0QixNQUFNO09BQ0osQ0FDTDtLQUNIOzs7U0F6RVUsaUJBQWlCO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJUeXBlSGludENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIaW50VHJlZX0gZnJvbSAnLi4vLi4vdHlwZS1oaW50LWludGVyZmFjZXMnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgVHlwZUhpbnRDb21wb25lbnRQcm9wcyA9IHtcbiAgY29udGVudDogc3RyaW5nIHwgSGludFRyZWU7XG59XG5cbnR5cGUgVHlwZUhpbnRDb21wb25lbnRTdGF0ZSA9IHtcbiAgZXhwYW5kZWROb2RlczogU2V0PEhpbnRUcmVlPixcbn1cblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGNsYXNzIFR5cGVIaW50Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFR5cGVIaW50Q29tcG9uZW50UHJvcHM7XG4gIHN0YXRlOiBUeXBlSGludENvbXBvbmVudFN0YXRlO1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgY29udGVudDogJzx0eXBlIHVuYXZhaWxhYmxlPicsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFR5cGVIaW50Q29tcG9uZW50UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGV4cGFuZGVkTm9kZXM6IG5ldyBTZXQoKSxcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyUHJpbWl0aXZlKHZhbHVlOiBzdHJpbmcpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1pdGVtXCI+XG4gICAgICAgIDxzcGFuPnt2YWx1ZX08L3NwYW4+XG4gICAgICA8L2xpPlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVDaGV2cm9uQ2xpY2sodHJlZTogSGludFRyZWUsIGV2ZW50OiBTeW50aGV0aWNFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IHtleHBhbmRlZE5vZGVzfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGV4cGFuZGVkTm9kZXMuaGFzKHRyZWUpKSB7XG4gICAgICBleHBhbmRlZE5vZGVzLmRlbGV0ZSh0cmVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwYW5kZWROb2Rlcy5hZGQodHJlZSk7XG4gICAgfVxuICAgIC8vIEZvcmNlIHVwZGF0ZS5cbiAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gIH1cblxuICByZW5kZXJIaWVyYXJjaGljYWwodHJlZTogSGludFRyZWUpOiBSZWFjdEVsZW1lbnQge1xuICAgIGlmICh0cmVlLmNoaWxkcmVuID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlclByaW1pdGl2ZSh0cmVlLnZhbHVlKTtcbiAgICB9XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0cmVlLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB0aGlzLnJlbmRlckhpZXJhcmNoaWNhbChjaGlsZCkpO1xuICAgIGNvbnN0IGlzRXhwYW5kZWQgPSB0aGlzLnN0YXRlLmV4cGFuZGVkTm9kZXMuaGFzKHRyZWUpO1xuICAgIGNvbnN0IGNoaWxkcmVuTGlzdCA9IGlzRXhwYW5kZWRcbiAgICAgID8gPHVsIGNsYXNzTmFtZT1cImxpc3QtdHJlZVwiPlxuICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgPC91bD5cbiAgICAgIDogbnVsbDtcbiAgICBjb25zdCBjbGFzc05hbWUgPVxuICAgICAgJ2ljb24gbnVjbGlkZS10eXBlLWhpbnQtZXhwYW5kYWJsZS1jaGV2cm9uICcgK1xuICAgICAgYGljb24tY2hldnJvbi0ke2lzRXhwYW5kZWQgPyAnZG93bicgOiAncmlnaHQnfWA7XG4gICAgcmV0dXJuIChcbiAgICAgIDxsaSBjbGFzc05hbWU9XCJsaXN0LW5lc3RlZC1pdGVtXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGlzdC1pdGVtXCI+XG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVDaGV2cm9uQ2xpY2suYmluZCh0aGlzLCB0cmVlKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB7dHJlZS52YWx1ZX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2hpbGRyZW5MaXN0fVxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgcmVzdWx0ID0gdHlwZW9mIHRoaXMucHJvcHMuY29udGVudCA9PT0gJ3N0cmluZydcbiAgICAgID8gdGhpcy5yZW5kZXJQcmltaXRpdmUodGhpcy5wcm9wcy5jb250ZW50KVxuICAgICAgOiB0aGlzLnJlbmRlckhpZXJhcmNoaWNhbCh0aGlzLnByb3BzLmNvbnRlbnQpO1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC10cmVlXCI+XG4gICAgICAgIHtyZXN1bHR9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cbn1cbi8qIGVzbGludC1lbmFibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuIl19