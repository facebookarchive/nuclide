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

export type ScrollbarIndicatorMarkType =
  | 'SELECTION'
  | 'CURSOR'
  | 'DIAGNOSTIC_ERROR'
  | 'SEARCH_RESULT';

export const scrollbarMarkTypes: {
  [ScrollbarIndicatorMarkType]: ScrollbarIndicatorMarkType,
} = {
  SELECTION: 'SELECTION',
  CURSOR: 'CURSOR',
  DIAGNOSTIC_ERROR: 'DIAGNOSTIC_ERROR',
  SEARCH_RESULT: 'SEARCH_RESULT',
};
