'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  activateAllPackages,
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
} from './utils/integration-test-helpers';
import {dispatchKeyboardEvent} from '../pkg/commons-atom/testHelpers';
import featureConfig from '../pkg/commons-atom/featureConfig';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {getDefaultConfigValue} from '../pkg/nuclide-settings/lib/settings-utils';
import {
  testSettingsCheckbox,
  // testSettingsSelect,
  testSettingsInput,
} from './utils/settings-pane-common';

describe('Settings View Integration Test', () => {

  beforeEach(() => {
    // Activate nuclide packages.
    waitsForPromise(activateAllPackages);
  });

  afterEach(() => {
    // Deactivate nuclide packages.
    deactivateAllPackages();
  });

  it('tests my feature', () => {
    waitsForPromise(async () => {
      jasmineIntegrationTestSetup();

      // Show settings UI
      dispatchKeyboardEvent(',', document.activeElement, {cmd: true, alt: true});
      waitsFor('settings pane to show up', 10000, () => {
        return document.querySelector('.settings-gadgets-pane');
      });

      // Checkbox
      const showHomeKeyPath = 'nuclide-home.showHome';
      const showHomeValue = Boolean(featureConfig.get(showHomeKeyPath));
      testSettingsCheckbox(showHomeKeyPath, showHomeValue);

      // Select
      // const ratingKeyPath = 'fb-rating.rating';
      // const ratingValue = featureConfig.get(ratingKeyPath);
      // const tmpRatingValue = String(ratingValue + 1);
      // testSettingsSelect(ratingKeyPath, ratingValue, tmpRatingValue);

      // Input (string)
      const timeoutKeyPath = 'nuclide-health.analyticsTimeout';
      const timeoutValue: number =
        (featureConfig.get(timeoutKeyPath) || getDefaultConfigValue(timeoutKeyPath): any);
      const tmpTimeoutValue = timeoutValue + 1;
      testSettingsInput(timeoutKeyPath, timeoutValue, tmpTimeoutValue);

      // Input (array)
      const clangFlagsKeyPath = 'nuclide-clang.defaultFlags';
      let clangFlagsValue = featureConfig.get(clangFlagsKeyPath);
      if (!clangFlagsValue || !clangFlagsValue.length) {
        clangFlagsValue = getDefaultConfigValue(clangFlagsKeyPath);
      }
      const tmpClangFlagsValue = ['-E', '-g'];
      testSettingsInput(clangFlagsKeyPath, clangFlagsValue, tmpClangFlagsValue);

    });
  });
});
