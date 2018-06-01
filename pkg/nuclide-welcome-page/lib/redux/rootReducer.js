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

import type {AppState, Action, WelcomePage} from '../types';

import {getLogger} from 'log4js';
import * as ActionTypes from './ActionTypes';

export default function rootReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case ActionTypes.ADD_WELCOME_PAGE:
      return _addWelcomePage(state, action.payload.welcomePage);
    case ActionTypes.DELETE_WELCOME_PAGE:
      return _deleteWelcomePage(state, action.payload.topic);
    case ActionTypes.UPDATE_WELCOME_PAGE_VISIBILITY:
      return {...state, isWelcomePageVisible: action.payload.isVisible};
  }

  return state;
}

function _addWelcomePage(state: AppState, welcomePage: WelcomePage): AppState {
  const welcomePages = new Map(state.welcomePages);
  const {topic} = welcomePage;
  if (welcomePages.has(topic)) {
    getLogger('nuclide-welcome-page').warn(
      `Duplicate welcome page for topic '${topic}'`,
    );
    return state;
  }
  welcomePages.set(topic, welcomePage);
  return {...state, welcomePages};
}

function _deleteWelcomePage(state: AppState, topic: string): AppState {
  const welcomePages = new Map(state.welcomePages);
  welcomePages.delete(topic);
  return {...state, welcomePages};
}
