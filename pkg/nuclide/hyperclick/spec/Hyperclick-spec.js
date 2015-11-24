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

import type {HyperclickProvider} from 'hyperclick-interfaces';
import type HyperclickForTextEditor from '../lib/HyperclickForTextEditor';

import {array} from 'nuclide-commons';
import {Point, Range} from 'atom';
import Hyperclick from '../lib/Hyperclick';
import invariant from 'assert';

describe('Hyperclick', () => {
  let textEditor: atom$TextEditor = (null: any);
  let textEditorView: atom$TextEditorElement = (null: any);
  let hyperclick: Hyperclick = (null: any);
  let hyperclickForTextEditor: HyperclickForTextEditor = (null: any);

  beforeEach(() => waitsForPromise(async () => {
    textEditor = await atom.workspace.open('hyperclick.txt');
    textEditorView = atom.views.getView(textEditor);

    // We need the view attached to the DOM for the mouse events to work.
    jasmine.attachToDOM(textEditorView);

    hyperclick = new Hyperclick();
    hyperclickForTextEditor = array.from(hyperclick._hyperclickForTextEditors)[0];
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
  function clientCoordinatesForScreenPosition(
    screenPosition: atom$Point,
  ): {clientX: number; clientY: number} {
    const positionOffset = textEditorView.pixelPositionForScreenPosition(screenPosition);
    const {component} = textEditorView;
    invariant(component);
    const scrollViewClientRect = component.domNode
        .querySelector('.scroll-view')
        .getBoundingClientRect();
    // $FlowFixMe: Use of private method.
    const scrollLeft = textEditor.getScrollLeft();
    // $FlowFixMe: Use of private method.
    const scrollTop = textEditor.getScrollTop();
    const clientX = scrollViewClientRect.left + positionOffset.left - scrollLeft;
    const clientY = scrollViewClientRect.top + positionOffset.top - scrollTop;
    return {clientX, clientY};
  }

  function dispatch(
      // $FlowIssue KeyboardEvent isn't defined.
      eventClass: typeof KeyboardEvent | typeof MouseEvent,
      type: string,
      position: atom$Point,
      properties?: {clientX?: number, clientY?: number, metaKey?: boolean},
    ): void {
    const {clientX, clientY} = clientCoordinatesForScreenPosition(position);
    if (properties != null) {
      properties.clientX = clientX;
      properties.clientY = clientY;
    } else {
      properties = {clientX, clientY};
    }
    const event = new eventClass(type, properties);
    let domNode = null;
    if (eventClass === MouseEvent) {
      const {component} = textEditorView;
      invariant(component);
      domNode = component.linesComponent.getDomNode();
    } else {
      domNode = textEditorView;
    }
    domNode.dispatchEvent(event);
  }

  describe('simple case', () => {
    let provider: HyperclickProvider = (null: any);
    const position = new Point(0, 1);

    beforeEach(() => {
      provider = {
        providerName: 'test',
        async getSuggestionForWord(sourceTextEditor, text, range) {
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
        const callback = jasmine.createSpy('callback');
        const provider = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        const position = new Point(0, 1);
        const expectedText = 'word1';
        const expectedRange = Range.fromObject([[0, 0], [0, 5]]);

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
        const callback = jasmine.createSpy('callback');
        const provider = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
          wordRegExp: /word/g,
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        const position = new Point(0, 8);
        const expectedText = 'word';
        const expectedRange = Range.fromObject([[0, 6], [0, 10]]);

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
        const callback = jasmine.createSpy('callback');
        const provider = {
          providerName: 'test',
          async getSuggestion(sourceTextEditor: TextEditor, sourcePosition: Point) {
            const range = [
              new Range(sourcePosition, sourcePosition.translate([0, 1])),
              new Range(sourcePosition.translate([0, 2]), sourcePosition.translate([0, 3])),
            ];
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestion').andCallThrough();
        hyperclick.consumeProvider(provider);

        const position = new Point(0, 8);

        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestion).toHaveBeenCalledWith(textEditor, position);

        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});
        expect(callback.callCount).toBe(1);
      });
    });

    it('consumes multiple providers from different sources', () => {
      waitsForPromise(async () => {
        const callback1 = jasmine.createSpy('callback');
        const provider1 = {
          providerName: 'test',
          // Do not return a suggestion, so we can fall through to provider2.
          async getSuggestionForWord(sourceTextEditor, text, range) {},
        };
        spyOn(provider1, 'getSuggestionForWord').andCallThrough();

        const callback2 = jasmine.createSpy('callback');
        const provider2 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
        };
        spyOn(provider2, 'getSuggestionForWord').andCallThrough();

        hyperclick.consumeProvider(provider1);
        hyperclick.consumeProvider(provider2);

        const position = new Point(0, 1);
        const expectedText = 'word1';
        const expectedRange = Range.fromObject([[0, 0], [0, 5]]);

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
        const callback1 = jasmine.createSpy('callback');
        const provider1 = {
          providerName: 'test',
          // Do not return a suggestion, so we can fall through to provider2.
          async getSuggestionForWord(sourceTextEditor, text, range) {},
        };
        spyOn(provider1, 'getSuggestionForWord').andCallThrough();

        const callback2 = jasmine.createSpy('callback');
        const provider2 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
        };
        spyOn(provider2, 'getSuggestionForWord').andCallThrough();

        hyperclick.consumeProvider([provider1, provider2]);

        const position = new Point(0, 1);
        const expectedText = 'word1';
        const expectedRange = Range.fromObject([[0, 0], [0, 5]]);

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
        const provider = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            // Never resolve this, so we know that no suggestion is set.
            return new Promise(() => {});
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        const position = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        dispatch(MouseEvent, 'mousemove', position.translate([0, 1]), {metaKey: true});
        dispatch(MouseEvent, 'mousemove', position.translate([0, 2]), {metaKey: true});

        expect(provider.getSuggestionForWord.callCount).toBe(1);
      });
    });

    it('ignores <mousemove> in the same single-range as the last suggestion', () => {
      waitsForPromise(async () => {
        const callback = jasmine.createSpy('callback');
        const provider = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        const position = new Point(0, 1);
        const expectedText = 'word1';
        const expectedRange = Range.fromObject([[0, 0], [0, 5]]);

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
        const callback = jasmine.createSpy('callback');
        const provider = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        const position1 = new Point(0, 1);
        const expectedText1 = 'word1';
        const expectedRange1 = Range.fromObject([[0, 0], [0, 5]]);

        dispatch(MouseEvent, 'mousemove', position1, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestionForWord).toHaveBeenCalledWith(
            textEditor,
            expectedText1,
            expectedRange1);

        const position2 = new Point(0, 8);
        const expectedText2 = 'word2';
        const expectedRange2 = Range.fromObject([[0, 6], [0, 11]]);
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
        const range = [
          new Range(new Point(0, 1), new Point(0, 2)),
          new Range(new Point(0, 4), new Point(0, 5)),
        ];
        const callback = jasmine.createSpy('callback');
        const provider = {
          providerName: 'test',
          async getSuggestion(sourceTextEditor, sourcePosition) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestion').andCallThrough();
        hyperclick.consumeProvider(provider);

        const position = new Point(0, 1);

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
        const range = [
          new Range(new Point(0, 1), new Point(0, 2)),
          new Range(new Point(0, 4), new Point(0, 5)),
        ];
        const callback = jasmine.createSpy('callback');
        const provider = {
          providerName: 'test',
          async getSuggestion(sourceTextEditor, position) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestion').andCallThrough();
        hyperclick.consumeProvider(provider);

        const position1 = new Point(0, 1);

        dispatch(MouseEvent, 'mousemove', position1, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        expect(provider.getSuggestion).toHaveBeenCalledWith(textEditor, position1);

        const position2 = new Point(0, 3);
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
    const provider = {
      providerName: 'test',
      async getSuggestionForWord(sourceTextEditor, text, range) {
        return {range, callback() {}};
      },
    };

    beforeEach(() => {
      hyperclick.consumeProvider(provider);
    });

    it('adds on <meta-mousemove>, removes on <meta-mousedown>', () => {
      waitsForPromise(async () => {
        const position = new Point(0, 1);

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
        const position = new Point(0, 1);

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
        const callback = jasmine.createSpy('callback');
        const provider = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        const mousePosition = new Point(0, 1);
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
        const callback1 = jasmine.createSpy('callback');
        const provider1 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
          priority: 5,
        };
        hyperclick.consumeProvider(provider1);

        const callback2 = jasmine.createSpy('callback');
        const provider2 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
          priority: 3,
        };
        hyperclick.consumeProvider(provider2);

        const mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(1);
        expect(callback2.callCount).toBe(0);
      });
    });

    it('confirms higher priority provider when it is consumed last', () => {
      waitsForPromise(async () => {
        const callback1 = jasmine.createSpy('callback');
        const provider1 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
          priority: 3,
        };
        hyperclick.consumeProvider(provider1);

        const callback2 = jasmine.createSpy('callback');
        const provider2 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
          priority: 5,
        };
        hyperclick.consumeProvider(provider2);

        const mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(0);
        expect(callback2.callCount).toBe(1);
      });
    });

    it('confirms >0 priority before default priority', () => {
      waitsForPromise(async () => {
        const callback1 = jasmine.createSpy('callback');
        const provider1 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
        };
        hyperclick.consumeProvider(provider1);

        const callback2 = jasmine.createSpy('callback');
        const provider2 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
          priority: 1,
        };
        hyperclick.consumeProvider(provider2);

        const mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(0);
        expect(callback2.callCount).toBe(1);
      });
    });

    it('confirms <0 priority after default priority', () => {
      waitsForPromise(async () => {
        const callback1 = jasmine.createSpy('callback');
        const provider1 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
          priority: -1,
        };
        hyperclick.consumeProvider(provider1);

        const callback2 = jasmine.createSpy('callback');
        const provider2 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
        };
        hyperclick.consumeProvider(provider2);

        const mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(0);
        expect(callback2.callCount).toBe(1);
      });
    });

    it('confirms same-priority in the order they are consumed', () => {
      waitsForPromise(async () => {
        const callback1 = jasmine.createSpy('callback');
        const provider1 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
        };
        hyperclick.consumeProvider(provider1);

        const callback2 = jasmine.createSpy('callback');
        const provider2 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
        };
        hyperclick.consumeProvider(provider2);

        const mousePosition = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', mousePosition, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', mousePosition, {metaKey: true});

        expect(callback1.callCount).toBe(1);
        expect(callback2.callCount).toBe(0);
      });
    });

    it('confirms highest priority provider when multiple are consumed at a time', () => {
      waitsForPromise(async () => {
        const callback1 = jasmine.createSpy('callback');
        const provider1 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback1};
          },
          priority: 1,
        };
        const callback2 = jasmine.createSpy('callback');
        const provider2 = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback: callback2};
          },
          priority: 2,
        };

        hyperclick.consumeProvider([provider1, provider2]);

        const mousePosition = new Point(0, 1);
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
        const callback = [
          {
            title: 'callback1',
            callback: jasmine.createSpy('callback1'),
          },
          {
            title: 'callback2',
            callback: jasmine.createSpy('callback1'),
          },
        ];
        const provider = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        hyperclick.consumeProvider(provider);

        const position = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});

        const suggestionListEl = textEditorView.querySelector('hyperclick-suggestion-list');
        expect(suggestionListEl).toExist();

        atom.commands.dispatch(textEditorView, 'editor:newline');

        expect(callback[0].callback.callCount).toBe(1);
        expect(callback[1].callback.callCount).toBe(0);
        expect(textEditorView.querySelector('hyperclick-suggestion-list')).not.toExist();
      });
    });

    it('confirms the second suggestion', () => {
      waitsForPromise(async () => {
        const callback = [
          {
            title: 'callback1',
            callback: jasmine.createSpy('callback1'),
          },
          {
            title: 'callback2',
            callback: jasmine.createSpy('callback1'),
          },
        ];
        const provider = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        hyperclick.consumeProvider(provider);

        const position = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});

        const suggestionListEl = textEditorView.querySelector('hyperclick-suggestion-list');
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
        const callback = [
          {
            title: 'callback1',
            callback: jasmine.createSpy('callback1'),
          },
          {
            title: 'callback2',
            callback: jasmine.createSpy('callback1'),
          },
        ];
        const provider = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        hyperclick.consumeProvider(provider);

        const position = new Point(0, 1);
        dispatch(MouseEvent, 'mousemove', position, {metaKey: true});
        await hyperclickForTextEditor.getSuggestionAtMouse();
        dispatch(MouseEvent, 'mousedown', position, {metaKey: true});

        const suggestionListEl = textEditorView.querySelector('hyperclick-suggestion-list');
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

        const callback = jasmine.createSpy('callback');
        const provider = {
          providerName: 'test',
          async getSuggestionForWord(sourceTextEditor, text, range) {
            return {range, callback};
          },
        };
        spyOn(provider, 'getSuggestionForWord').andCallThrough();
        hyperclick.consumeProvider(provider);

        const position = new Point(8, 0);
        const expectedText = 'word9';
        const expectedBufferRange = Range.fromObject([[2, 12], [2, 17]]);
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
