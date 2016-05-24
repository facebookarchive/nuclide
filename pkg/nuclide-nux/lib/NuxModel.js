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
  numNuxes: number;
  completed: boolean;
  id: string;
  nuxList: Array<NuxViewModel>;
};
