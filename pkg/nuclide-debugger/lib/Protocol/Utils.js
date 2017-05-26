/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

export function reportError(message: string): void {
  // TODO: setup a new event channel to report error message.
  // eslint-disable-next-line no-console
  console.error(message);
}

export function reportWarning(message: string): void {
  // TODO: setup a new event channel to report warning message.
  // eslint-disable-next-line no-console
  console.warn(message);
}
