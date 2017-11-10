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

export default function leftPad(
  s: string,
  size: number,
  pad: string = ' ',
): string {
  if (s.length >= size) {
    return s;
  }

  const padded = pad.repeat(size) + s;
  return padded.substr(padded.length - size);
}
