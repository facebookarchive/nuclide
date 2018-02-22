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

import type {FileFamilyProvider} from './types';

import createPackage from 'nuclide-commons-atom/createPackage';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {BehaviorSubject} from 'rxjs';
import FileFamilyAggregator from './FileFamilyAggregator';

class Activation {
  _disposables: UniversalDisposable;
  _aggregator: ?FileFamilyAggregator;
  _providers: BehaviorSubject<Set<FileFamilyProvider>> = new BehaviorSubject(
    new Set(),
  );

  activate() {
    this._disposables = new UniversalDisposable(
      atom.commands.add('atom-workspace', {
        'file:open-alternate': this._toggleAlternate,
      }),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  provideFileFamilyService(): FileFamilyProvider {
    if (this._aggregator) {
      return this._aggregator;
    }

    const aggregator = new FileFamilyAggregator(this._providers.asObservable());
    this._aggregator = aggregator;
    this._disposables.add(aggregator);
    return aggregator;
  }

  consumeFileFamilyProvider(provider: FileFamilyProvider): IDisposable {
    const newProviders = new Set(this._providers.getValue());
    newProviders.add(provider);
    this._providers.next(newProviders);

    return new UniversalDisposable(() => {
      const withoutProvider = new Set(this._providers.getValue());
      withoutProvider.delete(provider);
      this._providers.next(withoutProvider);
    });
  }

  _toggleAlternate = async () => {
    const provider = this._aggregator;
    if (provider == null) {
      return;
    }

    const activeEditor = atom.workspace.getActiveTextEditor();
    if (activeEditor == null) {
      return;
    }

    const activeUri = activeEditor.getURI();
    if (activeUri == null) {
      return;
    }

    const graph = await provider.getRelatedFiles(activeUri);
    const testRelation = graph.relations.find(
      r =>
        r.from === activeUri &&
        (r.labels.has('test') || r.labels.has('alternate')),
    );
    if (testRelation != null) {
      await goToLocation(testRelation.to);
    }
  };
}

createPackage(module.exports, Activation);
