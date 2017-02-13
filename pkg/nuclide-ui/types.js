/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type CustomPaneItemOptions = {
  title: string, // Title for the custom pane item being created.
  iconName?: string, // Optional string representing the octicon that is rendered next to the title.
  uri?: string,
  allowSplit?: boolean, // Whether splits are allowed on the pane item. Defaults to false.
  initialProps: Object, // The pane item specific properties.
};

export type Nuclicon =
  'nuclicon-nuclide'
  | 'nuclicon-react'
  | 'nuclicon-buck'
  | 'nuclicon-hhvm'
  | 'nuclicon-hack'
  | 'nuclicon-swift'
  | 'nuclicon-file-directory'
  | 'nuclicon-file-directory-starred'
  | 'nuclicon-debugger'
  | 'nuclicon-arrow-down'
  | 'nuclicon-bug'
  | 'nuclicon-graphql'
  | 'nuclicon-comment-discussion'
  | 'nuclicon-comment'
  | 'nuclicon-jest-outline';

export type IconName = Nuclicon | atom$Octicon;
