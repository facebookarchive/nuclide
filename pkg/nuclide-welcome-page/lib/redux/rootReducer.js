/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {AppState, Action, WelcomePage, ShowOption} from '../types';

import {getLogger} from 'log4js';
import {track} from '../../../nuclide-analytics';
import * as ActionTypes from './ActionTypes';

const log = getLogger('nuclide-welcome-page');

export default function rootReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case ActionTypes.ADD_WELCOME_PAGE:
      return _addWelcomePage(state, action.payload.welcomePage);
    case ActionTypes.DELETE_WELCOME_PAGE:
      return _deleteWelcomePage(state, action.payload.topic);
    case ActionTypes.UPDATE_WELCOME_PAGE_VISIBILITY:
      return {...state, isWelcomePageVisible: action.payload.isVisible};
    case ActionTypes.HIDE_UNHIDE_TOPICS:
      return _hideUnhideTopics(
        state,
        action.payload.topicsToHide,
        action.payload.topicsToUnhide,
      );
    case ActionTypes.SET_SHOW_OPTION:
      return _setShowOption(state, action.payload.showOption);
  }

  return state;
}

function _addWelcomePage(state: AppState, welcomePage: WelcomePage): AppState {
  const welcomePages = new Map(state.welcomePages);
  const {topic, content} = welcomePage;
  const priority = welcomePage.priority != null ? welcomePage.priority : 1000;
  if (welcomePages.has(topic)) {
    log.warn(`Duplicate welcome page for topic '${topic}'`);
    return state;
  }
  welcomePages.set(topic, {content, priority});
  return {...state, welcomePages};
}

function _deleteWelcomePage(state: AppState, topic: string): AppState {
  const welcomePages = new Map(state.welcomePages);
  welcomePages.delete(topic);
  return {...state, welcomePages};
}

function _hideUnhideTopics(
  state: AppState,
  topicsToHide: Set<string>,
  topicsToUnhide: Set<string>,
): AppState {
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
  track('nuclide-welcome-page-hide-unhide-topics', {
    hidden,
    unhidden,
  });
  return {...state, hiddenTopics};
}

function _setShowOption(state: AppState, showOption?: ShowOption): AppState {
  return {...state, showOption};
}
