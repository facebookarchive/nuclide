'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ResultsStreamProvider} from '../../nuclide-outline-view';

import featureConfig from '../../nuclide-feature-config';
import populateSymbols from './populateSymbols';
import invariant from 'assert';
import {Disposable} from 'atom';


const POPULATE_SYMBOLS_VIEW_CONFIG_KEY = 'nuclide-populate-symbols.populateSymbolsView';

class Activation {
  _streamSubscription: ?rx$ISubscription;

  constructor() {
    this._streamSubscription = null;
  }

  consumeOutlineViewResultsStream(streamProvider: ResultsStreamProvider): IDisposable {
    if (this._streamSubscription != null) {
      this._streamSubscription.unsubscribe();
    }

    const resultsStream = streamProvider.getResultsStream();
    const configValues = featureConfig.observeAsStream(POPULATE_SYMBOLS_VIEW_CONFIG_KEY);
    this._streamSubscription = populateSymbols(configValues, resultsStream);

    return new Disposable(() => {
      if (this._streamSubscription != null) {
        this._streamSubscription.unsubscribe();
        this._streamSubscription = null;
      }
    });
  }

  dispose() {
    if (this._streamSubscription != null) {
      this._streamSubscription.unsubscribe();
      this._streamSubscription = null;
    }
  }
}


let activation: ?Activation = null;

export function activate(state: Object | void) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function consumeOutlineViewResultsStream(
  streamProvider: ResultsStreamProvider,
): IDisposable {
  invariant(activation != null);
  return activation.consumeOutlineViewResultsStream(streamProvider);
}
