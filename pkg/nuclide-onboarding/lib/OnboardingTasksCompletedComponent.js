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

import type {OnboardingTaskComponentProps} from './types';

import * as React from 'react';
import createUtmUrl from './createUtmUrl';

const NUCLIDE_DOCS_URL = createUtmUrl('http://nuclide.io', 'welcome');

export default function OnboardingTasksCompletedComponent(
  props: OnboardingTaskComponentProps,
) {
  return (
    <div>
      <a className="nuclide-onboarding-docs-link" href={NUCLIDE_DOCS_URL}>
        Click here
      </a>{' '}
      to learn more about Nuclide's features
    </div>
  );
}
