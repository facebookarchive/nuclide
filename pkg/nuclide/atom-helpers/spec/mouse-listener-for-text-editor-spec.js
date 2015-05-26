'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Point} = require('atom');
var mouseListenerForTextEditor = require('../lib/mouse-listener-for-text-editor');

// Make this a bit more than the actual debounce time. Even though the tests use the mocked clock,
// it still seems to occasionally flake out.
var DEBOUNCE_TIME = 210;

describe('mouseListenerForTextEditor', () => {
  var textEditor;
  var textEditorView;
  var mouseListener;
  beforeEach(() => waitsForPromise(async () => {
    textEditor = await atom.workspace.open('mouse-listener-for-text-editor/meow.txt');
    textEditorView = atom.views.getView(textEditor);

    // We need the view attached to the DOM for the mouse events to work.
    jasmine.attachToDOM(textEditorView);

    // The debouncer relies on `Date.now`.
    spyOn(Date, 'now').andCallFake(() => window.now);

    // We delete this global property so the window mouse listener gets
    // recreated. This is the only way for the debounced function to be called
    // immediately for each test.
    delete atom.nuclide;

    mouseListener = mouseListenerForTextEditor(textEditor);
  }));

  afterEach(() => {
    mouseListener.dispose();
  });

  /**
   * Returns the pixel position in the DOM of the text editor's screen position.
   * This is used for dispatching mouse events in the text editor.
   *
   * Adapted from https://github.com/atom/atom/blob/5272584d2910e5b3f2b0f309aab4775eb0f779a6/spec/text-editor-component-spec.coffee#L2845
   */
  function clientCoordinatesForScreenPosition(screenPosition: Point): {clientX: number; clientY: number} {
    var positionOffset = textEditorView.pixelPositionForScreenPosition(screenPosition);
    var scrollViewClientRect = textEditorView.component.domNode
        .querySelector('.scroll-view')
        .getBoundingClientRect();
    var clientX = scrollViewClientRect.left + positionOffset.left - textEditor.getScrollLeft();
    var clientY = scrollViewClientRect.top + positionOffset.top - textEditor.getScrollTop();
    return {clientX, clientY};
  }

  describe('getLastPosition', () => {
    it('defaults to (0, 0)', () => {
      expect(mouseListener.getLastPosition()).toEqual(new Point(0, 0));
    });
  });

  describe('onDidPositionChange', () => {
    it('calls the callbacks for onDidPositionChange and updates the last position', () => {
      var position = new Point(0, 1);

      var fn = jasmine.createSpy('fn');
      var subscription = mouseListener.onDidPositionChange(fn);

      var event = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position));
      window.dispatchEvent(event);

      expect(fn).toHaveBeenCalledWith({nativeEvent: event, position});
      expect(mouseListener.getLastPosition()).toEqual(position);

      subscription.dispose();
    });

    it('truncates to the position of the last character on a line', () => {
      var fn = jasmine.createSpy('fn');
      var subscription = mouseListener.onDidPositionChange(fn);

      var event = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(new Point(0, 100)));
      window.dispatchEvent(event);

      expect(fn).toHaveBeenCalledWith({nativeEvent: event, position: new Point(0, 9)});

      subscription.dispose();
    });

    it('debounces the events', () => {
      var fn = jasmine.createSpy('fn');
      var subscription = mouseListener.onDidPositionChange(fn);

      var position1 = new Point(0, 1);
      var event1 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position1));
      window.dispatchEvent(event1);

      var position2 = new Point(0, 2);
      var event2 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position2));
      window.dispatchEvent(event2);

      advanceClock(DEBOUNCE_TIME);

      var position3 = new Point(0, 3);
      var event3 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position3));
      window.dispatchEvent(event3);

      expect(fn).toHaveBeenCalledWith({nativeEvent: event1, position: position1});
      expect(fn).toHaveBeenCalledWith({nativeEvent: event3, position: position3});
      expect(fn.callCount).toBe(2);

      subscription.dispose();
    });

    it('works even if the text editor is opened in multiple panes', () => {
      var fn = jasmine.createSpy('fn');
      var subscription = mouseListener.onDidPositionChange(fn);

      atom.workspace.getActivePane().splitUp({copyActiveItem: true});

      var position1 = new Point(0, 1);
      var event1 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position1));
      window.dispatchEvent(event1);

      expect(fn).toHaveBeenCalledWith({nativeEvent: event1, position: position1});
      expect(fn.callCount).toBe(1);

      subscription.dispose();
    });

    it('does not call if the mouse moved pixels but did not change text editor screen positions', () => {
      var fn = jasmine.createSpy('fn');
      var subscription = mouseListener.onDidPositionChange(fn);

      var position1 = new Point(0, 1);
      var event1 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position1));
      window.dispatchEvent(event1);

      advanceClock(DEBOUNCE_TIME);

      var coordinates2 = clientCoordinatesForScreenPosition(position1);
      coordinates2.clientX++;
      var event2 = new MouseEvent('mousemove', coordinates2);
      window.dispatchEvent(event2);

      expect(fn).toHaveBeenCalledWith({nativeEvent: event1, position: position1});
      expect(fn.callCount).toBe(1);

      subscription.dispose();
    });

    describe('dispose', () => {
      it('stops calling after the return value is disposed', () => {
        var fn = jasmine.createSpy('fn');
        var subscription = mouseListener.onDidPositionChange(fn);

        var position1 = new Point(0, 1);
        var event1 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position1));
        window.dispatchEvent(event1);

        advanceClock(DEBOUNCE_TIME);

        subscription.dispose();

        var position2 = new Point(0, 2);
        var event2 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position2));
        window.dispatchEvent(event2);

        expect(fn).toHaveBeenCalledWith({nativeEvent: event1, position: position1});
        expect(fn.callCount).toBe(1);
      });

      it('calls after dispose if another client is still using the listener', () => {
        var mouseListener2 = mouseListenerForTextEditor(textEditor);
        expect(mouseListener2).toBe(mouseListener);
        mouseListener2.dispose();

        var fn = jasmine.createSpy('fn');
        var subscription = mouseListener.onDidPositionChange(fn);

        var position = new Point(0, 1);
        var event = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position));
        window.dispatchEvent(event);

        expect(fn).toHaveBeenCalledWith({nativeEvent: event, position});
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });

      it('calls after it is completely disposed but then recreated', () => {
        mouseListener.dispose();

        var mouseListener2 = mouseListenerForTextEditor(textEditor);
        expect(mouseListener2).not.toBe(mouseListener);

        var fn = jasmine.createSpy('fn');
        var subscription = mouseListener2.onDidPositionChange(fn);

        var position = new Point(0, 1);
        var event = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position));
        window.dispatchEvent(event);

        expect(fn).toHaveBeenCalledWith({nativeEvent: event, position});
        expect(fn.callCount).toBe(1);

        mouseListener2.dispose();
        subscription.dispose();
      });

      it('still calls after another client of mouse listener disposes it', () => {
        var mouseListener2 = mouseListenerForTextEditor(textEditor);
        expect(mouseListener2).toBe(mouseListener);
        mouseListener2.dispose();

        var fn = jasmine.createSpy('fn');
        var subscription = mouseListener.onDidPositionChange(fn);

        var position = new Point(0, 1);
        var event = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position));
        window.dispatchEvent(event);

        expect(fn).toHaveBeenCalledWith({nativeEvent: event, position});
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });

      it('stops calling after the mouse listener is disposed', () => {
        var fn = jasmine.createSpy('fn');
        var subscription = mouseListener.onDidPositionChange(fn);

        var position1 = new Point(0, 1);
        var event1 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position1));
        window.dispatchEvent(event1);

        advanceClock(DEBOUNCE_TIME);

        mouseListener.dispose();

        var position2 = new Point(0, 2);
        var event2 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position2));
        window.dispatchEvent(event2);

        expect(fn).toHaveBeenCalledWith({nativeEvent: event1, position: position1});
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });

      it('stops calling after the text editor is destroyed', () => {
        var fn = jasmine.createSpy('fn');
        var subscription = mouseListener.onDidPositionChange(fn);

        var position1 = new Point(0, 1);
        var event1 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position1));
        window.dispatchEvent(event1);

        advanceClock(DEBOUNCE_TIME);

        // We have to set these values before destroying the text editor because they depend on it.
        var position2 = new Point(0, 2);
        var event2 = new MouseEvent('mousemove', clientCoordinatesForScreenPosition(position2));

        textEditor.destroy();

        window.dispatchEvent(event2);

        expect(fn).toHaveBeenCalledWith({nativeEvent: event1, position: position1});
        expect(fn.callCount).toBe(1);

        subscription.dispose();
      });
    });
  });
});
