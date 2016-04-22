var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('react-for-atom');

var React = _require.React;
var PropTypes = React.PropTypes;

var HomeFeatureComponent = (function (_React$Component) {
  _inherits(HomeFeatureComponent, _React$Component);

  function HomeFeatureComponent() {
    _classCallCheck(this, HomeFeatureComponent);

    _get(Object.getPrototypeOf(HomeFeatureComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(HomeFeatureComponent, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var title = _props.title;
      var command = _props.command;

      return React.createElement(
        'details',
        { className: 'nuclide-home-card' },
        React.createElement(
          'summary',
          { className: 'nuclide-home-summary icon icon-' + this.props.icon },
          title,
          command ? React.createElement(
            _nuclideUiLibButton.Button,
            {
              className: 'pull-right nuclide-home-tryit',
              size: _nuclideUiLibButton.ButtonSizes.SMALL,
              onClick: function () {
                return atom.commands.dispatch(atom.views.getView(atom.workspace), command);
              } },
            'Try it'
          ) : null
        ),
        React.createElement(
          'div',
          { className: 'nuclide-home-detail' },
          this.props.description
        )
      );
    }
  }], [{
    key: 'propTypes',
    value: {
      title: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
      command: PropTypes.string
    },
    enumerable: true
  }]);

  return HomeFeatureComponent;
})(React.Component);

module.exports = HomeFeatureComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhvbWVGZWF0dXJlQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O2tDQWdCTyw2QkFBNkI7Ozs7Ozs7Ozs7ZUFMcEIsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSztJQUNMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0lBTVYsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBV2xCLGtCQUFrQjttQkFDRyxJQUFJLENBQUMsS0FBSztVQUE1QixLQUFLLFVBQUwsS0FBSztVQUFFLE9BQU8sVUFBUCxPQUFPOztBQUNyQixhQUNFOztVQUFTLFNBQVMsRUFBQyxtQkFBbUI7UUFDcEM7O1lBQVMsU0FBUyxzQ0FBb0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEFBQUc7VUFDckUsS0FBSztVQUNMLE9BQU8sR0FBRzs7O0FBQ1QsdUJBQVMsRUFBQywrQkFBK0I7QUFDekMsa0JBQUksRUFBRSxnQ0FBWSxLQUFLLEFBQUM7QUFDeEIscUJBQU8sRUFBRTt1QkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxDQUFDO2VBQUEsQUFBQzs7V0FFNUUsR0FBRyxJQUFJO1NBQ1I7UUFDVjs7WUFBSyxTQUFTLEVBQUMscUJBQXFCO1VBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVztTQUNuQjtPQUNFLENBQ1Y7S0FDSDs7O1dBNUJrQjtBQUNqQixXQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2xDLFVBQUksRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDakMsaUJBQVcsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQy9CLFNBQVMsQ0FBQyxNQUFNLEVBQ2hCLFNBQVMsQ0FBQyxPQUFPLENBQ2xCLENBQUMsQ0FBQyxVQUFVO0FBQ2IsYUFBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNO0tBQzFCOzs7O1NBVEcsb0JBQW9CO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBZ0NsRCxNQUFNLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDIiwiZmlsZSI6IkhvbWVGZWF0dXJlQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBCdXR0b25TaXplcyxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQnV0dG9uJztcblxuY2xhc3MgSG9tZUZlYXR1cmVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgaWNvbjogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGRlc2NyaXB0aW9uOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBQcm9wVHlwZXMuZWxlbWVudCxcbiAgICBdKS5pc1JlcXVpcmVkLFxuICAgIGNvbW1hbmQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IHt0aXRsZSwgY29tbWFuZH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGV0YWlscyBjbGFzc05hbWU9XCJudWNsaWRlLWhvbWUtY2FyZFwiPlxuICAgICAgICA8c3VtbWFyeSBjbGFzc05hbWU9e2BudWNsaWRlLWhvbWUtc3VtbWFyeSBpY29uIGljb24tJHt0aGlzLnByb3BzLmljb259YH0+XG4gICAgICAgICAge3RpdGxlfVxuICAgICAgICAgIHtjb21tYW5kID8gPEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicHVsbC1yaWdodCBudWNsaWRlLWhvbWUtdHJ5aXRcIlxuICAgICAgICAgICAgc2l6ZT17QnV0dG9uU2l6ZXMuU01BTEx9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksIGNvbW1hbmQpfT5cbiAgICAgICAgICAgIFRyeSBpdFxuICAgICAgICAgIDwvQnV0dG9uPiA6IG51bGx9XG4gICAgICAgIDwvc3VtbWFyeT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWhvbWUtZGV0YWlsXCI+XG4gICAgICAgICAge3RoaXMucHJvcHMuZGVzY3JpcHRpb259XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kZXRhaWxzPlxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIb21lRmVhdHVyZUNvbXBvbmVudDtcbiJdfQ==