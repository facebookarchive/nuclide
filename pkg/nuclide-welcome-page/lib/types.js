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

export type WelcomePage = {
  topic: string,
  content: React$Node,
  priority?: number,
};

export type ShowPageOptions = {
  override?: boolean,
};

export type WelcomePageApi = {
  +showPageForTopic: (string, ShowPageOptions) => void,
};

export type ShowAll = {
  type: 'SHOW_ALL',
  args: {},
};

export type ShowOne = {
  type: 'SHOW_ONE',
  args: {
    topic: string,
  },
};

export type ShowOption = ShowAll | ShowOne;

export type WelcomePageData = {
  content: React$Node,
  priority: number,
};

export type AppState = {
  welcomePages: Map<string, WelcomePageData>,
  hiddenTopics: Set<string>,
  showOption?: ShowOption,
  isWelcomePageVisible: boolean,
};

export type SerializedState = {
  hiddenTopics: Array<string>,
};

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
  // subscribe isn't present in the version of Store provided to Epics
  // for some reason, uncommenting it (even making it optional) makes flow upset
  // subscribe(listener: () => mixed): () => void,
};

export type AddWelcomePageAction = {
  type: 'ADD_WELCOME_PAGE',
  payload: {
    welcomePage: WelcomePage,
  },
};

export type DeleteWelcomePageAction = {
  type: 'DELETE_WELCOME_PAGE',
  payload: {
    topic: string,
  },
};

export type UpdateWelcomePageVisibilityAction = {
  type: 'UPDATE_WELCOME_PAGE_VISIBILITY',
  payload: {
    isVisible: boolean,
  },
};

export type HideUnhideTopicsAction = {
  type: 'HIDE_UNHIDE_TOPICS',
  payload: {
    topicsToHide: Set<string>,
    topicsToUnhide: Set<string>,
  },
};

export type SetShowOptionAction = {
  type: 'SET_SHOW_OPTION',
  payload: {showOption?: ShowOption},
};

export type Action =
  | AddWelcomePageAction
  | DeleteWelcomePageAction
  | UpdateWelcomePageVisibilityAction
  | HideUnhideTopicsAction
  | SetShowOptionAction;
