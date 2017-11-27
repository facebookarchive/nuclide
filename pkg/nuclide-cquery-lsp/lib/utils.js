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

export async function secondIfFirstIsNull<T>(
  first: ?T,
  second: () => Promise<T>,
): Promise<T> {
  return first != null ? first : second();
}
