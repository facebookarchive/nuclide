/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Disposable} from 'atom';
export type GetToolBar = (group: string) => ToolBarManager;

type ToolBarManager = {
  addButton(options: {
    priority?: number,
    tooltip?: string,
    iconset?: string,
    icon?: string,
    callback?: string | () => void,
  }): ToolBarButtonView,
  addSpacer(options: {
    priority?: number,
  }): ToolBarButtonView,
  removeItems(): void,
  onDidDestroy(callback: () => void): Disposable,
};

type ToolBarButtonView = {
  setEnabled(enabled: boolean): void,
  destroy(): void,
  element: HTMLElement,
};
