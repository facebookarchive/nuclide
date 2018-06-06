'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addWelcomePage = addWelcomePage;
exports.deleteWelcomePage = deleteWelcomePage;
exports.updateWelcomePageVisibility = updateWelcomePageVisibility;
exports.hideUnhideTopics = hideUnhideTopics;
exports.setShowAll = setShowAll;
exports.setShowOne = setShowOne;
exports.clearShowOption = clearShowOption;

var _ShowOptions;

function _load_ShowOptions() {
  return _ShowOptions = require('../ShowOptions');
}

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function addWelcomePage(welcomePage) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).ADD_WELCOME_PAGE,
    payload: { welcomePage }
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */

function deleteWelcomePage(topic) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).DELETE_WELCOME_PAGE,
    payload: { topic }
  };
}

function updateWelcomePageVisibility(isVisible) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).UPDATE_WELCOME_PAGE_VISIBILITY,
    payload: { isVisible }
  };
}

function hideUnhideTopics(topicsToHide, topicsToUnhide) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).HIDE_UNHIDE_TOPICS,
    payload: { topicsToHide, topicsToUnhide }
  };
}

function setShowAll() {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_SHOW_OPTION,
    payload: {
      showOption: (0, (_ShowOptions || _load_ShowOptions()).showAll)()
    }
  };
}

function setShowOne(topic) {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_SHOW_OPTION,
    payload: {
      showOption: (0, (_ShowOptions || _load_ShowOptions()).showOne)(topic)
    }
  };
}

function clearShowOption() {
  return {
    type: (_ActionTypes || _load_ActionTypes()).SET_SHOW_OPTION,
    payload: {
      showOption: undefined
    }
  };
}