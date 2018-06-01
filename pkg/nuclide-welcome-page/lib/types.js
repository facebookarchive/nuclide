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
};

export type AppState = {
  isWelcomePageVisible: boolean,
};

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
  // subscribe isn't present in the version of Store provided to Epics
  // for some reason, uncommenting it (even making it optional) makes flow upset
  // subscribe(listener: () => mixed): () => void,
};

export type UpdateWelcomePageVisibilityAction = {
  type: 'UPDATE_WELCOME_PAGE_VISIBILITY',
  payload: {
    isVisible: boolean,
  },
};

export type Action = UpdateWelcomePageVisibilityAction;
