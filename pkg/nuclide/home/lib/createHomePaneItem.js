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

var arrayFrom = require('../../commons').array.from;
var featureConfig = require('../../feature-config');

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
        if (welcomes.length === 0) {
          welcomes = DEFAULT_WELCOME;
        }

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
            welcomes
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUhvbWVQYW5lSXRlbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O2VBQ3ZCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxZQUFMLEtBQUs7O0FBQ1osSUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUMvRCxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTdDLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3RELElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOztBQUV0RCxJQUFNLGVBQWUsR0FDbkI7OztFQUNFOzs7O0lBRUUsK0JBQU07O0dBRUo7RUFDSjs7OztJQUdNOztRQUFHLElBQUksRUFBQyxxQ0FBcUM7O0tBQWdCOztHQUMvRDtFQUNKOzs7O0dBRUk7Q0FDQSxBQUNQLENBQUM7Ozs7O0FBS0YsU0FBUyxrQkFBa0IsQ0FDekIsc0JBQW1FLEVBQzNDO01BRWxCLFlBQVk7Y0FBWixZQUFZOztpQkFBWixZQUFZOzthQUVFLGNBQWM7Ozs7QUFFckIsYUFKUCxZQUFZLEdBSUs7NEJBSmpCLFlBQVk7O3dDQUlELElBQUk7QUFBSixZQUFJOzs7QUFDakIsaUNBTEUsWUFBWSw4Q0FLTCxJQUFJLEVBQUU7QUFDZixVQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsd0JBQWdCLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRTtPQUNsQyxDQUFDO0tBQ0g7O2lCQVRHLFlBQVk7O2FBV0MsNkJBQUc7OztBQUNsQixZQUFJLENBQUMsMEJBQTBCLEdBQUcsc0JBQXNCLENBQUMsT0FBTyxDQUM5RCxVQUFBLGdCQUFnQjtpQkFBSSxNQUFLLFFBQVEsQ0FBQyxFQUFDLGdCQUFnQixFQUFoQixnQkFBZ0IsRUFBQyxDQUFDO1NBQUEsQ0FDdEQsQ0FBQzs7QUFFRixxQkFBYSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUNsRDs7O2FBRUssa0JBQUc7QUFDUCxZQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbEIsWUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFlBQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQ3JFLFVBQUMsU0FBUyxFQUFFLFNBQVM7aUJBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQSxJQUFLLFNBQVMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFBLEFBQUM7U0FBQSxDQUNoRixDQUFDO0FBQ0YsMkJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUSxFQUFJO2NBQy9CLE9BQU8sR0FBYSxRQUFRLENBQTVCLE9BQU87Y0FBRSxPQUFPLEdBQUksUUFBUSxDQUFuQixPQUFPOztBQUN2QixjQUFJLE9BQU8sRUFBRTtBQUNYLG9CQUFRLENBQUMsSUFBSSxDQUFDOztnQkFBSyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQUFBQztjQUFFLE9BQU87YUFBTyxDQUFDLENBQUM7V0FDM0Q7QUFDRCxjQUFJLE9BQU8sRUFBRTtBQUNYLG9CQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFDLG9CQUFvQixhQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsTUFBTSxBQUFDLElBQUssT0FBTyxFQUFJLENBQUMsQ0FBQztXQUM1RTtTQUNGLENBQUMsQ0FBQztBQUNILFlBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDekIsa0JBQVEsR0FBRyxlQUFlLENBQUM7U0FDNUI7O0FBRUQsWUFBTSxVQUFVLEdBQUcsQ0FDakI7O1lBQUssR0FBRyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsd0JBQXdCO1VBQ25EOztjQUFTLFNBQVMsRUFBQyxhQUFhO1lBQzlCLG9CQUFDLFdBQVcsSUFBQyxTQUFTLEVBQUMsbUJBQW1CLEdBQUc7WUFDN0M7O2dCQUFJLFNBQVMsRUFBQyxvQkFBb0I7O2FBQXdCO1dBQ2xEO1VBQ1Y7O2NBQVMsU0FBUyxFQUFDLGFBQWE7WUFDN0IsUUFBUTtXQUNEO1NBQ04sQ0FDUCxDQUFDOztBQUVGLFlBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDdkIsb0JBQVUsQ0FBQyxJQUFJLENBQUM7O2NBQUssR0FBRyxFQUFDLFVBQVUsRUFBQyxTQUFTLEVBQUMsd0JBQXdCO1lBQUUsUUFBUTtXQUFPLENBQUMsQ0FBQztTQUMxRjs7QUFFRDs7QUFFRTs7Y0FBSyxTQUFTLEVBQUMsdURBQXVEO1lBQ25FLFVBQVU7V0FDUDtVQUNOO09BQ0g7OzthQUVPLG9CQUFXO0FBQ2pCLGVBQU8sTUFBTSxDQUFDO09BQ2Y7OzthQUVVLHVCQUFXO0FBQ3BCLGVBQU8sTUFBTSxDQUFDO09BQ2Y7Ozs7O2FBR0csZ0JBQUc7QUFDTCxlQUFPLEtBQUssQ0FBQztPQUNkOzs7YUFFbUIsZ0NBQUc7QUFDckIscUJBQWEsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRWxELFlBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFO0FBQ25DLGNBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUMzQztPQUNGOzs7V0FqRkcsWUFBWTtLQUFTLEtBQUssQ0FBQyxTQUFTOztBQXFGMUMsU0FBUyxZQUFZLENBQWdCO0NBQ3RDOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiY3JlYXRlSG9tZVBhbmVJdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldH0gZnJvbSAnLi4vLi4vZ2FkZ2V0cy1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9ob21lLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUgUnggZnJvbSAncngnO1xuXG5jb25zdCBJbW11dGFibGUgPSByZXF1aXJlKCdpbW11dGFibGUnKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3QgSG9tZUZlYXR1cmVDb21wb25lbnQgPSByZXF1aXJlKCcuL0hvbWVGZWF0dXJlQ29tcG9uZW50Jyk7XG5jb25zdCBOdWNsaWRlTG9nbyA9IHJlcXVpcmUoJy4vTnVjbGlkZUxvZ28nKTtcblxuY29uc3QgYXJyYXlGcm9tID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLmFycmF5LmZyb207XG5jb25zdCBmZWF0dXJlQ29uZmlnID0gcmVxdWlyZSgnLi4vLi4vZmVhdHVyZS1jb25maWcnKTtcblxuY29uc3QgREVGQVVMVF9XRUxDT01FID0gKFxuICA8ZGl2PlxuICAgIDxwPlxuICAgICAgVGhhbmtzIGZvciB0cnlpbmcgTnVjbGlkZSwgRmFjZWJvb2snc1xuICAgICAgPGJyIC8+XG4gICAgICB1bmlmaWVkIGRldmVsb3BlciBlbnZpcm9ubWVudC5cbiAgICA8L3A+XG4gICAgPHA+XG4gICAgICBXZSB3b3VsZCBsb3ZlIHlvdXIgZmVlZGJhY2sgYW5kIGNvbnRyaWJ1dGlvbnMgdG8gY29udGludWUgdG8gbWFrZSBpdCBiZXR0ZXIuIFBsZWFzZVxuICAgICAgcmFpc2UgaXNzdWVzIGFuZCBwdWxsLXJlcXVlc3RzIGRpcmVjdGx5IG9uXG4gICAgICBvdXIgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9udWNsaWRlXCI+R2l0SHViIHJlcG88L2E+LlxuICAgIDwvcD5cbiAgICA8cD5cbiAgICAgIFRoYW5rIHlvdSFcbiAgICA8L3A+XG4gIDwvZGl2PlxuKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBIb21lUGFuZUl0ZW0gY29tcG9uZW50IGNsYXNzIHRoYXQncyBib3VuZCB0byB0aGUgcHJvdmlkZWQgc3RyZWFtIG9mIGhvbWUgZnJhZ21lbnRzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVIb21lUGFuZUl0ZW0oXG4gIGFsbEhvbWVGcmFnbWVudHNTdHJlYW06IFJ4Lk9ic2VydmFibGU8SW1tdXRhYmxlLlNldDxIb21lRnJhZ21lbnRzPj4sXG4pOiB0eXBlb2YgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjbGFzcyBIb21lUGFuZUl0ZW0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gICAgc3RhdGljIGdhZGdldElkID0gJ251Y2xpZGUtaG9tZSc7XG5cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIGFsbEhvbWVGcmFnbWVudHM6IEltbXV0YWJsZS5TZXQoKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICB0aGlzLl9ob21lRnJhZ21lbnRzU3Vic2NyaXB0aW9uID0gYWxsSG9tZUZyYWdtZW50c1N0cmVhbS5mb3JFYWNoKFxuICAgICAgICBhbGxIb21lRnJhZ21lbnRzID0+IHRoaXMuc2V0U3RhdGUoe2FsbEhvbWVGcmFnbWVudHN9KSxcbiAgICAgICk7XG5cbiAgICAgIGZlYXR1cmVDb25maWcuc2V0KCdudWNsaWRlLWhvbWUuc2hvd0hvbWUnLCB0cnVlKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBsZXQgd2VsY29tZXMgPSBbXTtcbiAgICAgIGNvbnN0IGZlYXR1cmVzID0gW107XG4gICAgICBjb25zdCBzb3J0ZWRIb21lRnJhZ21lbnRzID0gYXJyYXlGcm9tKHRoaXMuc3RhdGUuYWxsSG9tZUZyYWdtZW50cykuc29ydChcbiAgICAgICAgKGZyYWdtZW50QSwgZnJhZ21lbnRCKSA9PiAoZnJhZ21lbnRCLnByaW9yaXR5IHx8IDApIC0gKGZyYWdtZW50QS5wcmlvcml0eSB8fCAwKVxuICAgICAgKTtcbiAgICAgIHNvcnRlZEhvbWVGcmFnbWVudHMuZm9yRWFjaChmcmFnbWVudCA9PiB7XG4gICAgICAgIGNvbnN0IHt3ZWxjb21lLCBmZWF0dXJlfSA9IGZyYWdtZW50O1xuICAgICAgICBpZiAod2VsY29tZSkge1xuICAgICAgICAgIHdlbGNvbWVzLnB1c2goPGRpdiBrZXk9e3dlbGNvbWVzLmxlbmd0aH0+e3dlbGNvbWV9PC9kaXY+KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmVhdHVyZSkge1xuICAgICAgICAgIGZlYXR1cmVzLnB1c2goPEhvbWVGZWF0dXJlQ29tcG9uZW50IGtleT17ZmVhdHVyZXMubGVuZ3RofSB7Li4uZmVhdHVyZX0gLz4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICh3ZWxjb21lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgd2VsY29tZXMgPSBERUZBVUxUX1dFTENPTUU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbnRhaW5lcnMgPSBbXG4gICAgICAgIDxkaXYga2V5PVwid2VsY29tZVwiIGNsYXNzTmFtZT1cIm51Y2xpZGUtaG9tZS1jb250YWluZXJcIj5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgPE51Y2xpZGVMb2dvIGNsYXNzTmFtZT1cIm51Y2xpZGUtaG9tZS1sb2dvXCIgLz5cbiAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJudWNsaWRlLWhvbWUtdGl0bGVcIj5XZWxjb21lIHRvIE51Y2xpZGU8L2gxPlxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAge3dlbGNvbWVzfVxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgPC9kaXY+LFxuICAgICAgXTtcblxuICAgICAgaWYgKGZlYXR1cmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29udGFpbmVycy5wdXNoKDxkaXYga2V5PVwiZmVhdHVyZXNcIiBjbGFzc05hbWU9XCJudWNsaWRlLWhvbWUtY29udGFpbmVyXCI+e2ZlYXR1cmVzfTwvZGl2Pik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIC8vIFJlLXVzZSBzdHlsZXMgZnJvbSB0aGUgQXRvbSB3ZWxjb21lIHBhbmUgd2hlcmUgcG9zc2libGUuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1ob21lIHBhbmUtaXRlbSBwYWRkZWQgbnVjbGlkZS1ob21lLWNvbnRhaW5lcnNcIj5cbiAgICAgICAgICB7Y29udGFpbmVyc31cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cblxuICAgIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gJ0hvbWUnO1xuICAgIH1cblxuICAgIGdldEljb25OYW1lKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gJ2hvbWUnO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBmYWxzZSB0byBwcmV2ZW50IHRoZSB0YWIgZ2V0dGluZyBzcGxpdCAoc2luY2Ugd2Ugb25seSB1cGRhdGUgYSBzaW5nbGV0b24gaGVhbHRoIHBhbmUpLlxuICAgIGNvcHkoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICBmZWF0dXJlQ29uZmlnLnNldCgnbnVjbGlkZS1ob21lLnNob3dIb21lJywgZmFsc2UpO1xuXG4gICAgICBpZiAodGhpcy5faG9tZUZyYWdtZW50c1N1YnNjcmlwdGlvbikge1xuICAgICAgICB0aGlzLl9ob21lRnJhZ21lbnRzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuXG4gIHJldHVybiAoKEhvbWVQYW5lSXRlbTogYW55KTogR2FkZ2V0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVIb21lUGFuZUl0ZW07XG4iXX0=