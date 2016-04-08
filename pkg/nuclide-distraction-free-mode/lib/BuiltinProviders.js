'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DistractionFreeModeProvider} from '..';

import featureConfig from '../../nuclide-feature-config';

export function getBuiltinProviders(): Array<DistractionFreeModeProvider> {
  const providers = [];
  if (featureConfig.get('nuclide-distraction-free-mode.hideToolBar')) {
    providers.push(toolBarProvider);
  }
  return providers;
}

const toolBarProvider = {
  name: 'tool-bar',
  isVisible(): boolean {
    return Boolean(atom.config.get('tool-bar.visible'));
  },
  toggle(): void {
    atom.config.set('tool-bar.visible', !this.isVisible());
  },
};
