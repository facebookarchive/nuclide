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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _HomeFeatureComponent2;

function _HomeFeatureComponent() {
  return _HomeFeatureComponent2 = _interopRequireDefault(require('./HomeFeatureComponent'));
}

var _NuclideLogo2;

function _NuclideLogo() {
  return _NuclideLogo2 = _interopRequireDefault(require('./NuclideLogo'));
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var DEFAULT_WELCOME = (_reactForAtom2 || _reactForAtom()).React.createElement(
  'div',
  null,
  (_reactForAtom2 || _reactForAtom()).React.createElement(
    'p',
    null,
    'Thanks for trying Nuclide, Facebook\'s',
    (_reactForAtom2 || _reactForAtom()).React.createElement('br', null),
    'unified developer environment.'
  ),
  (_reactForAtom2 || _reactForAtom()).React.createElement(
    'p',
    null,
    'We would love your feedback and contributions to continue to make it better. Please raise issues and pull-requests directly on our ',
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'a',
      { href: 'https://github.com/facebook/nuclide' },
      'GitHub repo'
    ),
    '.'
  ),
  (_reactForAtom2 || _reactForAtom()).React.createElement(
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
        allHomeFragments: (_immutable2 || _immutable()).default.Set()
      };
    }

    _createClass(HomePaneItem, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this = this;

        this._homeFragmentsSubscription = allHomeFragmentsStream.subscribe(function (allHomeFragments) {
          return _this.setState({ allHomeFragments: allHomeFragments });
        });

        (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.set('nuclide-home.showHome', true);
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
            welcomes.push((_reactForAtom2 || _reactForAtom()).React.createElement(
              'div',
              { key: welcomes.length },
              welcome
            ));
          }
          if (feature) {
            features.push((_reactForAtom2 || _reactForAtom()).React.createElement((_HomeFeatureComponent2 || _HomeFeatureComponent()).default, _extends({ key: features.length }, feature)));
          }
        });

        var containers = [(_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { key: 'welcome', className: 'nuclide-home-container' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'section',
            { className: 'text-center' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_NuclideLogo2 || _NuclideLogo()).default, { className: 'nuclide-home-logo' }),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'h1',
              { className: 'nuclide-home-title' },
              'Welcome to Nuclide'
            )
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'section',
            { className: 'text-center' },
            welcomes.length > 0 ? welcomes : DEFAULT_WELCOME
          )
        )];

        if (features.length > 0) {
          containers.push((_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { key: 'features', className: 'nuclide-home-container' },
            features
          ));
        }

        return(
          // Re-use styles from the Atom welcome pane where possible.
          (_reactForAtom2 || _reactForAtom()).React.createElement(
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
        (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.set('nuclide-home.showHome', false);

        if (this._homeFragmentsSubscription) {
          this._homeFragmentsSubscription.unsubscribe();
        }
      }
    }]);

    return HomePaneItem;
  })((_reactForAtom2 || _reactForAtom()).React.Component);

  return HomePaneItem;
}

module.exports = createHomePaneItem;