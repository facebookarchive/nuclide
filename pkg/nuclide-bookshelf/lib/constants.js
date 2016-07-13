'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ActionTypeValue} from './types';


export const ActionType = Object.freeze({
  ADD_PROJECT_REPOSITORY: 'add-project-repository',
  COMPLETE_RESTORING_REPOSITORY_STATE: 'complete-restoring-repository-state',
  REMOVE_PROJECT_REPOSITORY: 'remove-project-repository',
  RESTORE_PANE_ITEM_STATE: 'restore-pane-item-state',
  START_RESTORING_REPOSITORY_STATE: 'start-restoring-repository-state',
  UPDATE_PANE_ITEM_STATE: 'update-pane-item-state',
  UPDATE_REPOSITORY_BOOKMARKS: 'update-repository-bookmarks',
});

// This is to work around flow's missing support of enums.
(ActionType: { [key: string]: ActionTypeValue });

export const EMPTY_SHORTHEAD = '';
