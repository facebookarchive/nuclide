'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rootReducer;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const log = (0, (_log4js || _load_log4js()).getLogger)('nuclide-welcome-page');

function rootReducer(state, action) {
  switch (action.type) {
    case (_ActionTypes || _load_ActionTypes()).ADD_WELCOME_PAGE:
      return _addWelcomePage(state, action.payload.welcomePage);
    case (_ActionTypes || _load_ActionTypes()).DELETE_WELCOME_PAGE:
      return _deleteWelcomePage(state, action.payload.topic);
    case (_ActionTypes || _load_ActionTypes()).UPDATE_WELCOME_PAGE_VISIBILITY:
      return Object.assign({}, state, { isWelcomePageVisible: action.payload.isVisible });
    case (_ActionTypes || _load_ActionTypes()).HIDE_UNHIDE_TOPICS:
      return _hideUnhideTopics(state, action.payload.topicsToHide, action.payload.topicsToUnhide);
    case (_ActionTypes || _load_ActionTypes()).SET_SHOW_OPTION:
      return _setShowOption(state, action.payload.showOption);
  }

  return state;
}

function _addWelcomePage(state, welcomePage) {
  const welcomePages = new Map(state.welcomePages);
  const { topic, content } = welcomePage;
  const priority = welcomePage.priority != null ? welcomePage.priority : 1000;
  if (welcomePages.has(topic)) {
    log.warn(`Duplicate welcome page for topic '${topic}'`);
    return state;
  }
  welcomePages.set(topic, { content, priority });
  return Object.assign({}, state, { welcomePages });
}

function _deleteWelcomePage(state, topic) {
  const welcomePages = new Map(state.welcomePages);
  welcomePages.delete(topic);
  return Object.assign({}, state, { welcomePages });
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
  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-welcome-page-hide-unhide-topics', {
    hidden,
    unhidden
  });
  return Object.assign({}, state, { hiddenTopics });
}

function _setShowOption(state, showOption) {
  return Object.assign({}, state, { showOption });
}