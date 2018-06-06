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

import type {OnboardingFragment} from '../../nuclide-onboarding/lib/types';

import createPackage from 'nuclide-commons-atom/createPackage';
import EditorIDEExperienceComponent from './EditorIDEExperienceComponent';

class Activation {
  getOnboardingFragments(): Array<OnboardingFragment> {
    return [
      {
        taskComponent: EditorIDEExperienceComponent,
        description:
          'With which of the following editors/IDEs do you have the most experience?',
        taskKey: 'editor-ide-experience',
        title: 'Editor/IDE Experience',
      },
    ];
  }
}

createPackage(module.exports, Activation);
