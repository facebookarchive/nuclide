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

  function TypeHintComponent(props) {
    _classCallCheck(this, TypeHintComponent);

    _get(Object.getPrototypeOf(TypeHintComponent.prototype), 'constructor', this).call(this, props);
    this.state = {
      expandedNodes: new Set()
    };
  }

  /* eslint-enable react/prop-types */

  _createClass(TypeHintComponent, [{
    key: 'getDefaultProps',
    value: function getDefaultProps() {
      return {
        content: '<type unavailable>'
      };
    }
  }, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlR5cGVIaW50Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWFvQixnQkFBZ0I7Ozs7SUFXdkIsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsS0FBNkIsRUFBRTswQkFIaEMsaUJBQWlCOztBQUkxQiwrQkFKUyxpQkFBaUIsNkNBSXBCLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxtQkFBYSxFQUFFLElBQUksR0FBRyxFQUFFO0tBQ3pCLENBQUM7R0FDSDs7OztlQVJVLGlCQUFpQjs7V0FVYiwyQkFBMkI7QUFDeEMsYUFBTztBQUNMLGVBQU8sRUFBRSxvQkFBb0I7T0FDOUIsQ0FBQztLQUNIOzs7V0FFYyx5QkFBQyxLQUFhLEVBQWdCO0FBQzNDLGFBQ0U7O1VBQUksU0FBUyxFQUFDLFdBQVc7UUFDdkI7OztVQUFPLEtBQUs7U0FBUTtPQUNqQixDQUNMO0tBQ0g7OztXQUVpQiw0QkFBQyxJQUFjLEVBQUUsS0FBcUIsRUFBUTtVQUN2RCxhQUFhLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBM0IsYUFBYTs7QUFDcEIsVUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzNCLHFCQUFhLFVBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM1QixNQUFNO0FBQ0wscUJBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDekI7O0FBRUQsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3BCOzs7V0FFaUIsNEJBQUMsSUFBYyxFQUFnQjs7O0FBQy9DLFVBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDekIsZUFBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUN6QztBQUNELFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztlQUFJLE1BQUssa0JBQWtCLENBQUMsS0FBSyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQzVFLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0RCxVQUFNLFlBQVksR0FBRyxVQUFVLEdBQzNCOztVQUFJLFNBQVMsRUFBQyxXQUFXO1FBQ3RCLFFBQVE7T0FDTixHQUNMLElBQUksQ0FBQztBQUNULFVBQU0sU0FBUyxHQUNiLDRDQUE0Qyx1QkFDNUIsVUFBVSxHQUFHLE1BQU0sR0FBRyxPQUFPLENBQUEsQ0FBRSxDQUFDO0FBQ2xELGFBQ0U7O1VBQUksU0FBUyxFQUFDLGtCQUFrQjtRQUM5Qjs7WUFBSyxTQUFTLEVBQUMsV0FBVztVQUN4Qjs7O1lBQ0U7QUFDRSx1QkFBUyxFQUFFLFNBQVMsQUFBQztBQUNyQixxQkFBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxBQUFDO2NBQ2xEO1lBQ0QsSUFBSSxDQUFDLEtBQUs7V0FDTjtTQUNIO1FBQ0wsWUFBWTtPQUNWLENBQ0w7S0FDSDs7O1dBRUssa0JBQWlCO0FBQ3JCLFVBQU0sTUFBTSxHQUFHLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssUUFBUSxHQUNqRCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQ3hDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2hELGFBQ0U7O1VBQUksU0FBUyxFQUFDLFdBQVc7UUFDdEIsTUFBTTtPQUNKLENBQ0w7S0FDSDs7O1NBMUVVLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiVHlwZUhpbnRDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SGludFRyZWV9IGZyb20gJy4uLy4uL3R5cGUtaGludC1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFR5cGVIaW50Q29tcG9uZW50UHJvcHMgPSB7XG4gIGNvbnRlbnQ6IHN0cmluZyB8IEhpbnRUcmVlO1xufVxuXG50eXBlIFR5cGVIaW50Q29tcG9uZW50U3RhdGUgPSB7XG4gIGV4cGFuZGVkTm9kZXM6IFNldDxIaW50VHJlZT4sXG59XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBjbGFzcyBUeXBlSGludENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlOiBUeXBlSGludENvbXBvbmVudFN0YXRlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBUeXBlSGludENvbXBvbmVudFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBleHBhbmRlZE5vZGVzOiBuZXcgU2V0KCksXG4gICAgfTtcbiAgfVxuXG4gIGdldERlZmF1bHRQcm9wcygpOiBUeXBlSGludENvbXBvbmVudFByb3BzIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudDogJzx0eXBlIHVuYXZhaWxhYmxlPicsXG4gICAgfTtcbiAgfVxuXG4gIHJlbmRlclByaW1pdGl2ZSh2YWx1ZTogc3RyaW5nKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGxpIGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiPlxuICAgICAgICA8c3Bhbj57dmFsdWV9PC9zcGFuPlxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgaGFuZGxlQ2hldnJvbkNsaWNrKHRyZWU6IEhpbnRUcmVlLCBldmVudDogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCB7ZXhwYW5kZWROb2Rlc30gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChleHBhbmRlZE5vZGVzLmhhcyh0cmVlKSkge1xuICAgICAgZXhwYW5kZWROb2Rlcy5kZWxldGUodHJlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cGFuZGVkTm9kZXMuYWRkKHRyZWUpO1xuICAgIH1cbiAgICAvLyBGb3JjZSB1cGRhdGUuXG4gICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICB9XG5cbiAgcmVuZGVySGllcmFyY2hpY2FsKHRyZWU6IEhpbnRUcmVlKTogUmVhY3RFbGVtZW50IHtcbiAgICBpZiAodHJlZS5jaGlsZHJlbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJQcmltaXRpdmUodHJlZS52YWx1ZSk7XG4gICAgfVxuICAgIGNvbnN0IGNoaWxkcmVuID0gdHJlZS5jaGlsZHJlbi5tYXAoY2hpbGQgPT4gdGhpcy5yZW5kZXJIaWVyYXJjaGljYWwoY2hpbGQpKTtcbiAgICBjb25zdCBpc0V4cGFuZGVkID0gdGhpcy5zdGF0ZS5leHBhbmRlZE5vZGVzLmhhcyh0cmVlKTtcbiAgICBjb25zdCBjaGlsZHJlbkxpc3QgPSBpc0V4cGFuZGVkXG4gICAgICA/IDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgIDwvdWw+XG4gICAgICA6IG51bGw7XG4gICAgY29uc3QgY2xhc3NOYW1lID1cbiAgICAgICdpY29uIG51Y2xpZGUtdHlwZS1oaW50LWV4cGFuZGFibGUtY2hldnJvbiAnICtcbiAgICAgIGBpY29uLWNoZXZyb24tJHtpc0V4cGFuZGVkID8gJ2Rvd24nIDogJ3JpZ2h0J31gO1xuICAgIHJldHVybiAoXG4gICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1uZXN0ZWQtaXRlbVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxpc3QtaXRlbVwiPlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2hldnJvbkNsaWNrLmJpbmQodGhpcywgdHJlZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge3RyZWUudmFsdWV9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2NoaWxkcmVuTGlzdH1cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHJlc3VsdCA9IHR5cGVvZiB0aGlzLnByb3BzLmNvbnRlbnQgPT09ICdzdHJpbmcnXG4gICAgICA/IHRoaXMucmVuZGVyUHJpbWl0aXZlKHRoaXMucHJvcHMuY29udGVudClcbiAgICAgIDogdGhpcy5yZW5kZXJIaWVyYXJjaGljYWwodGhpcy5wcm9wcy5jb250ZW50KTtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtdHJlZVwiPlxuICAgICAgICB7cmVzdWx0fVxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==