var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');

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
            'button',
            {
              className: 'pull-right btn btn-sm nuclide-home-tryit',
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
  }]);

  return HomeFeatureComponent;
})(React.Component);

HomeFeatureComponent.propTypes = {
  title: React.PropTypes.string.isRequired,
  icon: React.PropTypes.string.isRequired,
  description: React.PropTypes.element.isRequired,
  command: React.PropTypes.string
};

module.exports = HomeFeatureComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhvbWVGZWF0dXJlQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7SUFFbEMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBRWxCLGtCQUFpQjttQkFDSSxJQUFJLENBQUMsS0FBSztVQUE1QixLQUFLLFVBQUwsS0FBSztVQUFFLE9BQU8sVUFBUCxPQUFPOztBQUNyQixhQUNFOztVQUFTLFNBQVMsRUFBQyxtQkFBbUI7UUFDcEM7O1lBQVMsU0FBUyxzQ0FBb0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEFBQUc7VUFDckUsS0FBSztVQUNMLE9BQU8sR0FBRzs7O0FBQ1QsdUJBQVMsRUFBQywwQ0FBMEM7QUFDcEQscUJBQU8sRUFBRTt1QkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxDQUFDO2VBQUEsQUFBQzs7V0FFNUUsR0FBRyxJQUFJO1NBQ1I7UUFDVjs7WUFBSyxTQUFTLEVBQUMscUJBQXFCO1VBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVztTQUNuQjtPQUNFLENBQ1Y7S0FDSDs7O1NBbkJHLG9CQUFvQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXVCbEQsb0JBQW9CLENBQUMsU0FBUyxHQUFHO0FBQy9CLE9BQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3hDLE1BQUksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3ZDLGFBQVcsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVO0FBQy9DLFNBQU8sRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU07Q0FDaEMsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDIiwiZmlsZSI6IkhvbWVGZWF0dXJlQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jbGFzcyBIb21lRmVhdHVyZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge3RpdGxlLCBjb21tYW5kfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkZXRhaWxzIGNsYXNzTmFtZT1cIm51Y2xpZGUtaG9tZS1jYXJkXCI+XG4gICAgICAgIDxzdW1tYXJ5IGNsYXNzTmFtZT17YG51Y2xpZGUtaG9tZS1zdW1tYXJ5IGljb24gaWNvbi0ke3RoaXMucHJvcHMuaWNvbn1gfT5cbiAgICAgICAgICB7dGl0bGV9XG4gICAgICAgICAge2NvbW1hbmQgPyA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0IGJ0biBidG4tc20gbnVjbGlkZS1ob21lLXRyeWl0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgY29tbWFuZCl9PlxuICAgICAgICAgICAgVHJ5IGl0XG4gICAgICAgICAgPC9idXR0b24+IDogbnVsbH1cbiAgICAgICAgPC9zdW1tYXJ5PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtaG9tZS1kZXRhaWxcIj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5kZXNjcmlwdGlvbn1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2RldGFpbHM+XG4gICAgKTtcbiAgfVxuXG59XG5cbkhvbWVGZWF0dXJlQ29tcG9uZW50LnByb3BUeXBlcyA9IHtcbiAgdGl0bGU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgaWNvbjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBkZXNjcmlwdGlvbjogUmVhY3QuUHJvcFR5cGVzLmVsZW1lbnQuaXNSZXF1aXJlZCxcbiAgY29tbWFuZDogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSG9tZUZlYXR1cmVDb21wb25lbnQ7XG4iXX0=