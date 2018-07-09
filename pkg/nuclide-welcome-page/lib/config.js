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

import featureConfig from 'nuclide-commons-atom/feature-config';

export function getHiddenTopics(): Set<string> {
  const topics: ?Array<string> = (featureConfig.get(
    'nuclide-welcome-page.hiddenTopics',
  ): any);
  return new Set(topics);
}

export function setHiddenTopics(hiddenTopics: Set<string>): void {
  featureConfig.set(
    'nuclide-welcome-page.hiddenTopics',
    Array.from(hiddenTopics),
  );
}
