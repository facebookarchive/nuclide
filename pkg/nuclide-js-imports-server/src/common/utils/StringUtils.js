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

export function capitalize(word: string): string {
  if (word.length === 0) {
    return word;
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Sorting method that works like String::localCompare, but in Node.js as well.
 */
export function compareStrings(one_: ?string, two_: ?string): number {
  const one = one_ || '';
  const two = two_ || '';
  const oneLC = one.toLowerCase();
  const twoLC = two.toLowerCase();
  return one !== two && oneLC === twoLC
    ? simpleCompare(two, one) // lowercase first
    : simpleCompare(oneLC, twoLC); // alphabetical ascending
}

export function simpleCompare(one: string, two: string): number {
  return one < two ? -1 : one > two ? 1 : 0;
}

export function compareStringsCapitalsLast(one: ?string, two: ?string): number {
  const byCapitalization =
    Number(isCapitalized(one || '')) - Number(isCapitalized(two || ''));
  return byCapitalization !== 0 ? byCapitalization : compareStrings(one, two);
}

export function compareStringsCapitalsFirst(
  one: ?string,
  two: ?string,
): number {
  const byCapitalization =
    Number(isCapitalized(two || '')) - Number(isCapitalized(one || ''));
  return byCapitalization !== 0 ? byCapitalization : compareStrings(one, two);
}

export function isCapitalized(name: string): boolean {
  return name.length > 0 && name.charAt(0).toLowerCase() !== name.charAt(0);
}

export function isLowerCase(name: string): boolean {
  return name.toLowerCase() === name;
}

export default {
  capitalize,
  compareStrings,
  compareStringsCapitalsFirst,
  compareStringsCapitalsLast,
  isCapitalized,
  isLowerCase,
};
