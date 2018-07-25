"use strict";

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

function _ShowOptions() {
  const data = require("../ShowOptions");

  _ShowOptions = function () {
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
function addWelcomePage(welcomePage) {
  return {
    type: ActionTypes().ADD_WELCOME_PAGE,
    payload: {
      welcomePage
    }
  };
}

function deleteWelcomePage(topic) {
  return {
    type: ActionTypes().DELETE_WELCOME_PAGE,
    payload: {
      topic
    }
  };
}

function updateWelcomePageVisibility(isVisible) {
  return {
    type: ActionTypes().UPDATE_WELCOME_PAGE_VISIBILITY,
    payload: {
      isVisible
    }
  };
}

function hideUnhideTopics(topicsToHide, topicsToUnhide) {
  return {
    type: ActionTypes().HIDE_UNHIDE_TOPICS,
    payload: {
      topicsToHide,
      topicsToUnhide
    }
  };
}

function setShowAll() {
  return {
    type: ActionTypes().SET_SHOW_OPTION,
    payload: {
      showOption: (0, _ShowOptions().showAll)()
    }
  };
}

function setShowOne(topic) {
  return {
    type: ActionTypes().SET_SHOW_OPTION,
    payload: {
      showOption: (0, _ShowOptions().showOne)(topic)
    }
  };
}

function clearShowOption() {
  return {
    type: ActionTypes().SET_SHOW_OPTION,
    payload: {
      showOption: undefined
    }
  };
}