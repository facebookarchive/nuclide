var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Immutable = require('immutable');

var _require = require('react-for-atom');

var React = _require.React;

var HomeFeatureComponent = require('./HomeFeatureComponent');
var NuclideLogo = require('./NuclideLogo');

var arrayFrom = require('../../nuclide-commons').array.from;
var featureConfig = require('../../nuclide-feature-config');

var DEFAULT_WELCOME = React.createElement(
  'div',
  null,
  React.createElement(
    'p',
    null,
    'Thanks for trying Nuclide, Facebook\'s',
    React.createElement('br', null),
    'unified developer environment.'
  ),
  React.createElement(
    'p',
    null,
    'We would love your feedback and contributions to continue to make it better. Please raise issues and pull-requests directly on our ',
    React.createElement(
      'a',
      { href: 'https://github.com/facebook/nuclide' },
      'GitHub repo'
    ),
    '.'
  ),
  React.createElement(
    'p',
    null,
    'Thank you!'
  )
);

/**
 * Create a HomePaneItem component class that's bound to the provided stream of home fragments.
 */
function createHomePaneItem(allHomeFragmentsStream) {
  var HomePaneItem = (function (_React$Component) {
    _inherits(HomePaneItem, _React$Component);

    _createClass(HomePaneItem, null, [{
      key: 'gadgetId',
      value: 'nuclide-home',
      enumerable: true
    }]);

    function HomePaneItem() {
      _classCallCheck(this, HomePaneItem);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _get(Object.getPrototypeOf(HomePaneItem.prototype), 'constructor', this).apply(this, args);
      this.state = {
        allHomeFragments: Immutable.Set()
      };
    }

    _createClass(HomePaneItem, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this = this;

        this._homeFragmentsSubscription = allHomeFragmentsStream.forEach(function (allHomeFragments) {
          return _this.setState({ allHomeFragments: allHomeFragments });
        });

        featureConfig.set('nuclide-home.showHome', true);
      }
    }, {
      key: 'render',
      value: function render() {
        var welcomes = [];
        var features = [];
        var sortedHomeFragments = arrayFrom(this.state.allHomeFragments).sort(function (fragmentA, fragmentB) {
          return (fragmentB.priority || 0) - (fragmentA.priority || 0);
        });
        sortedHomeFragments.forEach(function (fragment) {
          var welcome = fragment.welcome;
          var feature = fragment.feature;

          if (welcome) {
            welcomes.push(React.createElement(
              'div',
              { key: welcomes.length },
              welcome
            ));
          }
          if (feature) {
            features.push(React.createElement(HomeFeatureComponent, _extends({ key: features.length }, feature)));
          }
        });

        var containers = [React.createElement(
          'div',
          { key: 'welcome', className: 'nuclide-home-container' },
          React.createElement(
            'section',
            { className: 'text-center' },
            React.createElement(NuclideLogo, { className: 'nuclide-home-logo' }),
            React.createElement(
              'h1',
              { className: 'nuclide-home-title' },
              'Welcome to Nuclide'
            )
          ),
          React.createElement(
            'section',
            { className: 'text-center' },
            welcomes.length > 0 ? welcomes : DEFAULT_WELCOME
          )
        )];

        if (features.length > 0) {
          containers.push(React.createElement(
            'div',
            { key: 'features', className: 'nuclide-home-container' },
            features
          ));
        }

        return(
          // Re-use styles from the Atom welcome pane where possible.
          React.createElement(
            'div',
            { className: 'nuclide-home pane-item padded nuclide-home-containers' },
            containers
          )
        );
      }
    }, {
      key: 'getTitle',
      value: function getTitle() {
        return 'Home';
      }
    }, {
      key: 'getIconName',
      value: function getIconName() {
        return 'home';
      }

      // Return false to prevent the tab getting split (since we only update a singleton health pane).
    }, {
      key: 'copy',
      value: function copy() {
        return false;
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        featureConfig.set('nuclide-home.showHome', false);

        if (this._homeFragmentsSubscription) {
          this._homeFragmentsSubscription.dispose();
        }
      }
    }]);

    return HomePaneItem;
  })(React.Component);

  return HomePaneItem;
}

