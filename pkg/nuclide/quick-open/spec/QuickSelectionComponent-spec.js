'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

var React = require('react-for-atom');
var {QuickSelectionComponent} = require('../lib/QuickSelectionComponent');
var {QuickSelectionProvider} = require('../lib/QuickSelectionProvider');

class TestQuickSelectionProvider extends QuickSelectionProvider {
  _items: Array<number>;

  constructor(items: Array<number>) {
    super();
    this._items = items;
  }

  getPromptText() {
    return 'test';
  }

  executeQuery(query: String): Promise<Array<number>> {
    return Promise.resolve(this._items);
  }
}

describe('QuickSelectionComponent', () => {
  var componentRoot: Node;
  var component: QuickSelectionComponent;

  beforeEach(() => {
    spyOn(Date, 'now').andCallFake(() => window.now);

    componentRoot = document.createElement('div');
    document.body.appendChild(componentRoot);
    component = React.render(
                  <QuickSelectionComponent provider={new TestQuickSelectionProvider([])} />,
                  componentRoot);
  });

  afterEach(() => {
    React.unmountComponentAtNode(componentRoot);
    document.body.removeChild(componentRoot);
  });

  // Updates the component to be using a TestQuickSelectionProvider that will serve @items, then
  // executes @callback after the component has completely updated to be using the new provider.
  function withItemsSetTo(items: Array<number>, callback: (component: QuickSelectionComponent) => void) {
    waitsForPromise(() => new Promise((resolve, reject) => {
      component.onItemsChanged((newItems) => {
        if (newItems === items) {
          resolve(component);
        }
      });

      component.setProvider(new TestQuickSelectionProvider(items));

      window.advanceClock(250);

      component.clear();

      }).then(callback)
    );
  }

  describe('Confirmation', () => {
    it('should return the selected item on selection', () => {
      withItemsSetTo([1, 2, 3], () => {
        expect(component.getSelectedIndex()).toBe(0);

        waitsForPromise(() => new Promise((resolve, reject) => {
            component.onSelection((item) => {
              expect(item).toBe(1);
              resolve();
            });

            component.select();
          }));
      });
    });

    it('should select on the core:confirm command (enter)', () => {
      withItemsSetTo([1, 2, 3], () => {
        var componentNode = component.getDOMNode();

        expect(component.getSelectedIndex()).toBe(0);

        waitsForPromise(() => new Promise((resolve, reject) => {
            component.onSelection((item) => {
              expect(item).toBe(1);
              resolve();
            });

            atom.commands.dispatch(componentNode, 'core:confirm');
          }));
      });

    });

    it('should cancel instead of selecting when there are no items', () => {
      withItemsSetTo([], () => {
        waitsForPromise(() => new Promise((resolve, reject) => {
            component.onCancellation((item) => {
              resolve();
            });

            component.select();
          }));
      });
    });
  });

  describe('Cancellation', () => {
    it('should cancel on the core:cancel command (esc)', () => {
      withItemsSetTo([1, 2, 3], () => {
        var componentNode = component.getDOMNode();

        waitsForPromise(() => new Promise((resolve, reject) => {
            component.onCancellation((item) => {
              resolve();
            });

            atom.commands.dispatch(componentNode, 'core:cancel');
          }));
      });
    });
  });

  describe('Selection', () => {
    it('should move the selection and wrap at the top/bottom', () => {
      withItemsSetTo([1, 2, 3], () => {
        expect(component.getSelectedIndex()).toBe(0);

        component.moveSelectionDown();
        expect(component.getSelectedIndex()).toBe(1);

        component.moveSelectionUp();
        expect(component.getSelectedIndex()).toBe(0);

        component.moveSelectionUp();
        expect(component.getSelectedIndex()).toBe(2);

        component.moveSelectionDown();
        expect(component.getSelectedIndex()).toBe(0);
      });
    });

    it('should move the selection appropriately on core:move* commands', () => {
      withItemsSetTo([1, 2, 3], () => {
        var componentNode = component.getDOMNode();

        expect(component.getSelectedIndex()).toBe(0);

        atom.commands.dispatch(componentNode, 'core:move-down');
        expect(component.getSelectedIndex()).toBe(1);

        atom.commands.dispatch(componentNode, 'core:move-up');
        expect(component.getSelectedIndex()).toBe(0);

        atom.commands.dispatch(componentNode, 'core:move-to-bottom');
        expect(component.getSelectedIndex()).toBe(2);

        atom.commands.dispatch(componentNode, 'core:move-to-top');
        expect(component.getSelectedIndex()).toBe(0);
      });
    });

    it('should reset the selection when the list contents change', () => {
      withItemsSetTo([1, 2, 3], () => {
        expect(component.getSelectedIndex()).toBe(0);

        component.moveSelectionDown();
        expect(component.getSelectedIndex()).toBe(1);

        withItemsSetTo([1, 2], () => {
          expect(component.getSelectedIndex()).toBe(0);
        });
      });
    });

    it('should keep the selection index at 0 when there are no items', () => {
      withItemsSetTo([], () => {
        expect(component.getSelectedIndex()).toBe(0);

        component.moveSelectionDown();
        expect(component.getSelectedIndex()).toBe(0);

        component.moveSelectionToBottom();
        expect(component.getSelectedIndex()).toBe(0);

        component.moveSelectionUp();
        expect(component.getSelectedIndex()).toBe(0);

        component.moveSelectionToTop();
        expect(component.getSelectedIndex()).toBe(0);
      });
    });
  });
});
