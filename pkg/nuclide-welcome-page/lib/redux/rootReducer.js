"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rootReducer;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function ActionTypes() {
  const data = _interopRequireWildcard(require("./ActionTypes"));

  ActionTypes = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const log = (0, _log4js().getLogger)('nuclide-welcome-page');

function rootReducer(state, action) {
  switch (action.type) {
    case ActionTypes().ADD_WELCOME_PAGE:
      return _addWelcomePage(state, action.payload.welcomePage);

    case ActionTypes().DELETE_WELCOME_PAGE:
      return _deleteWelcomePage(state, action.payload.topic);

    case ActionTypes().UPDATE_WELCOME_PAGE_VISIBILITY:
      return Object.assign({}, state, {
        isWelcomePageVisible: action.payload.isVisible
      });

    case ActionTypes().HIDE_UNHIDE_TOPICS:
      return _hideUnhideTopics(state, action.payload.topicsToHide, action.payload.topicsToUnhide);

    case ActionTypes().SET_SHOW_OPTION:
      return _setShowOption(state, action.payload.showOption);
  }

  return state;
}

function _addWelcomePage(state, welcomePage) {
  const welcomePages = new Map(state.welcomePages);
  const {
    topic,
    content
  } = welcomePage;
  const priority = welcomePage.priority != null ? welcomePage.priority : 1000;

  if (welcomePages.has(topic)) {
    log.warn(`Duplicate welcome page for topic '${topic}'`);
    return state;
  }

  welcomePages.set(topic, {
    content,
    priority
  });
  return Object.assign({}, state, {
    welcomePages
  });
}

function _deleteWelcomePage(state, topic) {
  const welcomePages = new Map(state.welcomePages);
  welcomePages.delete(topic);
  return Object.assign({}, state, {
    welcomePages
  });
}

function _hideUnhideTopics(state, topicsToHide, topicsToUnhide) {
  const hiddenTopics = new Set(state.hiddenTopics);
  topicsToHide.forEach(topic => {
    hiddenTopics.add(topic);
  });
  const hidden = Array.from(topicsToHide);

  if (hidden.length > 0) {
    log.info(`Hiding topics: [${hidden.join(', ')}]`);
  }

  topicsToUnhide.forEach(topic => {
    hiddenTopics.delete(topic);
  });
  const unhidden = Array.from(topicsToUnhide);

  if (unhidden.length > 0) {
    log.info(`Unhiding topics: [${unhidden.join(', ')}]`);
  }

  (0, _nuclideAnalytics().track)('nuclide-welcome-page-hide-unhide-topics', {
    hidden,
    unhidden
  });
  return Object.assign({}, state, {
    hiddenTopics
  });
}

function _setShowOption(state, showOption) {
  return Object.assign({}, state, {
    showOption
  });
}