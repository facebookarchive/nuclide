'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import featureConfig from '../../commons-atom/featureConfig';

import type {WorkingSetDefinition} from './types';

const CONFIG_KEY = 'nuclide-working-sets.workingSets';

type DefinitionsObserver = (definitions: Array<WorkingSetDefinition>) => void;

export class WorkingSetsConfig {
  observeDefinitions(callback: DefinitionsObserver): IDisposable {
    const wrapped = (definitions: any) => {
      // Got to create a deep copy, otherwise atom.config invariants might break
      const copiedDefinitions = definitions.map(def => {
        return {
          name: def.name,
          active: def.active,
          uris: def.uris.slice(),
        };
      });

      callback(copiedDefinitions);
    };

    return featureConfig.observe(
      CONFIG_KEY,
      wrapped,
    );
  }

  getDefinitions(): Array<WorkingSetDefinition> {
    return (featureConfig.get(CONFIG_KEY): any);
  }

  setDefinitions(definitions: Array<WorkingSetDefinition>): void {
    featureConfig.set(CONFIG_KEY, definitions);
  }
}
