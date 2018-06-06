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

export type OnboardingFragment = {
  description?: string,
  key: string,
  title: string,
};

export type OnboardingTask = {
  ...OnboardingFragment,
  isCompleted: boolean,
};
