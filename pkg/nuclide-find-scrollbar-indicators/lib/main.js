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
import {macrotask} from 'nuclide-commons/observable';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Subject} from 'rxjs';

type FindService = {
  resultsMarkerLayerForTextEditor(atom$TextEditor): atom$DisplayMarkerLayer,
};

class Activation {
  _disposables: UniversalDisposable;
  _updates: Subject<ScrollbarIndicatorUpdate>;

  constructor(state: ?mixed) {
    this._disposables = new UniversalDisposable();
    this._updates = new Subject();
  }

  dispose(): void {
    this._disposables.dispose();
  }

  provideScrollbarIndicators(): ScrollbarIndicatorProvider {
    return {
      onUpdate: cb => new UniversalDisposable(this._updates.subscribe(cb)),
    };
  }

  consumeFind(findService: FindService): IDisposable {
    const disposable = new UniversalDisposable(
      observableFromSubscribeFunction(cb =>
        atom.workspace.observeTextEditors(cb),
      )
        .mergeMap(editor => {
          const searchMarkerLayer = findService.resultsMarkerLayerForTextEditor(
            editor,
          );

          return observableFromSubscribeFunction(cb =>
            searchMarkerLayer.onDidUpdate(cb),
          ).switchMap(() => {
            // TODO: I'm not sure why this macrotask is needed, but calling
            // `getMarkers` without it seems to return no markers.
            return macrotask.first().map(() => {
              const marks = searchMarkerLayer.getMarkers().map(marker => {
                const range = marker.getBufferRange();
                return {
                  start: range.start.row,
                  end: range.end.row,
                };
              });
              return {
                editor,
                markTypes: new Map([['SEARCH_RESULT', new Set(marks)]]),
              };
            });
          });
        })
        .subscribe(update => {
          this._updates.next(update);
        }),
    );
    this._disposables.add(disposable);
    return disposable;
  }
}

createPackage(module.exports, Activation);
