"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.WORKSPACE_VIEW_URI = void 0;

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _HomeFeatureComponent() {
  const data = _interopRequireDefault(require("./HomeFeatureComponent"));

  _HomeFeatureComponent = function () {
    return data;
  };

  return data;
}

function _createUtmUrl() {
  const data = _interopRequireDefault(require("./createUtmUrl"));

  _createUtmUrl = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _NuclideLogo() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/NuclideLogo"));

  _NuclideLogo = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("../../../modules/nuclide-commons-ui/Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const WORKSPACE_VIEW_URI = 'atom://nuclide/home';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;
const NUCLIDE_DOCS_URL = (0, _createUtmUrl().default)('http://nuclide.io', 'welcome');
const DEFAULT_WELCOME = React.createElement("div", null, React.createElement("p", null, "Thanks for trying Nuclide, Facebook's", React.createElement("br", null), "unified developer environment."), React.createElement("ul", {
  className: "text-left"
}, React.createElement("li", null, React.createElement("a", {
  href: NUCLIDE_DOCS_URL
}, "Get Started!"), " In-depth docs on our features."), React.createElement("li", null, React.createElement("a", {
  href: "https://github.com/facebook/nuclide"
}, "GitHub"), " Pull requests, issues, and feedback.")), React.createElement("p", null, "We hope you enjoy using Nuclide", React.createElement("br", null), "at least as much as we enjoy building it."));

class HomePaneItem extends React.Component {
  constructor(props) {
    super(props);

    this._handleShowOnStartupChange = checked => {
      _featureConfig().default.set('nuclide-home.showHome', checked);
    };

    this.state = {
      showOnStartup: Boolean(_featureConfig().default.get('nuclide-home.showHome')),
      allHomeFragments: Immutable().Set()
    };
  }

  componentDidMount() {
    // Note: We're assuming that the allHomeFragmentsStream prop never changes.
    this._disposables = new (_UniversalDisposable().default)(this.props.allHomeFragmentsStream.subscribe(allHomeFragments => this.setState({
      allHomeFragments
    })), _featureConfig().default.observeAsStream('nuclide-home.showHome').subscribe(showOnStartup => {
      this.setState({
        showOnStartup
      });
    }));
  }

  render() {
    const welcomes = [];
    const features = [];
    const sortedHomeFragments = Array.from(this.state.allHomeFragments).sort((fragmentA, fragmentB) => (fragmentB.priority || 0) - (fragmentA.priority || 0));
    sortedHomeFragments.forEach(fragment => {
      const {
        welcome,
        feature
      } = fragment;

      if (welcome) {
        welcomes.push(React.createElement("div", {
          key: welcomes.length
        }, welcome));
      }

      if (feature) {
        features.push(React.createElement(_HomeFeatureComponent().default, Object.assign({
          key: features.length
        }, feature)));
      }
    });
    const containers = [React.createElement("div", {
      key: "welcome",
      className: "nuclide-home-container"
    }, React.createElement("section", {
      className: "text-center"
    }, React.createElement(_NuclideLogo().default, {
      className: "nuclide-home-logo"
    }), React.createElement("h1", {
      className: "nuclide-home-title"
    }, "Welcome to Nuclide")), React.createElement("section", {
      className: "text-center",
      onClick: trackAnchorClicks
    }, welcomes.length > 0 ? welcomes : DEFAULT_WELCOME), React.createElement("section", {
      className: "text-center"
    }, React.createElement(_Checkbox().Checkbox, {
      checked: this.state.showOnStartup,
      onChange: this._handleShowOnStartupChange,
      label: "Show this screen on startup."
    })))];

    if (features.length > 0) {
      containers.push(React.createElement("div", {
        key: "features",
        className: "nuclide-home-container"
      }, features));
    }

    return (// Re-use styles from the Atom welcome pane where possible.
      React.createElement("div", {
        className: "nuclide-home pane-item padded nuclide-home-containers"
      }, containers)
    );
  }

  getTitle() {
    return 'Home';
  }

  getIconName() {
    return 'home';
  } // Return false to prevent the tab getting split (since we only update a singleton health pane).


  copy() {
    return false;
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'center';
  }

  componentWillUnmount() {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
  }

}

exports.default = HomePaneItem;

function trackAnchorClicks(e) {
  const {
    target
  } = e; // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)

  if (target.tagName !== 'A' || target.href == null) {
    return;
  } // $FlowFixMe


  const {
    href,
    innerText
  } = target;
  (0, _nuclideAnalytics().track)('home-link-clicked', {
    href,
    text: innerText
  });
}