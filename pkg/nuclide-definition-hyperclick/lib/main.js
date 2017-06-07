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

// This package provides Hyperclick results for any language which provides a
// DefinitionProvider.

import type {HyperclickProvider, HyperclickSuggestion} from 'atom-ide-ui';
import type {DefinitionProvider} from '../../nuclide-definition-service';

import invariant from 'assert';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import createPackage from 'nuclide-commons-atom/createPackage';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import ProviderRegistry from 'nuclide-commons-atom/ProviderRegistry';

class Activation {
  _providers: ProviderRegistry<DefinitionProvider>;
  _disposables: UniversalDisposable;

  constructor() {
    this._providers = new ProviderRegistry();
    this._disposables = new UniversalDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  async getSuggestion(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<?HyperclickSuggestion> {
    const provider = this._providers.getProviderForEditor(editor);
    if (provider == null) {
      return null;
    }
    const result = await provider.getDefinition(editor, position);
    if (result == null) {
      return null;
    }
    const {definitions} = result;
    invariant(definitions.length > 0);

    function createCallback(definition) {
      return () => {
        goToLocation(
          definition.path,
          definition.position.row,
          definition.position.column,
        );
      };
    }

    function createTitle(definition) {
      invariant(
        definition.name != null,
        'must include name when returning multiple definitions',
      );
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

  consumeDefinitionProvider(provider: DefinitionProvider): IDisposable {
    const disposable = this._providers.addProvider(provider);
    this._disposables.add(disposable);
    return disposable;
  }

  getHyperclickProvider(): HyperclickProvider {
    return {
      priority: 20,
      providerName: 'nuclide-definition-hyperclick',
      getSuggestion: (editor, position) => this.getSuggestion(editor, position),
    };
  }
}

createPackage(module.exports, Activation);
