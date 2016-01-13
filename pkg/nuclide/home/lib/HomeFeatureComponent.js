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
  description: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]).isRequired,
  command: React.PropTypes.string
};

module.exports = HomeFeatureComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhvbWVGZWF0dXJlQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7SUFFbEMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBRWxCLGtCQUFpQjttQkFDSSxJQUFJLENBQUMsS0FBSztVQUE1QixLQUFLLFVBQUwsS0FBSztVQUFFLE9BQU8sVUFBUCxPQUFPOztBQUNyQixhQUNFOztVQUFTLFNBQVMsRUFBQyxtQkFBbUI7UUFDcEM7O1lBQVMsU0FBUyxzQ0FBb0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEFBQUc7VUFDckUsS0FBSztVQUNMLE9BQU8sR0FBRzs7O0FBQ1QsdUJBQVMsRUFBQywwQ0FBMEM7QUFDcEQscUJBQU8sRUFBRTt1QkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxDQUFDO2VBQUEsQUFBQzs7V0FFNUUsR0FBRyxJQUFJO1NBQ1I7UUFDVjs7WUFBSyxTQUFTLEVBQUMscUJBQXFCO1VBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVztTQUNuQjtPQUNFLENBQ1Y7S0FDSDs7O1NBbkJHLG9CQUFvQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXVCbEQsb0JBQW9CLENBQUMsU0FBUyxHQUFHO0FBQy9CLE9BQUssRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3hDLE1BQUksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3ZDLGFBQVcsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUNyQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFDdEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQ3hCLENBQUMsQ0FBQyxVQUFVO0FBQ2IsU0FBTyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTTtDQUNoQyxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsb0JBQW9CLENBQUMiLCJmaWxlIjoiSG9tZUZlYXR1cmVDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNsYXNzIEhvbWVGZWF0dXJlQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7dGl0bGUsIGNvbW1hbmR9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gKFxuICAgICAgPGRldGFpbHMgY2xhc3NOYW1lPVwibnVjbGlkZS1ob21lLWNhcmRcIj5cbiAgICAgICAgPHN1bW1hcnkgY2xhc3NOYW1lPXtgbnVjbGlkZS1ob21lLXN1bW1hcnkgaWNvbiBpY29uLSR7dGhpcy5wcm9wcy5pY29ufWB9PlxuICAgICAgICAgIHt0aXRsZX1cbiAgICAgICAgICB7Y29tbWFuZCA/IDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInB1bGwtcmlnaHQgYnRuIGJ0bi1zbSBudWNsaWRlLWhvbWUtdHJ5aXRcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCBjb21tYW5kKX0+XG4gICAgICAgICAgICBUcnkgaXRcbiAgICAgICAgICA8L2J1dHRvbj4gOiBudWxsfVxuICAgICAgICA8L3N1bW1hcnk+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1ob21lLWRldGFpbFwiPlxuICAgICAgICAgIHt0aGlzLnByb3BzLmRlc2NyaXB0aW9ufVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGV0YWlscz5cbiAgICApO1xuICB9XG5cbn1cblxuSG9tZUZlYXR1cmVDb21wb25lbnQucHJvcFR5cGVzID0ge1xuICB0aXRsZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBpY29uOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIGRlc2NyaXB0aW9uOiBSZWFjdC5Qcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIFJlYWN0LlByb3BUeXBlcy5lbGVtZW50LFxuICBdKS5pc1JlcXVpcmVkLFxuICBjb21tYW5kOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIb21lRmVhdHVyZUNvbXBvbmVudDtcbiJdfQ==