module.exports = createHomePaneItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUhvbWVQYW5lSXRlbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O2VBQ3ZCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7O0FBQ1osSUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUMvRCxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTdDLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDOUQsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7O0FBRTlELElBQU0sZUFBZSxHQUNuQjs7O0VBQ0U7Ozs7SUFFRSwrQkFBTTs7R0FFSjtFQUNKOzs7O0lBR007O1FBQUcsSUFBSSxFQUFDLHFDQUFxQzs7S0FBZ0I7O0dBQy9EO0VBQ0o7Ozs7R0FFSTtDQUNBLEFBQ1AsQ0FBQzs7Ozs7QUFLRixTQUFTLGtCQUFrQixDQUN6QixzQkFBbUUsRUFDM0Q7TUFFRixZQUFZO2NBQVosWUFBWTs7aUJBQVosWUFBWTs7YUFFRSxjQUFjOzs7O0FBUXJCLGFBVlAsWUFBWSxHQVVLOzRCQVZqQixZQUFZOzt3Q0FVRCxJQUFJO0FBQUosWUFBSTs7O0FBQ2pCLGlDQVhFLFlBQVksOENBV0wsSUFBSSxFQUFFO0FBQ2YsVUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLHdCQUFnQixFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUU7T0FDbEMsQ0FBQztLQUNIOztpQkFmRyxZQUFZOzthQWlCQyw2QkFBRzs7O0FBQ2xCLFlBQUksQ0FBQywwQkFBMEIsR0FBRyxzQkFBc0IsQ0FBQyxPQUFPLENBQzlELFVBQUEsZ0JBQWdCO2lCQUFJLE1BQUssUUFBUSxDQUFDLEVBQUMsZ0JBQWdCLEVBQWhCLGdCQUFnQixFQUFDLENBQUM7U0FBQSxDQUN0RCxDQUFDOztBQUVGLHFCQUFhLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxDQUFDO09BQ2xEOzs7YUFFSyxrQkFBRztBQUNQLFlBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixZQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDcEIsWUFBTSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FDckUsVUFBQyxTQUFTLEVBQUUsU0FBUztpQkFBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFBLElBQUssU0FBUyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUEsQUFBQztTQUFBLENBQ2hGLENBQUM7QUFDRiwyQkFBbUIsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRLEVBQUk7Y0FDL0IsT0FBTyxHQUFhLFFBQVEsQ0FBNUIsT0FBTztjQUFFLE9BQU8sR0FBSSxRQUFRLENBQW5CLE9BQU87O0FBQ3ZCLGNBQUksT0FBTyxFQUFFO0FBQ1gsb0JBQVEsQ0FBQyxJQUFJLENBQUM7O2dCQUFLLEdBQUcsRUFBRSxRQUFRLENBQUMsTUFBTSxBQUFDO2NBQUUsT0FBTzthQUFPLENBQUMsQ0FBQztXQUMzRDtBQUNELGNBQUksT0FBTyxFQUFFO0FBQ1gsb0JBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQUMsb0JBQW9CLGFBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEFBQUMsSUFBSyxPQUFPLEVBQUksQ0FBQyxDQUFDO1dBQzVFO1NBQ0YsQ0FBQyxDQUFDOztBQUVILFlBQU0sVUFBVSxHQUFHLENBQ2pCOztZQUFLLEdBQUcsRUFBQyxTQUFTLEVBQUMsU0FBUyxFQUFDLHdCQUF3QjtVQUNuRDs7Y0FBUyxTQUFTLEVBQUMsYUFBYTtZQUM5QixvQkFBQyxXQUFXLElBQUMsU0FBUyxFQUFDLG1CQUFtQixHQUFHO1lBQzdDOztnQkFBSSxTQUFTLEVBQUMsb0JBQW9COzthQUF3QjtXQUNsRDtVQUNWOztjQUFTLFNBQVMsRUFBQyxhQUFhO1lBQzdCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLFFBQVEsR0FBRyxlQUFlO1dBQ3pDO1NBQ04sQ0FDUCxDQUFDOztBQUVGLFlBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDdkIsb0JBQVUsQ0FBQyxJQUFJLENBQUM7O2NBQUssR0FBRyxFQUFDLFVBQVUsRUFBQyxTQUFTLEVBQUMsd0JBQXdCO1lBQUUsUUFBUTtXQUFPLENBQUMsQ0FBQztTQUMxRjs7QUFFRDs7QUFFRTs7Y0FBSyxTQUFTLEVBQUMsdURBQXVEO1lBQ25FLFVBQVU7V0FDUDtVQUNOO09BQ0g7OzthQUVPLG9CQUFXO0FBQ2pCLGVBQU8sTUFBTSxDQUFDO09BQ2Y7OzthQUVVLHVCQUFXO0FBQ3BCLGVBQU8sTUFBTSxDQUFDO09BQ2Y7Ozs7O2FBR0csZ0JBQUc7QUFDTCxlQUFPLEtBQUssQ0FBQztPQUNkOzs7YUFFbUIsZ0NBQUc7QUFDckIscUJBQWEsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRWxELFlBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFO0FBQ25DLGNBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUMzQztPQUNGOzs7V0FwRkcsWUFBWTtLQUFTLEtBQUssQ0FBQyxTQUFTOztBQXdGMUMsU0FBUyxZQUFZLENBQWdCO0NBQ3RDOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiY3JlYXRlSG9tZVBhbmVJdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1nYWRnZXRzLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0hvbWVGcmFnbWVudHN9IGZyb20gJy4uLy4uL251Y2xpZGUtaG9tZS1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIFJ4IGZyb20gJ3J4JztcblxuY29uc3QgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IEhvbWVGZWF0dXJlQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9Ib21lRmVhdHVyZUNvbXBvbmVudCcpO1xuY29uc3QgTnVjbGlkZUxvZ28gPSByZXF1aXJlKCcuL051Y2xpZGVMb2dvJyk7XG5cbmNvbnN0IGFycmF5RnJvbSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpLmFycmF5LmZyb207XG5jb25zdCBmZWF0dXJlQ29uZmlnID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZycpO1xuXG5jb25zdCBERUZBVUxUX1dFTENPTUUgPSAoXG4gIDxkaXY+XG4gICAgPHA+XG4gICAgICBUaGFua3MgZm9yIHRyeWluZyBOdWNsaWRlLCBGYWNlYm9vaydzXG4gICAgICA8YnIgLz5cbiAgICAgIHVuaWZpZWQgZGV2ZWxvcGVyIGVudmlyb25tZW50LlxuICAgIDwvcD5cbiAgICA8cD5cbiAgICAgIFdlIHdvdWxkIGxvdmUgeW91ciBmZWVkYmFjayBhbmQgY29udHJpYnV0aW9ucyB0byBjb250aW51ZSB0byBtYWtlIGl0IGJldHRlci4gUGxlYXNlXG4gICAgICByYWlzZSBpc3N1ZXMgYW5kIHB1bGwtcmVxdWVzdHMgZGlyZWN0bHkgb25cbiAgICAgIG91ciA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL251Y2xpZGVcIj5HaXRIdWIgcmVwbzwvYT4uXG4gICAgPC9wPlxuICAgIDxwPlxuICAgICAgVGhhbmsgeW91IVxuICAgIDwvcD5cbiAgPC9kaXY+XG4pO1xuXG4vKipcbiAqIENyZWF0ZSBhIEhvbWVQYW5lSXRlbSBjb21wb25lbnQgY2xhc3MgdGhhdCdzIGJvdW5kIHRvIHRoZSBwcm92aWRlZCBzdHJlYW0gb2YgaG9tZSBmcmFnbWVudHMuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUhvbWVQYW5lSXRlbShcbiAgYWxsSG9tZUZyYWdtZW50c1N0cmVhbTogUnguT2JzZXJ2YWJsZTxJbW11dGFibGUuU2V0PEhvbWVGcmFnbWVudHM+Pixcbik6IEdhZGdldCB7XG5cbiAgY2xhc3MgSG9tZVBhbmVJdGVtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIHN0YXRpYyBnYWRnZXRJZCA9ICdudWNsaWRlLWhvbWUnO1xuXG4gICAgc3RhdGU6IHtcbiAgICAgIGFsbEhvbWVGcmFnbWVudHM6IEltbXV0YWJsZS5TZXQ8c3RyaW5nLCBSZWFjdEVsZW1lbnQ+O1xuICAgIH07XG5cbiAgICBfaG9tZUZyYWdtZW50c1N1YnNjcmlwdGlvbjogSURpc3Bvc2FibGU7XG5cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIGFsbEhvbWVGcmFnbWVudHM6IEltbXV0YWJsZS5TZXQoKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICB0aGlzLl9ob21lRnJhZ21lbnRzU3Vic2NyaXB0aW9uID0gYWxsSG9tZUZyYWdtZW50c1N0cmVhbS5mb3JFYWNoKFxuICAgICAgICBhbGxIb21lRnJhZ21lbnRzID0+IHRoaXMuc2V0U3RhdGUoe2FsbEhvbWVGcmFnbWVudHN9KSxcbiAgICAgICk7XG5cbiAgICAgIGZlYXR1cmVDb25maWcuc2V0KCdudWNsaWRlLWhvbWUuc2hvd0hvbWUnLCB0cnVlKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB3ZWxjb21lcyA9IFtdO1xuICAgICAgY29uc3QgZmVhdHVyZXMgPSBbXTtcbiAgICAgIGNvbnN0IHNvcnRlZEhvbWVGcmFnbWVudHMgPSBhcnJheUZyb20odGhpcy5zdGF0ZS5hbGxIb21lRnJhZ21lbnRzKS5zb3J0KFxuICAgICAgICAoZnJhZ21lbnRBLCBmcmFnbWVudEIpID0+IChmcmFnbWVudEIucHJpb3JpdHkgfHwgMCkgLSAoZnJhZ21lbnRBLnByaW9yaXR5IHx8IDApXG4gICAgICApO1xuICAgICAgc29ydGVkSG9tZUZyYWdtZW50cy5mb3JFYWNoKGZyYWdtZW50ID0+IHtcbiAgICAgICAgY29uc3Qge3dlbGNvbWUsIGZlYXR1cmV9ID0gZnJhZ21lbnQ7XG4gICAgICAgIGlmICh3ZWxjb21lKSB7XG4gICAgICAgICAgd2VsY29tZXMucHVzaCg8ZGl2IGtleT17d2VsY29tZXMubGVuZ3RofT57d2VsY29tZX08L2Rpdj4pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmZWF0dXJlKSB7XG4gICAgICAgICAgZmVhdHVyZXMucHVzaCg8SG9tZUZlYXR1cmVDb21wb25lbnQga2V5PXtmZWF0dXJlcy5sZW5ndGh9IHsuLi5mZWF0dXJlfSAvPik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBjb250YWluZXJzID0gW1xuICAgICAgICA8ZGl2IGtleT1cIndlbGNvbWVcIiBjbGFzc05hbWU9XCJudWNsaWRlLWhvbWUtY29udGFpbmVyXCI+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgIDxOdWNsaWRlTG9nbyBjbGFzc05hbWU9XCJudWNsaWRlLWhvbWUtbG9nb1wiIC8+XG4gICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwibnVjbGlkZS1ob21lLXRpdGxlXCI+V2VsY29tZSB0byBOdWNsaWRlPC9oMT5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgIHt3ZWxjb21lcy5sZW5ndGggPiAwID8gd2VsY29tZXMgOiBERUZBVUxUX1dFTENPTUV9XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICA8L2Rpdj4sXG4gICAgICBdO1xuXG4gICAgICBpZiAoZmVhdHVyZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb250YWluZXJzLnB1c2goPGRpdiBrZXk9XCJmZWF0dXJlc1wiIGNsYXNzTmFtZT1cIm51Y2xpZGUtaG9tZS1jb250YWluZXJcIj57ZmVhdHVyZXN9PC9kaXY+KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gUmUtdXNlIHN0eWxlcyBmcm9tIHRoZSBBdG9tIHdlbGNvbWUgcGFuZSB3aGVyZSBwb3NzaWJsZS5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWhvbWUgcGFuZS1pdGVtIHBhZGRlZCBudWNsaWRlLWhvbWUtY29udGFpbmVyc1wiPlxuICAgICAgICAgIHtjb250YWluZXJzfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnSG9tZSc7XG4gICAgfVxuXG4gICAgZ2V0SWNvbk5hbWUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnaG9tZSc7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGZhbHNlIHRvIHByZXZlbnQgdGhlIHRhYiBnZXR0aW5nIHNwbGl0IChzaW5jZSB3ZSBvbmx5IHVwZGF0ZSBhIHNpbmdsZXRvbiBoZWFsdGggcGFuZSkuXG4gICAgY29weSgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgIGZlYXR1cmVDb25maWcuc2V0KCdudWNsaWRlLWhvbWUuc2hvd0hvbWUnLCBmYWxzZSk7XG5cbiAgICAgIGlmICh0aGlzLl9ob21lRnJhZ21lbnRzU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRoaXMuX2hvbWVGcmFnbWVudHNTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9XG5cbiAgcmV0dXJuICgoSG9tZVBhbmVJdGVtOiBhbnkpOiBHYWRnZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUhvbWVQYW5lSXRlbTtcbiJdfQ==