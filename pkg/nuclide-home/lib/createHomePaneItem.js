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

        this._homeFragmentsSubscription = allHomeFragmentsStream.subscribe(function (allHomeFragments) {
          return _this.setState({ allHomeFragments: allHomeFragments });
        });

        featureConfig.set('nuclide-home.showHome', true);
      }
    }, {
      key: 'render',
      value: function render() {
        var welcomes = [];
        var features = [];
        var sortedHomeFragments = Array.from(this.state.allHomeFragments).sort(function (fragmentA, fragmentB) {
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
          this._homeFragmentsSubscription.unsubscribe();
        }
      }
    }]);

    return HomePaneItem;
  })(React.Component);

  return HomePaneItem;
}

module.exports = createHomePaneItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUhvbWVQYW5lSXRlbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O2VBQ3ZCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7O0FBQ1osSUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUMvRCxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTdDLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDOztBQUU5RCxJQUFNLGVBQWUsR0FDbkI7OztFQUNFOzs7O0lBRUUsK0JBQU07O0dBRUo7RUFDSjs7OztJQUdNOztRQUFHLElBQUksRUFBQyxxQ0FBcUM7O0tBQWdCOztHQUMvRDtFQUNKOzs7O0dBRUk7Q0FDQSxBQUNQLENBQUM7Ozs7O0FBS0YsU0FBUyxrQkFBa0IsQ0FDekIsc0JBQW1FLEVBQzNEO01BRUYsWUFBWTtjQUFaLFlBQVk7O2lCQUFaLFlBQVk7O2FBRUUsY0FBYzs7OztBQVFyQixhQVZQLFlBQVksR0FVSzs0QkFWakIsWUFBWTs7d0NBVUQsSUFBSTtBQUFKLFlBQUk7OztBQUNqQixpQ0FYRSxZQUFZLDhDQVdMLElBQUksRUFBRTtBQUNmLFVBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCx3QkFBZ0IsRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFO09BQ2xDLENBQUM7S0FDSDs7aUJBZkcsWUFBWTs7YUFpQkMsNkJBQUc7OztBQUNsQixZQUFJLENBQUMsMEJBQTBCLEdBQUcsc0JBQXNCLENBQUMsU0FBUyxDQUNoRSxVQUFBLGdCQUFnQjtpQkFBSSxNQUFLLFFBQVEsQ0FBQyxFQUFDLGdCQUFnQixFQUFoQixnQkFBZ0IsRUFBQyxDQUFDO1NBQUEsQ0FDdEQsQ0FBQzs7QUFFRixxQkFBYSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUNsRDs7O2FBRUssa0JBQUc7QUFDUCxZQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDcEIsWUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFlBQU0sbUJBQW1CLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUN0RSxVQUFDLFNBQVMsRUFBRSxTQUFTO2lCQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUEsSUFBSyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQSxBQUFDO1NBQUEsQ0FDaEYsQ0FBQztBQUNGLDJCQUFtQixDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVEsRUFBSTtjQUMvQixPQUFPLEdBQWEsUUFBUSxDQUE1QixPQUFPO2NBQUUsT0FBTyxHQUFJLFFBQVEsQ0FBbkIsT0FBTzs7QUFDdkIsY0FBSSxPQUFPLEVBQUU7QUFDWCxvQkFBUSxDQUFDLElBQUksQ0FBQzs7Z0JBQUssR0FBRyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEFBQUM7Y0FBRSxPQUFPO2FBQU8sQ0FBQyxDQUFDO1dBQzNEO0FBQ0QsY0FBSSxPQUFPLEVBQUU7QUFDWCxvQkFBUSxDQUFDLElBQUksQ0FBQyxvQkFBQyxvQkFBb0IsYUFBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQUFBQyxJQUFLLE9BQU8sRUFBSSxDQUFDLENBQUM7V0FDNUU7U0FDRixDQUFDLENBQUM7O0FBRUgsWUFBTSxVQUFVLEdBQUcsQ0FDakI7O1lBQUssR0FBRyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsd0JBQXdCO1VBQ25EOztjQUFTLFNBQVMsRUFBQyxhQUFhO1lBQzlCLG9CQUFDLFdBQVcsSUFBQyxTQUFTLEVBQUMsbUJBQW1CLEdBQUc7WUFDN0M7O2dCQUFJLFNBQVMsRUFBQyxvQkFBb0I7O2FBQXdCO1dBQ2xEO1VBQ1Y7O2NBQVMsU0FBUyxFQUFDLGFBQWE7WUFDN0IsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLGVBQWU7V0FDekM7U0FDTixDQUNQLENBQUM7O0FBRUYsWUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN2QixvQkFBVSxDQUFDLElBQUksQ0FBQzs7Y0FBSyxHQUFHLEVBQUMsVUFBVSxFQUFDLFNBQVMsRUFBQyx3QkFBd0I7WUFBRSxRQUFRO1dBQU8sQ0FBQyxDQUFDO1NBQzFGOztBQUVEOztBQUVFOztjQUFLLFNBQVMsRUFBQyx1REFBdUQ7WUFDbkUsVUFBVTtXQUNQO1VBQ047T0FDSDs7O2FBRU8sb0JBQVc7QUFDakIsZUFBTyxNQUFNLENBQUM7T0FDZjs7O2FBRVUsdUJBQVc7QUFDcEIsZUFBTyxNQUFNLENBQUM7T0FDZjs7Ozs7YUFHRyxnQkFBRztBQUNMLGVBQU8sS0FBSyxDQUFDO09BQ2Q7OzthQUVtQixnQ0FBRztBQUNyQixxQkFBYSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFbEQsWUFBSSxJQUFJLENBQUMsMEJBQTBCLEVBQUU7QUFDbkMsY0FBSSxDQUFDLDBCQUEwQixDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQy9DO09BQ0Y7OztXQXBGRyxZQUFZO0tBQVMsS0FBSyxDQUFDLFNBQVM7O0FBd0YxQyxTQUFTLFlBQVksQ0FBZ0I7Q0FDdEM7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJjcmVhdGVIb21lUGFuZUl0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7R2FkZ2V0fSBmcm9tICcuLi8uLi9udWNsaWRlLWdhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7SG9tZUZyYWdtZW50c30gZnJvbSAnLi4vLi4vbnVjbGlkZS1ob21lLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUgUnggZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuY29uc3QgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IEhvbWVGZWF0dXJlQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9Ib21lRmVhdHVyZUNvbXBvbmVudCcpO1xuY29uc3QgTnVjbGlkZUxvZ28gPSByZXF1aXJlKCcuL051Y2xpZGVMb2dvJyk7XG5cbmNvbnN0IGZlYXR1cmVDb25maWcgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWZlYXR1cmUtY29uZmlnJyk7XG5cbmNvbnN0IERFRkFVTFRfV0VMQ09NRSA9IChcbiAgPGRpdj5cbiAgICA8cD5cbiAgICAgIFRoYW5rcyBmb3IgdHJ5aW5nIE51Y2xpZGUsIEZhY2Vib29rJ3NcbiAgICAgIDxiciAvPlxuICAgICAgdW5pZmllZCBkZXZlbG9wZXIgZW52aXJvbm1lbnQuXG4gICAgPC9wPlxuICAgIDxwPlxuICAgICAgV2Ugd291bGQgbG92ZSB5b3VyIGZlZWRiYWNrIGFuZCBjb250cmlidXRpb25zIHRvIGNvbnRpbnVlIHRvIG1ha2UgaXQgYmV0dGVyLiBQbGVhc2VcbiAgICAgIHJhaXNlIGlzc3VlcyBhbmQgcHVsbC1yZXF1ZXN0cyBkaXJlY3RseSBvblxuICAgICAgb3VyIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svbnVjbGlkZVwiPkdpdEh1YiByZXBvPC9hPi5cbiAgICA8L3A+XG4gICAgPHA+XG4gICAgICBUaGFuayB5b3UhXG4gICAgPC9wPlxuICA8L2Rpdj5cbik7XG5cbi8qKlxuICogQ3JlYXRlIGEgSG9tZVBhbmVJdGVtIGNvbXBvbmVudCBjbGFzcyB0aGF0J3MgYm91bmQgdG8gdGhlIHByb3ZpZGVkIHN0cmVhbSBvZiBob21lIGZyYWdtZW50cy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlSG9tZVBhbmVJdGVtKFxuICBhbGxIb21lRnJhZ21lbnRzU3RyZWFtOiBSeC5PYnNlcnZhYmxlPEltbXV0YWJsZS5TZXQ8SG9tZUZyYWdtZW50cz4+LFxuKTogR2FkZ2V0IHtcblxuICBjbGFzcyBIb21lUGFuZUl0ZW0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gICAgc3RhdGljIGdhZGdldElkID0gJ251Y2xpZGUtaG9tZSc7XG5cbiAgICBzdGF0ZToge1xuICAgICAgYWxsSG9tZUZyYWdtZW50czogSW1tdXRhYmxlLlNldDxzdHJpbmcsIFJlYWN0LkVsZW1lbnQ+O1xuICAgIH07XG5cbiAgICBfaG9tZUZyYWdtZW50c1N1YnNjcmlwdGlvbjogcngkSVN1YnNjcmlwdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgYWxsSG9tZUZyYWdtZW50czogSW1tdXRhYmxlLlNldCgpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgIHRoaXMuX2hvbWVGcmFnbWVudHNTdWJzY3JpcHRpb24gPSBhbGxIb21lRnJhZ21lbnRzU3RyZWFtLnN1YnNjcmliZShcbiAgICAgICAgYWxsSG9tZUZyYWdtZW50cyA9PiB0aGlzLnNldFN0YXRlKHthbGxIb21lRnJhZ21lbnRzfSksXG4gICAgICApO1xuXG4gICAgICBmZWF0dXJlQ29uZmlnLnNldCgnbnVjbGlkZS1ob21lLnNob3dIb21lJywgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qgd2VsY29tZXMgPSBbXTtcbiAgICAgIGNvbnN0IGZlYXR1cmVzID0gW107XG4gICAgICBjb25zdCBzb3J0ZWRIb21lRnJhZ21lbnRzID0gQXJyYXkuZnJvbSh0aGlzLnN0YXRlLmFsbEhvbWVGcmFnbWVudHMpLnNvcnQoXG4gICAgICAgIChmcmFnbWVudEEsIGZyYWdtZW50QikgPT4gKGZyYWdtZW50Qi5wcmlvcml0eSB8fCAwKSAtIChmcmFnbWVudEEucHJpb3JpdHkgfHwgMClcbiAgICAgICk7XG4gICAgICBzb3J0ZWRIb21lRnJhZ21lbnRzLmZvckVhY2goZnJhZ21lbnQgPT4ge1xuICAgICAgICBjb25zdCB7d2VsY29tZSwgZmVhdHVyZX0gPSBmcmFnbWVudDtcbiAgICAgICAgaWYgKHdlbGNvbWUpIHtcbiAgICAgICAgICB3ZWxjb21lcy5wdXNoKDxkaXYga2V5PXt3ZWxjb21lcy5sZW5ndGh9Pnt3ZWxjb21lfTwvZGl2Pik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZlYXR1cmUpIHtcbiAgICAgICAgICBmZWF0dXJlcy5wdXNoKDxIb21lRmVhdHVyZUNvbXBvbmVudCBrZXk9e2ZlYXR1cmVzLmxlbmd0aH0gey4uLmZlYXR1cmV9IC8+KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGNvbnRhaW5lcnMgPSBbXG4gICAgICAgIDxkaXYga2V5PVwid2VsY29tZVwiIGNsYXNzTmFtZT1cIm51Y2xpZGUtaG9tZS1jb250YWluZXJcIj5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgPE51Y2xpZGVMb2dvIGNsYXNzTmFtZT1cIm51Y2xpZGUtaG9tZS1sb2dvXCIgLz5cbiAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJudWNsaWRlLWhvbWUtdGl0bGVcIj5XZWxjb21lIHRvIE51Y2xpZGU8L2gxPlxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAge3dlbGNvbWVzLmxlbmd0aCA+IDAgPyB3ZWxjb21lcyA6IERFRkFVTFRfV0VMQ09NRX1cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDwvZGl2PixcbiAgICAgIF07XG5cbiAgICAgIGlmIChmZWF0dXJlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnRhaW5lcnMucHVzaCg8ZGl2IGtleT1cImZlYXR1cmVzXCIgY2xhc3NOYW1lPVwibnVjbGlkZS1ob21lLWNvbnRhaW5lclwiPntmZWF0dXJlc308L2Rpdj4pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICAvLyBSZS11c2Ugc3R5bGVzIGZyb20gdGhlIEF0b20gd2VsY29tZSBwYW5lIHdoZXJlIHBvc3NpYmxlLlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtaG9tZSBwYW5lLWl0ZW0gcGFkZGVkIG51Y2xpZGUtaG9tZS1jb250YWluZXJzXCI+XG4gICAgICAgICAge2NvbnRhaW5lcnN9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdIb21lJztcbiAgICB9XG5cbiAgICBnZXRJY29uTmFtZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdob21lJztcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gZmFsc2UgdG8gcHJldmVudCB0aGUgdGFiIGdldHRpbmcgc3BsaXQgKHNpbmNlIHdlIG9ubHkgdXBkYXRlIGEgc2luZ2xldG9uIGhlYWx0aCBwYW5lKS5cbiAgICBjb3B5KCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgZmVhdHVyZUNvbmZpZy5zZXQoJ251Y2xpZGUtaG9tZS5zaG93SG9tZScsIGZhbHNlKTtcblxuICAgICAgaWYgKHRoaXMuX2hvbWVGcmFnbWVudHNTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgdGhpcy5faG9tZUZyYWdtZW50c1N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfVxuICAgIH1cblxuICB9XG5cbiAgcmV0dXJuICgoSG9tZVBhbmVJdGVtOiBhbnkpOiBHYWRnZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUhvbWVQYW5lSXRlbTtcbiJdfQ==