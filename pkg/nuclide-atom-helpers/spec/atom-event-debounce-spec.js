'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Observable} from '@reactivex/rxjs';

import {
  onWorkspaceDidStopChangingActivePaneItem,
  observeActivePaneItemDebounced,
} from '../lib/atom-event-debounce';
import {activatePaneItem} from '../lib/workspace';

import {event as commonsEvent} from '../../nuclide-commons';
const {observableFromSubscribeFunction} = commonsEvent;

const DEBOUNCE_INTERVAL = 10;

describe('pane item change events', ()  => {
  let editor1: atom$TextEditor = (null: any);
  let editor2: atom$TextEditor = (null: any);
  let editor3: atom$TextEditor = (null: any);
  let activePaneItems: Observable<mixed> = (null: any);

  beforeEach(() => {
    waitsForPromise(async () => {
      // Since RX manages to dodge the built-in clock mocking we'll use the real clock for these
      // tests :(
      jasmine.useRealClock();

      editor3 = await atom.workspace.open();
      editor2 = await atom.workspace.open();
      editor1 = await atom.workspace.open();
      activatePaneItem(editor1);
    });
  });

  describe('onWorkspaceDidStopChangingActivePaneItem', () => {
    beforeEach(() => {
      // Convert to an Observable for ease of manipulation
      activePaneItems = observableFromSubscribeFunction(callback => {
        return onWorkspaceDidStopChangingActivePaneItem(callback, DEBOUNCE_INTERVAL);
      });
    });

    it('should not issue an initial item', () => {
      waitsForPromise(async () => {
        expect(
          await activePaneItems
            .first()
            // Split out an empty observable after waiting 20 ms.
            .race(Observable.empty().delay(20))
            .toArray()
            .toPromise()
        ).toEqual([]);
      });
    });

    it('should debounce', () => {
      waitsForPromise(async () => {
        const itemsPromise = activePaneItems
          .take(1)
          .toArray()
          .toPromise();

        await sleep(15);

        activatePaneItem(editor2);
        activatePaneItem(editor3);

        expect(await itemsPromise).toEqual([editor3]);
      });
    });
  });

  describe('observeActivePaneItemDebounced', () => {
    beforeEach(() => {
      activePaneItems = observeActivePaneItemDebounced(DEBOUNCE_INTERVAL);
    });

    it('should issue an initial item', () => {
      waitsForPromise(async () => {
        expect(
          await activePaneItems
            .first()
            // Split out an empty observable after waiting 20 ms.
            .race(Observable.empty().delay(20))
            .toArray()
            .toPromise()
        ).toEqual([editor1]);
      });
    });

    it('should debounce', () => {
      waitsForPromise(async () => {
        const itemsPromise = activePaneItems
          .take(2)
          .toArray()
          .toPromise();

        await sleep(15);

        activatePaneItem(editor2);
        activatePaneItem(editor3);

        expect(await itemsPromise).toEqual([editor1, editor3]);
      });
    });
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
