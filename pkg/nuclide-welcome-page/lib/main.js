'use strict';

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

var _react = _interopRequireWildcard(require('react'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('../../../modules/nuclide-commons-atom/destroyItemWhere');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _reduxMin;

function _load_reduxMin() {
  return _reduxMin = require('redux/dist/redux.min.js');
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./redux/createEmptyAppState');
}

var _rootReducer;

function _load_rootReducer() {
  return _rootReducer = _interopRequireDefault(require('./redux/rootReducer'));
}

var _WelcomePageGadget;

function _load_WelcomePageGadget() {
  return _WelcomePageGadget = require('./ui/WelcomePageGadget');
}

var _WelcomePageGadget2;

function _load_WelcomePageGadget2() {
  return _WelcomePageGadget2 = _interopRequireDefault(require('./ui/WelcomePageGadget'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const SHOW_COMMAND_NAME = 'nuclide-welcome-page:show-welcome-page'; /**
                                                                     * Copyright (c) 2015-present, Facebook, Inc.
                                                                     * All rights reserved.
                                                                     *
                                                                     * This source code is licensed under the license found in the LICENSE file in
                                                                     * the root directory of this source tree.
                                                                     *
                                                                     * 
                                                                     * @format
                                                                     */

const SHOW_ALL_COMMAND_NAME = 'nuclide-welcome-page:show-all-welcome-pages';

class Activation {

  constructor(serializedState) {
    this._store = (0, (_reduxMin || _load_reduxMin()).createStore)((_rootReducer || _load_rootReducer()).default, (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)(serializedState));
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._registerDisplayCommandAndOpener());
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeWelcomePage(welcomePage) {
    this._store.dispatch((_Actions || _load_Actions()).addWelcomePage(welcomePage));
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._store.dispatch((_Actions || _load_Actions()).deleteWelcomePage(welcomePage.topic));
    });
  }

  _registerDisplayCommandAndOpener() {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      if (uri === (_WelcomePageGadget || _load_WelcomePageGadget()).WELCOME_PAGE_VIEW_URI) {
        return this._createWelcomePageViewable();
      }
    }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_WelcomePageGadget2 || _load_WelcomePageGadget2()).default),
    // show non-hidden welcome page sections
    atom.commands.add('atom-workspace', SHOW_COMMAND_NAME, () => {
      if (this._hasWelcomePagesToShow()) {
        this._store.dispatch((_Actions || _load_Actions()).clearShowOption());
        (0, (_goToLocation || _load_goToLocation()).goToLocation)((_WelcomePageGadget || _load_WelcomePageGadget()).WELCOME_PAGE_VIEW_URI);
      }
    }),
    // show all welcome page sections, hidden or not
    atom.commands.add('atom-workspace', SHOW_ALL_COMMAND_NAME, () => {
      this._store.dispatch((_Actions || _load_Actions()).setShowAll());
      (0, (_goToLocation || _load_goToLocation()).goToLocation)((_WelcomePageGadget || _load_WelcomePageGadget()).WELCOME_PAGE_VIEW_URI);
    }));
  }

  // TODO: is there a better place to put this?
  _createWelcomePageViewable() {
    return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.createElement((_WelcomePageGadget2 || _load_WelcomePageGadget2()).default, { store: this._store }));
  }

  _hasWelcomePagesToShow() {
    const { welcomePages, hiddenTopics } = this._store.getState();
    for (const topic of welcomePages.keys()) {
      if (!hiddenTopics.has(topic)) {
        // if any topic is not hidden
        return true;
      }
    }
    return false;
  }

  provideWelcomePageApi() {
    return this;
  }

  showPageForTopic(topic, options = {}) {
    const { welcomePages, hiddenTopics } = this._store.getState();
    const showAnyway = options != null && options.override != null && options.override;
    if (showAnyway || welcomePages.has(topic) && !hiddenTopics.has(topic)) {
      // if the topic exists and isn't hidden
      this._store.dispatch((_Actions || _load_Actions()).setShowOne(topic));
      (0, (_goToLocation || _load_goToLocation()).goToLocation)((_WelcomePageGadget || _load_WelcomePageGadget()).WELCOME_PAGE_VIEW_URI);
    }
  }

  serialize() {
    return {
      hiddenTopics: Array.from(this._store.getState().hiddenTopics)
    };
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);