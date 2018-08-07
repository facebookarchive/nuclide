"use strict";

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _destroyItemWhere() {
  const data = require("../../../modules/nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
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

function _reduxMin() {
  const data = require("redux/dist/redux.min.js");

  _reduxMin = function () {
    return data;
  };

  return data;
}

function _viewableFromReactElement() {
  const data = require("../../commons-atom/viewableFromReactElement");

  _viewableFromReactElement = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _createEmptyAppState() {
  const data = require("./redux/createEmptyAppState");

  _createEmptyAppState = function () {
    return data;
  };

  return data;
}

function _rootReducer() {
  const data = _interopRequireDefault(require("./redux/rootReducer"));

  _rootReducer = function () {
    return data;
  };

  return data;
}

function _WelcomePageGadget() {
  const data = _interopRequireWildcard(require("./ui/WelcomePageGadget"));

  _WelcomePageGadget = function () {
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
const SHOW_COMMAND_NAME = 'nuclide-welcome-page:show-welcome-page';
const SHOW_ALL_COMMAND_NAME = 'nuclide-welcome-page:show-all-welcome-pages';

class Activation {
  constructor() {
    const hiddenTopics = (0, _config().getHiddenTopics)();
    this._store = (0, _reduxMin().createStore)(_rootReducer().default, (0, _createEmptyAppState().createEmptyAppState)(hiddenTopics));
    this._disposables = new (_UniversalDisposable().default)(this._registerDisplayCommandAndOpener(), this._store.subscribe(() => {
      (0, _config().setHiddenTopics)(this._store.getState().hiddenTopics);
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeWelcomePage(welcomePage) {
    this._store.dispatch(Actions().addWelcomePage(welcomePage));

    return new (_UniversalDisposable().default)(() => {
      this._store.dispatch(Actions().deleteWelcomePage(welcomePage.topic));
    });
  }

  _registerDisplayCommandAndOpener() {
    return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
      if (uri === _WelcomePageGadget().WELCOME_PAGE_VIEW_URI) {
        return this._createWelcomePageViewable();
      }
    }), () => (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _WelcomePageGadget().default), // show non-hidden welcome page sections
    atom.commands.add('atom-workspace', SHOW_COMMAND_NAME, () => {
      if (this._hasWelcomePagesToShow()) {
        this._store.dispatch(Actions().clearShowOption());

        (0, _goToLocation().goToLocation)(_WelcomePageGadget().WELCOME_PAGE_VIEW_URI);
      }
    }), // show all welcome page sections, hidden or not
    atom.commands.add('atom-workspace', SHOW_ALL_COMMAND_NAME, () => {
      this._store.dispatch(Actions().setShowAll());

      (0, _goToLocation().goToLocation)(_WelcomePageGadget().WELCOME_PAGE_VIEW_URI);
    }));
  } // TODO: is there a better place to put this?


  _createWelcomePageViewable() {
    return (0, _viewableFromReactElement().viewableFromReactElement)(React.createElement(_WelcomePageGadget().default, {
      store: this._store
    }));
  }

  _hasWelcomePagesToShow() {
    const {
      welcomePages,
      hiddenTopics
    } = this._store.getState();

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
    const {
      welcomePages,
      hiddenTopics
    } = this._store.getState();

    const showAnyway = options != null && options.override != null && options.override;

    if (showAnyway || welcomePages.has(topic) && !hiddenTopics.has(topic)) {
      // if the topic exists and isn't hidden
      this._store.dispatch(Actions().setShowOne(topic));

      (0, _goToLocation().goToLocation)(_WelcomePageGadget().WELCOME_PAGE_VIEW_URI);
    }
  }

}

(0, _createPackage().default)(module.exports, Activation);