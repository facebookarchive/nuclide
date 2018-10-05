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

import type {
  ScrollbarIndicatorUpdate,
  ScrollbarIndicatorProvider,
} from '../../nuclide-scrollbar-indicators';

import createPackage from 'nuclide-commons-atom/createPackage';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Subject, Observable} from 'rxjs';

class Activation {
  _disposables: UniversalDisposable;
  _updates: Subject<ScrollbarIndicatorUpdate>;

  constructor(state: ?mixed) {
    this._disposables = new UniversalDisposable();
    this._updates = new Subject();
    this._disposables.add(
      observableFromSubscribeFunction(cb =>
        atom.workspace.observeTextEditors(cb),
      )
        .mergeMap(editor => {
          return Observable.combineLatest(
            observableFromSubscribeFunction(cb =>
              editor.onDidChangeCursorPosition(cb),
            ).map(({newBufferPosition}) => {
              return {
                start: newBufferPosition.row,
                end: newBufferPosition.row,
              };
            }),
            observableFromSubscribeFunction(cb =>
              editor.onDidChangeSelectionRange(cb),
            ).map(({newBufferRange}) => {
              return {
                start: newBufferRange.start.row,
                end: newBufferRange.end.row,
              };
            }),
          ).map(([position, selection]) => {
            return {
              editor,
              markTypes: new Map([
                ['CURSOR', new Set([position])],
                ['SELECTION', new Set([selection])],
              ]),
            };
          });
        })
        .subscribe((update: ScrollbarIndicatorUpdate) => {
          this._updates.next(update);
        }),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  provideScrollbarIndicators(): ScrollbarIndicatorProvider {
    return {
      onUpdate: cb => new UniversalDisposable(this._updates.subscribe(cb)),
    };
  }
}

createPackage(module.exports, Activation);
