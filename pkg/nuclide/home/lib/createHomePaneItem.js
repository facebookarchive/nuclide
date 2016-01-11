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
var React = require('react-for-atom');
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
//# sourceMappingURL=data:application/json;base64,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O1lBQzlCLG9CQUFDLFdBQVcsSUFBQyxTQUFTLEVBQUMsbUJBQW1CLEdBQUc7WUFDN0M7O2dCQUFJLFNBQVMsRUFBQyxvQkFBb0I7O2FBQXdCO1dBQ2xEO1VBQ1Y7O2NBQVMsU0FBUyxFQUFDLGFBQWE7WUFDN0IsUUFBUTtXQUNEO1NBQ04sQ0FDUCxDQUFDOztBQUVGLFlBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDdkIsb0JBQVUsQ0FBQyxJQUFJLENBQUM7O2NBQUssR0FBRyxFQUFDLFVBQVUsRUFBQyxTQUFTLEVBQUMsd0JBQXdCO1lBQUUsUUFBUTtXQUFPLENBQUMsQ0FBQztTQUMxRjs7QUFFRDs7QUFFRTs7Y0FBSyxTQUFTLEVBQUMsdURBQXVEO1lBQ25FLFVBQVU7V0FDUDtVQUNOO09BQ0g7OzthQUVPLG9CQUFXO0FBQ2pCLGVBQU8sTUFBTSxDQUFDO09BQ2Y7OzthQUVVLHVCQUFXO0FBQ3BCLGVBQU8sTUFBTSxDQUFDO09BQ2Y7Ozs7O2FBR0csZ0JBQUc7QUFDTCxlQUFPLEtBQUssQ0FBQztPQUNkOzs7YUFFbUIsZ0NBQUc7QUFDckIscUJBQWEsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRWxELFlBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFO0FBQ25DLGNBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUMzQztPQUNGOzs7V0FqRkcsWUFBWTtLQUFTLEtBQUssQ0FBQyxTQUFTOztBQXFGMUMsU0FBUyxZQUFZLENBQWdCO0NBQ3RDOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiY3JlYXRlSG9tZVBhbmVJdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldH0gZnJvbSAnLi4vLi4vZ2FkZ2V0cy1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9ob21lLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUgUnggZnJvbSAncngnO1xuXG5jb25zdCBJbW11dGFibGUgPSByZXF1aXJlKCdpbW11dGFibGUnKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IEhvbWVGZWF0dXJlQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9Ib21lRmVhdHVyZUNvbXBvbmVudCcpO1xuY29uc3QgTnVjbGlkZUxvZ28gPSByZXF1aXJlKCcuL051Y2xpZGVMb2dvJyk7XG5cbmNvbnN0IGFycmF5RnJvbSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKS5hcnJheS5mcm9tO1xuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2ZlYXR1cmUtY29uZmlnJyk7XG5cbmNvbnN0IERFRkFVTFRfV0VMQ09NRSA9IChcbiAgPGRpdj5cbiAgICA8cD5cbiAgICAgIFRoYW5rcyBmb3IgdHJ5aW5nIE51Y2xpZGUsIEZhY2Vib29rJ3NcbiAgICAgIDxiciAvPlxuICAgICAgdW5pZmllZCBkZXZlbG9wZXIgZW52aXJvbm1lbnQuXG4gICAgPC9wPlxuICAgIDxwPlxuICAgICAgV2Ugd291bGQgbG92ZSB5b3VyIGZlZWRiYWNrIGFuZCBjb250cmlidXRpb25zIHRvIGNvbnRpbnVlIHRvIG1ha2UgaXQgYmV0dGVyLiBQbGVhc2VcbiAgICAgIHJhaXNlIGlzc3VlcyBhbmQgcHVsbC1yZXF1ZXN0cyBkaXJlY3RseSBvblxuICAgICAgb3VyIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svbnVjbGlkZVwiPkdpdEh1YiByZXBvPC9hPi5cbiAgICA8L3A+XG4gICAgPHA+XG4gICAgICBUaGFuayB5b3UhXG4gICAgPC9wPlxuICA8L2Rpdj5cbik7XG5cbi8qKlxuICogQ3JlYXRlIGEgSG9tZVBhbmVJdGVtIGNvbXBvbmVudCBjbGFzcyB0aGF0J3MgYm91bmQgdG8gdGhlIHByb3ZpZGVkIHN0cmVhbSBvZiBob21lIGZyYWdtZW50cy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlSG9tZVBhbmVJdGVtKFxuICBhbGxIb21lRnJhZ21lbnRzU3RyZWFtOiBSeC5PYnNlcnZhYmxlPEltbXV0YWJsZS5TZXQ8SG9tZUZyYWdtZW50cz4+LFxuKTogdHlwZW9mIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY2xhc3MgSG9tZVBhbmVJdGVtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIHN0YXRpYyBnYWRnZXRJZCA9ICdudWNsaWRlLWhvbWUnO1xuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICBhbGxIb21lRnJhZ21lbnRzOiBJbW11dGFibGUuU2V0KCksXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdGhpcy5faG9tZUZyYWdtZW50c1N1YnNjcmlwdGlvbiA9IGFsbEhvbWVGcmFnbWVudHNTdHJlYW0uZm9yRWFjaChcbiAgICAgICAgYWxsSG9tZUZyYWdtZW50cyA9PiB0aGlzLnNldFN0YXRlKHthbGxIb21lRnJhZ21lbnRzfSksXG4gICAgICApO1xuXG4gICAgICBmZWF0dXJlQ29uZmlnLnNldCgnbnVjbGlkZS1ob21lLnNob3dIb21lJywgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgbGV0IHdlbGNvbWVzID0gW107XG4gICAgICBjb25zdCBmZWF0dXJlcyA9IFtdO1xuICAgICAgY29uc3Qgc29ydGVkSG9tZUZyYWdtZW50cyA9IGFycmF5RnJvbSh0aGlzLnN0YXRlLmFsbEhvbWVGcmFnbWVudHMpLnNvcnQoXG4gICAgICAgIChmcmFnbWVudEEsIGZyYWdtZW50QikgPT4gKGZyYWdtZW50Qi5wcmlvcml0eSB8fCAwKSAtIChmcmFnbWVudEEucHJpb3JpdHkgfHwgMClcbiAgICAgICk7XG4gICAgICBzb3J0ZWRIb21lRnJhZ21lbnRzLmZvckVhY2goZnJhZ21lbnQgPT4ge1xuICAgICAgICBjb25zdCB7d2VsY29tZSwgZmVhdHVyZX0gPSBmcmFnbWVudDtcbiAgICAgICAgaWYgKHdlbGNvbWUpIHtcbiAgICAgICAgICB3ZWxjb21lcy5wdXNoKDxkaXYga2V5PXt3ZWxjb21lcy5sZW5ndGh9Pnt3ZWxjb21lfTwvZGl2Pik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZlYXR1cmUpIHtcbiAgICAgICAgICBmZWF0dXJlcy5wdXNoKDxIb21lRmVhdHVyZUNvbXBvbmVudCBrZXk9e2ZlYXR1cmVzLmxlbmd0aH0gey4uLmZlYXR1cmV9IC8+KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAod2VsY29tZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHdlbGNvbWVzID0gREVGQVVMVF9XRUxDT01FO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb250YWluZXJzID0gW1xuICAgICAgICA8ZGl2IGtleT1cIndlbGNvbWVcIiBjbGFzc05hbWU9XCJudWNsaWRlLWhvbWUtY29udGFpbmVyXCI+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgIDxOdWNsaWRlTG9nbyBjbGFzc05hbWU9XCJudWNsaWRlLWhvbWUtbG9nb1wiIC8+XG4gICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwibnVjbGlkZS1ob21lLXRpdGxlXCI+V2VsY29tZSB0byBOdWNsaWRlPC9oMT5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgIHt3ZWxjb21lc31cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDwvZGl2PixcbiAgICAgIF07XG5cbiAgICAgIGlmIChmZWF0dXJlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnRhaW5lcnMucHVzaCg8ZGl2IGtleT1cImZlYXR1cmVzXCIgY2xhc3NOYW1lPVwibnVjbGlkZS1ob21lLWNvbnRhaW5lclwiPntmZWF0dXJlc308L2Rpdj4pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICAvLyBSZS11c2Ugc3R5bGVzIGZyb20gdGhlIEF0b20gd2VsY29tZSBwYW5lIHdoZXJlIHBvc3NpYmxlLlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtaG9tZSBwYW5lLWl0ZW0gcGFkZGVkIG51Y2xpZGUtaG9tZS1jb250YWluZXJzXCI+XG4gICAgICAgICAge2NvbnRhaW5lcnN9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdIb21lJztcbiAgICB9XG5cbiAgICBnZXRJY29uTmFtZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdob21lJztcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gZmFsc2UgdG8gcHJldmVudCB0aGUgdGFiIGdldHRpbmcgc3BsaXQgKHNpbmNlIHdlIG9ubHkgdXBkYXRlIGEgc2luZ2xldG9uIGhlYWx0aCBwYW5lKS5cbiAgICBjb3B5KCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgZmVhdHVyZUNvbmZpZy5zZXQoJ251Y2xpZGUtaG9tZS5zaG93SG9tZScsIGZhbHNlKTtcblxuICAgICAgaWYgKHRoaXMuX2hvbWVGcmFnbWVudHNTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgdGhpcy5faG9tZUZyYWdtZW50c1N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cblxuICByZXR1cm4gKChIb21lUGFuZUl0ZW06IGFueSk6IEdhZGdldCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlSG9tZVBhbmVJdGVtO1xuIl19