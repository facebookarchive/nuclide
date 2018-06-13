/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {ComponentDefinition} from './types';

export default class DefinitionManager {
  definitionForComponentName: Map<string, ComponentDefinition>;

  constructor() {
    this.definitionForComponentName = new Map();
  }

  addDefinition(definition: ComponentDefinition) {
    this.definitionForComponentName.set(definition.name, definition);
  }

  getDefinition(componentName: string): ?ComponentDefinition {
    return this.definitionForComponentName.get(componentName) || null;
  }
}
