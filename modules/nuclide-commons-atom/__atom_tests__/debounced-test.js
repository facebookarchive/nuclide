"use strict";

var _atom = require("atom");

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _debounced() {
  const data = require("../debounced");

  _debounced = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// Shorter than the default so the tests don't run long.
const DEBOUNCE_INTERVAL = 10; // Longer than DEBOUNCE_INTERVAL so when we wait for this amount of time, a debounced event will be
// emitted.

const SLEEP_INTERVAL = 15; // Sleep interval for double the debounce interval.

const SLEEP_INTERVAL_2 = 25; // eslint-disable-next-line jasmine/no-disabled-tests

xdescribe('editorScrollTopDebounced', () => {
  it('debounces scroll event', async () => {
    const LINES = 1000;
    const mockText = Array(LINES).fill('MOCK LINE\n').reduce((a, b) => a.concat(b));
    const editor = await atom.workspace.open();
    editor.setText(mockText);
    const editorScroll = (0, _debounced().editorScrollTopDebounced)(editor, DEBOUNCE_INTERVAL);
    const eventsPromise = editorScroll.takeUntil(_RxMin.Observable.of(null).delay(500)).toArray().toPromise();
    editor.scrollToBufferPosition(new _atom.Point(LINES / 2, 0));
    editor.scrollToBufferPosition(new _atom.Point(0, 0));
    editor.scrollToBufferPosition(new _atom.Point(LINES - 1, 0));
    editor.scrollToBufferPosition(new _atom.Point(LINES / 4, 0));
    const events = await eventsPromise;
    expect(events.length).toBe(1);
    editor.destroy();
  });
}); // eslint-disable-next-line jasmine/no-disabled-tests

xdescribe('pane item change events', () => {
  let pane = null;
  let editor1 = null;
  let editor2 = null;
  let editor3 = null;
  let nonEditor = null;
  let activePaneItems = null;
  beforeEach(async () => {
    await (async () => {
      // Since RX manages to dodge the built-in clock mocking we'll use the real clock for these
      // tests :(
      jasmine.useRealClock();
      editor3 = await atom.workspace.open();
      editor2 = await atom.workspace.open();
      editor1 = await atom.workspace.open();
      pane = atom.workspace.getActivePane();
      nonEditor = {
        // Ordinarily we would have to provide an element or register a view, but since we are just
        // testing the model here and not actually rendering anything Atom doesn't complain. If
        // these tests start failing because Atom can't find a view, look here.
        getTitle() {
          return 'foo';
        }

      };
      pane.addItem(nonEditor);
      pane.activateItem(editor1);
    })();
  });
  describe('observeActivePaneItemDebounced', () => {
    beforeEach(() => {
      activePaneItems = (0, _debounced().observeActivePaneItemDebounced)(DEBOUNCE_INTERVAL);
    });
    it('should issue an initial item', async () => {
      expect((await activePaneItems.first() // Split out an empty observable after waiting 20 ms.
      .race(_RxMin.Observable.empty().delay(20)).toArray().toPromise())).toEqual([editor1]);
    });
    it('should debounce', async () => {
      const itemsPromise = activePaneItems.take(2).toArray().toPromise();
      await (0, _promise().sleep)(SLEEP_INTERVAL);
      pane.activateItem(editor2);
      pane.activateItem(editor3);
      expect((await itemsPromise)).toEqual([editor1, editor3]);
    });
  });
  describe('observeActiveEditorsDebounced', () => {
    let activeEditors = null;
    beforeEach(() => {
      activeEditors = (0, _debounced().observeActiveEditorsDebounced)(DEBOUNCE_INTERVAL);
    });
    it('should return null if the item is not an editor', async () => {
      const itemsPromise = activeEditors.take(3).toArray().toPromise();
      await (0, _promise().sleep)(SLEEP_INTERVAL);
      pane.activateItem(nonEditor);
      await (0, _promise().sleep)(SLEEP_INTERVAL);
      pane.activateItem(editor2);
      expect((await itemsPromise)).toEqual([editor1, null, editor2]);
    });
  });
  describe('observeTextEditorsPositions', () => {
    it('cursor moves and non-editors', async () => {
      const itemsPromise = (0, _debounced().observeTextEditorsPositions)(DEBOUNCE_INTERVAL, DEBOUNCE_INTERVAL).take(5).toArray().toPromise();
      await (0, _promise().sleep)(SLEEP_INTERVAL_2);
      (0, _goToLocation().goToLocationInEditor)(editor1, {
        line: 3,
        column: 4
      });
      await (0, _promise().sleep)(SLEEP_INTERVAL_2);
      pane.activateItem(nonEditor);
      await (0, _promise().sleep)(SLEEP_INTERVAL_2);
      (0, _goToLocation().goToLocationInEditor)(editor1, {
        line: 0,
        column: 0
      });
      await (0, _promise().sleep)(SLEEP_INTERVAL_2);
      pane.activateItem(editor2);
      await (0, _promise().sleep)(SLEEP_INTERVAL_2);
      (0, _goToLocation().goToLocationInEditor)(editor1, {
        line: 3,
        column: 4
      });
      await (0, _promise().sleep)(SLEEP_INTERVAL_2);
      (0, _goToLocation().goToLocationInEditor)(editor2, {
        line: 1,
        column: 1
      });
      await (0, _promise().sleep)(SLEEP_INTERVAL_2);
      expect((await itemsPromise)).toEqual([{
        editor: editor1,
        position: new _atom.Point(4, 0)
      }, {
        editor: editor1,
        position: new _atom.Point(3, 4)
      }, null, {
        editor: editor2,
        position: new _atom.Point(3, 0)
      }, {
        editor: editor2,
        position: new _atom.Point(1, 1)
      }]);
    });
  });
}); // eslint-disable-next-line jasmine/no-disabled-tests

xdescribe('editorChangesDebounced', () => {
  let editor = null;
  let editorChanges = null;
  beforeEach(async () => {
    jasmine.useRealClock();
    editor = await atom.workspace.open();
    editorChanges = (0, _debounced().editorChangesDebounced)(editor, DEBOUNCE_INTERVAL);
  });
  it('debounces changes', async () => {
    const eventsPromise = editorChanges.takeUntil(_RxMin.Observable.of(null).delay(50)).toArray().toPromise();
    await (0, _promise().sleep)(SLEEP_INTERVAL);
    editor.insertNewline();
    editor.insertNewline();
    expect((await eventsPromise).length).toBe(1);
  });
});