'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type NuxViewModel = {
  content: string;
  isCustomContent: boolean;
  selector: ?string;
  selectorFunction: ?(() => HTMLElement);
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  displayPredicate: ?(() => boolean);
  completionPredicate: ?(() => boolean);
  completed: boolean;
};

export type NuxTourModel = {
  completed: boolean;
  id: string;
  nuxList: Array<NuxViewModel>;
  trigger: ?NuxTriggerModel;
};

export type NuxTriggerModel = {
  triggerType: NuxTriggerType;
  triggerCallback: ((editor: atom$TextEditor) => boolean);
};

// TODO: [ @rageandqq | 05-23-16 ]: Add more trigger types as use cases are developed
export type NuxTriggerType = 'editor' | null;

// Represents the 'viewed' state of a NUX
export type NuxStateModel = {
  id: string;
  completed: boolean;
};
