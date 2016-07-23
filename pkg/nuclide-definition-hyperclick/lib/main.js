'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This package provides Hyperclick results for any language which provides a
// DefinitionProvider.

import type {HyperclickProvider, HyperclickSuggestion} from '../../hyperclick/lib/types';
import type {DefinitionService} from '../../nuclide-definition-service';

import {goToLocation} from '../../commons-atom/go-to-location';
import {Disposable} from 'atom';
import nuclideUri from '../../commons-node/nuclideUri';
import invariant from 'assert';

let currentService: ?DefinitionService = null;

async function getSuggestion(
  editor: atom$TextEditor,
  position: atom$Point,
): Promise<?HyperclickSuggestion> {
  if (currentService == null) {
    return null;
  }
  const result = await currentService.getDefinition(editor, position);
  if (result == null) {
    return null;
  }
  const {definitions} = result;
  invariant(definitions.length > 0);

  function createCallback(definition) {
    return () => {
      goToLocation(definition.path, definition.position.row, definition.position.column);
    };
  }

  function createTitle(definition) {
    invariant(definition.name != null, 'must include name when returning multiple definitions');
    const filePath = definition.projectRoot == null
      ? definition.path
      : nuclideUri.relative(definition.projectRoot, definition.path);
    return `${definition.name} (${filePath})`;
  }

  if (definitions.length === 1) {
    return {
      range: result.queryRange,
      callback: createCallback(definitions[0]),
    };
  } else {
    return {
      range: result.queryRange,
      callback: definitions.map(definition => {
        return {
          title: createTitle(definition),
          callback: createCallback(definition),
        };
      }),
    };
  }
}

export function consumeDefinitionService(service: DefinitionService): IDisposable {
  invariant(currentService == null);
  currentService = service;
  return new Disposable(() => {
    invariant(currentService === service);
    currentService = null;
  });
}

export function getHyperclickProvider(): HyperclickProvider {
  return {
    priority: 20,
    providerName: 'nuclide-definition-hyperclick',
    getSuggestion,
  };
}

export function activate(state: Object | void) {
}

export function deactivate() {
}
