/*
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
