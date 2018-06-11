/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import nuclideUri from 'nuclide-commons/nuclideUri';

export function getLabelFromPath(path: string): ?string {
  const parts = nuclideUri.basename(path).split('.');
  if (parts.length > 0) {
    return humanizeProjectName(parts[0]);
  }
}

function formatProjectNameWord(word: string): string {
  switch (word) {
    case 'www':
      return 'WWW';
    case 'ios':
      return 'iOS';
    default:
      return word[0].toUpperCase() + word.slice(1);
  }
}

function humanizeProjectName(name: string): string {
  const hasCapitalLetters = /[A-Z]/.test(name);
  const id = x => x;
  return name
    .split(/[-_]+/)
    .map(hasCapitalLetters ? id : formatProjectNameWord)
    .join(' ');
}
