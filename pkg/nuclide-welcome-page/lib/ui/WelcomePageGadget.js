'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WELCOME_PAGE_VIEW_URI = undefined;

var _observePaneItemVisibility;

function _load_observePaneItemVisibility() {
  return _observePaneItemVisibility = _interopRequireDefault(require('../../../../modules/nuclide-commons-atom/observePaneItemVisibility'));
}

var _reactRedux;

function _load_reactRedux() {
  return _reactRedux = require('react-redux');
}

var _Actions;

function _load_Actions() {
  return _Actions = require('../redux/Actions');
}

var _react = _interopRequireWildcard(require('react'));

var _WelcomePageComponent;

function _load_WelcomePageComponent() {
  return _WelcomePageComponent = require('./WelcomePageComponent');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WELCOME_PAGE_VIEW_URI = exports.WELCOME_PAGE_VIEW_URI = 'atom://nuclide/welcome-page'; /**
                                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                                              * All rights reserved.
                                                                                              *
                                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                                              * the root directory of this source tree.
                                                                                              *
                                                                                              * 
                                                                                              * @format
                                                                                              */

class WelcomePageGadget extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._customSubscribe = listener => {
      const { store } = this.props;
      return store.subscribe(() => {
        const { isWelcomePageVisible } = store.getState();
        if (!isWelcomePageVisible) {
          return;
        }
        listener();
      });
    }, _temp;
  }

  getTitle() {
    return 'Welcome to Nuclide';
  }

  getIconName() {
    return 'nuclicon-nuclide';
  }

  componentDidMount() {
    this._visibilitySubscription = (0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(this).subscribe(visible => {
      this.didChangeVisibility(visible);
    });
  }

  componentWillUnmount() {
    // This ensures that if the pane is closed the visibility is updated
    this.props.store.dispatch((0, (_Actions || _load_Actions()).updateWelcomePageVisibility)(false));
    this._visibilitySubscription.unsubscribe();
  }

  didChangeVisibility(visible) {
    if (!atom.workspace.getModalPanels().some(modal => modal.isVisible())) {
      // If we tab away from smartlog, activate the new item
      // so the user can interact immediately. But we should only do this
      // if no modal is visible, or else we'll focus behind the modal
      atom.workspace.getActivePane().activate();
    }

    this.props.store.dispatch((0, (_Actions || _load_Actions()).updateWelcomePageVisibility)(visible));
  }

  render() {
    const { store } = this.props;
    const visibleStore = Object.assign({}, store, { subscribe: this._customSubscribe });
    return _react.createElement(
      (_reactRedux || _load_reactRedux()).Provider,
      { store: visibleStore },
      _react.createElement((_WelcomePageComponent || _load_WelcomePageComponent()).WelcomePageContainer, null)
    );
  }

  // don't emit when smartlog's not visible to prevent needless re-calculations


  getDefaultLocation() {
    return 'center';
  }

  getURI() {
    return WELCOME_PAGE_VIEW_URI;
  }
}
exports.default = WelcomePageGadget;