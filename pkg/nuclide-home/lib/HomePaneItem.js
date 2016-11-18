'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _reactForAtom = require('react-for-atom');

var _HomeFeatureComponent;

function _load_HomeFeatureComponent() {
  return _HomeFeatureComponent = _interopRequireDefault(require('./HomeFeatureComponent'));
}

var _NuclideLogo;

function _load_NuclideLogo() {
  return _NuclideLogo = _interopRequireDefault(require('./NuclideLogo'));
}

var _createUtmUrl;

function _load_createUtmUrl() {
  return _createUtmUrl = _interopRequireDefault(require('./createUtmUrl'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../nuclide-ui/Checkbox');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NUCLIDE_DOCS_URL = (0, (_createUtmUrl || _load_createUtmUrl()).default)('http://nuclide.io', 'welcome');
const DEFAULT_WELCOME = _reactForAtom.React.createElement(
  'div',
  null,
  _reactForAtom.React.createElement(
    'p',
    null,
    'Thanks for trying Nuclide, Facebook\'s',
    _reactForAtom.React.createElement('br', null),
    'unified developer environment.'
  ),
  _reactForAtom.React.createElement(
    'ul',
    { className: 'text-left' },
    _reactForAtom.React.createElement(
      'li',
      null,
      _reactForAtom.React.createElement(
        'a',
        { href: NUCLIDE_DOCS_URL },
        'Get Started!'
      ),
      ' In-depth docs on our features.'
    ),
    _reactForAtom.React.createElement(
      'li',
      null,
      _reactForAtom.React.createElement(
        'a',
        { href: 'https://github.com/facebook/nuclide' },
        'GitHub'
      ),
      ' Pull requests, issues, and feedback.'
    )
  ),
  _reactForAtom.React.createElement(
    'p',
    null,
    'We hope you enjoy using Nuclide',
    _reactForAtom.React.createElement('br', null),
    'at least as much as we enjoy building it.'
  )
);

let HomePaneItem = class HomePaneItem extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleShowOnStartupChange = this._handleShowOnStartupChange.bind(this);
    this.state = {
      showOnStartup: Boolean((_featureConfig || _load_featureConfig()).default.get('nuclide-home.showHome')),
      allHomeFragments: (_immutable || _load_immutable()).default.Set()
    };
  }

  componentDidMount() {
    // Note: We're assuming that the allHomeFragmentsStream prop never changes.
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this.props.allHomeFragmentsStream.subscribe(allHomeFragments => this.setState({ allHomeFragments: allHomeFragments })), (_featureConfig || _load_featureConfig()).default.observeAsStream('nuclide-home.showHome').subscribe(showOnStartup => {
      this.setState({ showOnStartup: showOnStartup });
    }));
  }

  render() {
    const welcomes = [];
    const features = [];
    const sortedHomeFragments = Array.from(this.state.allHomeFragments).sort((fragmentA, fragmentB) => (fragmentB.priority || 0) - (fragmentA.priority || 0));
    sortedHomeFragments.forEach(fragment => {
      const welcome = fragment.welcome,
            feature = fragment.feature;

      if (welcome) {
        welcomes.push(_reactForAtom.React.createElement(
          'div',
          { key: welcomes.length },
          welcome
        ));
      }
      if (feature) {
        features.push(_reactForAtom.React.createElement((_HomeFeatureComponent || _load_HomeFeatureComponent()).default, Object.assign({ key: features.length }, feature)));
      }
    });

    const containers = [_reactForAtom.React.createElement(
      'div',
      { key: 'welcome', className: 'nuclide-home-container' },
      _reactForAtom.React.createElement(
        'section',
        { className: 'text-center' },
        _reactForAtom.React.createElement((_NuclideLogo || _load_NuclideLogo()).default, { className: 'nuclide-home-logo' }),
        _reactForAtom.React.createElement(
          'h1',
          { className: 'nuclide-home-title' },
          'Welcome to Nuclide'
        )
      ),
      _reactForAtom.React.createElement(
        'section',
        { className: 'text-center' },
        welcomes.length > 0 ? welcomes : DEFAULT_WELCOME
      ),
      _reactForAtom.React.createElement(
        'section',
        { className: 'text-center' },
        _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          checked: this.state.showOnStartup,
          onChange: this._handleShowOnStartupChange,
          label: 'Show this screen on startup.'
        })
      )
    )];

    if (features.length > 0) {
      containers.push(_reactForAtom.React.createElement(
        'div',
        { key: 'features', className: 'nuclide-home-container' },
        features
      ));
    }

    return (
      // Re-use styles from the Atom welcome pane where possible.
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-home pane-item padded nuclide-home-containers' },
        containers
      )
    );
  }

  _handleShowOnStartupChange(checked) {
    (_featureConfig || _load_featureConfig()).default.set('nuclide-home.showHome', checked);
  }

  getTitle() {
    return 'Home';
  }

  getIconName() {
    return 'home';
  }

  // Return false to prevent the tab getting split (since we only update a singleton health pane).
  copy() {
    return false;
  }

  componentWillUnmount() {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
  }

};
exports.default = HomePaneItem;
module.exports = exports['default'];