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

import type {SelectionAction} from '../FileTreeDispatcher';
import type {FileTreeNode} from '../FileTreeNode';

export const SELECT = 'SELECTION:SELECT';
export const UNSELECT = 'SELECTION:UNSELECT';
export const FOCUS = 'SELECTION:FOCUS';
export const UNFOCUS = 'SELECTION:UNFOCUS';
export const CLEAR_SELECTED = 'SELECTION:CLEAR_SELECTED';
export const CLEAR_FOCUSED = 'SELECTION:CLEAR_FOCUSED';

export function select(node: FileTreeNode): SelectionAction {
  return {
    type: SELECT,
    node,
  };
}

export function unselect(node: FileTreeNode): SelectionAction {
  return {
    type: UNSELECT,
    node,
  };
}

export function focus(node: FileTreeNode): SelectionAction {
  return {
    type: FOCUS,
    node,
  };
}

export function unfocus(node: FileTreeNode): SelectionAction {
  return {
    type: UNFOCUS,
    node,
  };
}

export function clearSelected(): SelectionAction {
  return {type: CLEAR_SELECTED};
}

export function clearFocused(): SelectionAction {
  return {type: CLEAR_FOCUSED};
}
