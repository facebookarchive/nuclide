"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHiddenTopics = getHiddenTopics;
exports.setHiddenTopics = setHiddenTopics;
exports.migrateShowOnboardingConfigValue = migrateShowOnboardingConfigValue;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const NUCLIDE_ONBOARDING_CONFIG_KEY = 'fb-nuclide-onboarding';
const NUCLIDE_ONBOARDING_TOPIC_NAME = 'fb-nuclide-welcome-page';

function getHiddenTopics() {
  const topics = _featureConfig().default.get('nuclide-welcome-page.hiddenTopics');

  return new Set(topics);
}

function setHiddenTopics(hiddenTopics) {
  _featureConfig().default.set('nuclide-welcome-page.hiddenTopics', Array.from(hiddenTopics));
} // Migrate showOnboarding value to welcome-page hiddenTopics if Onboarding
// has already been hidden (stored value === false), and remove
// NUCLIDE_ONBOARDING_CONFIG_KEY from atom config if it exists


function migrateShowOnboardingConfigValue() {
  let nuclideConfig = atom.config.get('nuclide');

  if (!(nuclideConfig != null && typeof nuclideConfig === 'object')) {
    throw new Error("Invariant violation: \"nuclideConfig != null && typeof nuclideConfig === 'object'\"");
  }

  const nuclideOnboardingConfig = nuclideConfig[NUCLIDE_ONBOARDING_CONFIG_KEY];

  if (nuclideOnboardingConfig == null) {
    return;
  }

  if (nuclideOnboardingConfig.showOnboarding === false) {
    const hiddenTopics = getHiddenTopics();

    if (!hiddenTopics.has(NUCLIDE_ONBOARDING_TOPIC_NAME)) {
      hiddenTopics.add(NUCLIDE_ONBOARDING_TOPIC_NAME);
      setHiddenTopics(hiddenTopics);
      nuclideConfig = atom.config.get('nuclide');
    }
  } // Remove NUCLIDE_ONBOARDING_CONFIG_KEY from atom config


  if (!(nuclideConfig != null && typeof nuclideConfig === 'object')) {
    throw new Error("Invariant violation: \"nuclideConfig != null && typeof nuclideConfig === 'object'\"");
  }

  delete nuclideConfig[NUCLIDE_ONBOARDING_CONFIG_KEY];
  atom.config.set('nuclide', nuclideConfig);
}