'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-env browser */

var {Point, Range} = require('atom');
var Hyperclick = require('../lib/Hyperclick');

describe('Hyperclick', () => {
  var textEditor;
  var textEditorView;
  var hyperclick;
  var hyperclickForTextEditor;
  beforeEach(() => waitsForPromise(async () => {
    textEditor = await atom.workspace.open('hyperclick.txt');
    textEditorView = atom.views.getView(textEditor);

    // We need the view attached to the DOM for the mouse events to work.
    jasmine.attachToDOM(textEditorView);

    hyperclick = new Hyperclick();
    hyperclickForTextEditor = hyperclick._hyperclickForTextEditors.values().next().value;
  }));

  afterEach(() => {
    hyperclick.dispose();
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

  function dispatch(
      eventClass: KeyboardEvent | MouseEvent,
      type: string,
      position: Point,
      properties?: mixed): void {
    var {clientX, clientY} = clientCoordinatesForScreenPosition(position);
    if (properties) {
      properties.clientX = clientX;
      properties.clientY = clientY;
    } else {
      properties = {clientX, clientY};
    }
    var event = new eventClass(type, properties);
    textEditorView.dispatchEvent(event);
  }

  describe('simple case', () => {
    var provider;

    var position = new Point(0, 1);

    beforeEach(() => {
      provider = {
        getSuggestionForWord(sourceTextEditor, text, range) {
          return {range, callback: () => {}};
        },
      };
      spyOn(provider, 'getSuggestionForWord').andCallThrough();
      hyperclick.consumeProvider(provider);
    });
    it('should call the provider', () => {
      waitsForPromise(async () => {
        await hyperclick.getSuggestion(textEditor, position);
        expect(provider.getSuggestionForWord).toHaveBeenCalled();
      });
    });
    it('should not call a removed provider', () => {
      waitsForPromise(async () => {
        hyperclick.removeProvider(provider);
        await hyperclick.getSuggestion(textEditor, position);
        expect(provider.getSuggestionForWord).not.toHaveBeenCalled();
      });
    });
  });

  describe('<meta-mousemove> + <meta-mousedown>', () => {
    it('consumes single-word providers without wordRegExp', () => {
      waitsForPromise(async () => {
        var callback = jasmine.createSpy('callback');
        var provider = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        var position = new Point(0, 1);
        var expectedText = 'word1';
        var expectedRange = Range.fromObject([[0, 0], [0, 5]]);

        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestionForWord).toHaveBeenCalledWith(
            textEditor,
            expectedText,
            expectedRange);

        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});
        expect(callback.callCount).toBe(1);
      });
    });

    it('consumes single-word providers with wordRegExp', () => {
      waitsForPromise(async () => {
        var callback = jasmine.createSpy('callback');
        var provider = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
          wordRegExp: /word/g,
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        var position = new Point(0, 8);
        var expectedText = 'word';
        var expectedRange = Range.fromObject([[0, 6], [0, 10]]);

        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestionForWord).toHaveBeenCalledWith(
            textEditor,
            expectedText,
            expectedRange);

        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});
        expect(callback.callCount).toBe(1);
      });
    });

    it('consumes multi-range providers', () => {
      waitsForPromise(async () => {
        var callback = jasmine.createSpy('callback');
        var provider = {
          getSuggestion(sourceTextEditor: TextEditor, sourcePosition: Point) {
            var range = [
              new Range(sourcePosition, sourcePosition.translate([0, 1])),
              new Range(sourcePosition.translate([0, 2]), sourcePosition.translate([0, 3])),
            ];
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestion').andCallThrough();
        hyperclick.consumeProvider(provider);

        var position = new Point(0, 8);

        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestion).toHaveBeenCalledWith(textEditor, position);

        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});
        expect(callback.callCount).toBe(1);
      });
    });

    it('consumes multiple providers from different sources', () => {
      waitsForPromise(async () => {
        var callback1 = jasmine.createSpy('callback');
        var provider1 = {
          // Do not return a suggestion, so we can fall through to provider2.
          getSuggestionForWord(sourceTextEditor, text, range) {}
        };
        spyOn(provider1, 'getSuggestionForWord').andCallThrough();

        var callback2 = jasmine.createSpy('callback');
        var provider2 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
        };
        spyOn(provider2, 'getSuggestionForWord').andCallThrough();

        hyperclick.consumeProvider(provider1);
        hyperclick.consumeProvider(provider2);

        var position = new Point(0, 1);
        var expectedText = 'word1';
        var expectedRange = Range.fromObject([[0, 0], [0, 5]]);

        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider2.getSuggestionForWord).toHaveBeenCalledWith(
            textEditor,
            expectedText,
            expectedRange);

        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});
        expect(callback1.callCount).toBe(0);
        expect(callback2.callCount).toBe(1);
      });
    });

    it('consumes multiple providers from the same source', () => {
      waitsForPromise(async () => {
        var callback1 = jasmine.createSpy('callback');
        var provider1 = {
          // Do not return a suggestion, so we can fall through to provider2.
          getSuggestionForWord(sourceTextEditor, text, range) {}
        };
        spyOn(provider1, 'getSuggestionForWord').andCallThrough();

        var callback2 = jasmine.createSpy('callback');
        var provider2 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
        };
        spyOn(provider2, 'getSuggestionForWord').andCallThrough();

        hyperclick.consumeProvider([provider1, provider2]);

        var position = new Point(0, 1);
        var expectedText = 'word1';
        var expectedRange = Range.fromObject([[0, 0], [0, 5]]);

        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider2.getSuggestionForWord).toHaveBeenCalledWith(
            textEditor,
            expectedText,
            expectedRange);

        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});
        expect(callback1.callCount).toBe(0);
        expect(callback2.callCount).toBe(1);
      });
    });
  });

  describe('avoids excessive calls', () => {
    it('ignores <mousemove> in the same word as the last position', () => {
      waitsForPromise(async () => {
        var provider = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            // Never resolve this, so we know that no suggestion is set.
            return new Promise(() => {});
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        var position = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        dispatch(MouseEvent, 'mousemove', position.translate([0, 1]), {metaKey: true});
        dispatch(MouseEvent, 'mousemove', position.translate([0, 2]), {metaKey: true});

        expect(provider.getSuggestionForWord.callCount).toBe(1);
      });
    });

    it('ignores <mousemove> in the same single-range as the last suggestion', () => {
      waitsForPromise(async () => {
        var callback = jasmine.createSpy('callback');
        var provider = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        var position = new Point(0, 1);
        var expectedText = 'word1';
        var expectedRange = Range.fromObject([[0, 0], [0, 5]]);

        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestionForWord).toHaveBeenCalledWith(
            textEditor,
            expectedText,
            expectedRange);

        dispatch(MouseEvent, 'mousemove', position.translate([0, 1]), {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();

        expect(provider.getSuggestionForWord.callCount).toBe(1);

        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});
        expect(callback.callCount).toBe(1);
      });
    });

    it('handles <mousemove> in a different single-range as the last suggestion', () => {
      waitsForPromise(async () => {
        var callback = jasmine.createSpy('callback');
        var provider = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        var position1 = new Point(0, 1);
        var expectedText1 = 'word1';
        var expectedRange1 = Range.fromObject([[0, 0], [0, 5]]);

        dispatch(MouseEvent, 'mousemove', position1, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestionForWord).toHaveBeenCalledWith(
            textEditor,
            expectedText1,
            expectedRange1);

        var position2 = new Point(0, 8);
        var expectedText2 = 'word2';
        var expectedRange2 = Range.fromObject([[0, 6], [0, 11]]);
        dispatch(MouseEvent, 'mousemove', position2, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestionForWord).toHaveBeenCalledWith(
            textEditor,
            expectedText2,
            expectedRange2);

        expect(provider.getSuggestionForWord.callCount).toBe(2);

        dispatch(MouseEvent, 'mousedown', position2, {metaKey: true});
        expect(callback.callCount).toBe(1);
      });
    });

    it('ignores <mousemove> in the same multi-range as the last suggestion', () => {
      waitsForPromise(async () => {
        var range = [
          new Range(new Point(0, 1), new Point(0, 2)),
          new Range(new Point(0, 4), new Point(0, 5)),
        ];
        var callback = jasmine.createSpy('callback');
        var provider = {
          getSuggestion(sourceTextEditor: TextEditor, sourcePosition: Point) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestion').andCallThrough();
        hyperclick.consumeProvider(provider);

        var position = new Point(0, 1);

        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestion).toHaveBeenCalledWith(textEditor, position);

        dispatch(MouseEvent, 'mousemove', new Point(0, 4), {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();

        expect(provider.getSuggestion.callCount).toBe(1);

        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});
        expect(callback.callCount).toBe(1);
      });
    });

    it('handles <mousemove> in a different multi-range as the last suggestion', () => {
      waitsForPromise(async () => {
        var range = [
          new Range(new Point(0, 1), new Point(0, 2)),
          new Range(new Point(0, 4), new Point(0, 5)),
        ];
        var callback = jasmine.createSpy('callback');
        var provider = {
          getSuggestion(sourceTextEditor: TextEditor, position: Point) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestion').andCallThrough();
        hyperclick.consumeProvider(provider);

        var position1 = new Point(0, 1);

        dispatch(MouseEvent, 'mousemove', position1, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestion).toHaveBeenCalledWith(textEditor, position1);

        var position2 = new Point(0, 3);
        dispatch(MouseEvent, 'mousemove', position2, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestion).toHaveBeenCalledWith(textEditor, position2);

        expect(provider.getSuggestion.callCount).toBe(2);

        dispatch(MouseEvent, 'mousedown', position2, {metaKey: true});
        expect(callback.callCount).toBe(1);
      });
    });
  });

  describe('adds the `hyperclick` CSS class', () => {
    var provider = {
      getSuggestionForWord(sourceTextEditor, text, range) {
        return {range, callback() {}};
      },
    };

    beforeEach(() => {
      hyperclick.consumeProvider(provider);
    });

    it('adds on <meta-mousemove>, removes on <meta-mousedown>', () => {
      waitsForPromise(async () => {
        var position = new Point(0, 1);

        expect(textEditorView.classList.contains('hyperclick')).toBe(false);

        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(textEditorView.classList.contains('hyperclick')).toBe(true);

        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});
        expect(textEditorView.classList.contains('hyperclick')).toBe(false);
      });
    });

    it('adds on <meta-keydown>, removes on <meta-keyup>', () => {
      waitsForPromise(async () => {
        var position = new Point(0, 1);

        // We need to move the mouse once, so Hyperclick knows where it is.
        dispatch(MouseEvent, 'mousemove', position);
        expect(textEditorView.classList.contains('hyperclick')).toBe(false);

        dispatch(KeyboardEvent, 'keydown', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(textEditorView.classList.contains('hyperclick')).toBe(true);

        dispatch(KeyboardEvent, 'keyup', position);
        expect(textEditorView.classList.contains('hyperclick')).toBe(false);
      });
    });
  });

  describe('hyperclick:confirm-cursor', () => {
    it('confirms the suggestion at the cursor even if the mouse moved', () => {
      waitsForPromise(async () => {
        var callback = jasmine.createSpy('callback');
        var provider = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        var mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();

        textEditor.setCursorBufferPosition(new Point(0, 8));
        atom.commands.dispatch(textEditorView, 'hyperclick:confirm-cursor');
        expect(provider.getSuggestionForWord).toHaveBeenCalledWith(
            textEditor,
            'word2',
            Range.fromObject([[0, 6], [0, 11]]));
        waitsFor(() => callback.callCount === 1);
      });
    });
  });

  describe('priority', () => {
    it('confirms higher priority provider when it is consumed first', () => {
      waitsForPromise(async () => {
        var callback1 = jasmine.createSpy('callback');
        var provider1 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
          priority: 5,
        };
        hyperclick.consumeProvider(provider1);

        var callback2 = jasmine.createSpy('callback');
        var provider2 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
          priority: 3,
        };
        hyperclick.consumeProvider(provider2);

        var mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(1);
        expect(callback2.callCount).toBe(0);
      });
    });

    it('confirms higher priority provider when it is consumed last', () => {
      waitsForPromise(async () => {
        var callback1 = jasmine.createSpy('callback');
        var provider1 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
          priority: 3,
        };
        hyperclick.consumeProvider(provider1);

        var callback2 = jasmine.createSpy('callback');
        var provider2 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
          priority: 5,
        };
        hyperclick.consumeProvider(provider2);

        var mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(0);
        expect(callback2.callCount).toBe(1);
      });
    });

    it('confirms >0 priority before default priority', () => {
      waitsForPromise(async () => {
        var callback1 = jasmine.createSpy('callback');
        var provider1 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
        };
        hyperclick.consumeProvider(provider1);

        var callback2 = jasmine.createSpy('callback');
        var provider2 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
          priority: 1,
        };
        hyperclick.consumeProvider(provider2);

        var mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(0);
        expect(callback2.callCount).toBe(1);
      });
    });

    it('confirms <0 priority after default priority', () => {
      waitsForPromise(async () => {
        var callback1 = jasmine.createSpy('callback');
        var provider1 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
          priority: -1,
        };
        hyperclick.consumeProvider(provider1);

        var callback2 = jasmine.createSpy('callback');
        var provider2 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
        };
        hyperclick.consumeProvider(provider2);

        var mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(0);
        expect(callback2.callCount).toBe(1);
      });
    });

    it('confirms same-priority in the order they are consumed', () => {
      waitsForPromise(async () => {
        var callback1 = jasmine.createSpy('callback');
        var provider1 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
        };
        hyperclick.consumeProvider(provider1);

        var callback2 = jasmine.createSpy('callback');
        var provider2 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
        };
        hyperclick.consumeProvider(provider2);

        var mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(1);
        expect(callback2.callCount).toBe(0);
      });
    });

    it('confirms highest priority provider when multiple are consumed at a time', () => {
      waitsForPromise(async () => {
        var callback1 = jasmine.createSpy('callback');
        var provider1 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
          priority: 1,
        };
        var callback2 = jasmine.createSpy('callback');
        var provider2 = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
          priority: 2,
        };

        hyperclick.consumeProvider([provider1, provider2]);

        var mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(0);
        expect(callback2.callCount).toBe(1);
      });
    });
  });

  describe('multiple suggestions', () => {
    it('confirms the first suggestion', () => {
      waitsForPromise(async () => {
        var callback = [
          {
            title: 'callback1',
            callback: jasmine.createSpy('callback1'),
          },
          {
            title: 'callback2',
            callback: jasmine.createSpy('callback1'),
          },
        ];
        var provider = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        hyperclick.consumeProvider(provider);

        var position = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});

        var suggestionListEl = textEditorView.querySelector('hyperclick-suggestion-list');
        expect(suggestionListEl).toExist();

        atom.commands.dispatch(textEditorView, 'editor:newline');

        expect(callback[0].callback.callCount).toBe(1);
        expect(callback[1].callback.callCount).toBe(0);
        expect(textEditorView.querySelector('hyperclick-suggestion-list')).not.toExist();
      });
    });

    it('confirms the second suggestion', () => {
      waitsForPromise(async () => {
        var callback = [
          {
            title: 'callback1',
            callback: jasmine.createSpy('callback1'),
          },
          {
            title: 'callback2',
            callback: jasmine.createSpy('callback1'),
          },
        ];
        var provider = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        hyperclick.consumeProvider(provider);

        var position = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});

        var suggestionListEl = textEditorView.querySelector('hyperclick-suggestion-list');
        expect(suggestionListEl).toExist();

        atom.commands.dispatch(textEditorView, 'core:move-down');
        atom.commands.dispatch(textEditorView, 'editor:newline');

        expect(callback[0].callback.callCount).toBe(0);
        expect(callback[1].callback.callCount).toBe(1);
        expect(textEditorView.querySelector('hyperclick-suggestion-list')).not.toExist();
      });
    });

    it('is cancelable', () => {
      waitsForPromise(async () => {
        var callback = [
          {
            title: 'callback1',
            callback: jasmine.createSpy('callback1'),
          },
          {
            title: 'callback2',
            callback: jasmine.createSpy('callback1'),
          },
        ];
        var provider = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        hyperclick.consumeProvider(provider);

        var position = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});

        var suggestionListEl = textEditorView.querySelector('hyperclick-suggestion-list');
        expect(suggestionListEl).toExist();

        atom.commands.dispatch(textEditorView, 'core:cancel');

        expect(callback[0].callback.callCount).toBe(0);
        expect(callback[1].callback.callCount).toBe(0);
        expect(textEditorView.querySelector('hyperclick-suggestion-list')).not.toExist();
      });
    });
  });

  describe('when the editor has soft-wrapped lines', () => {
    beforeEach(() => {
      textEditor.setSoftWrapped(true);
      atom.config.set('editor.softWrapAtPreferredLineLength', true);
      atom.config.set('editor.preferredLineLength', 6); // This wraps each word onto its own line.
    });

    it('Hyperclick correctly detects the word being moused over.', () => {
      waitsForPromise(async () => {

        var callback = jasmine.createSpy('callback');
        var provider = {
          getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        var position = new Point(8, 0);
        var expectedText = 'word9';
        var expectedBufferRange = Range.fromObject([[2, 12], [2, 17]]);
        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestionForWord).toHaveBeenCalledWith(
            textEditor,
            expectedText,
            expectedBufferRange);
        expect(provider.getSuggestionForWord.callCount).toBe(1);
      });
    });
  });
});
