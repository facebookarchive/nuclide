'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');
var QuickSelectionComponent = require('../lib/QuickSelectionComponent');
var QuickSelectionProvider = require('../lib/QuickSelectionProvider');

class TestQuickSelectionProvider extends QuickSelectionProvider {
  _items: {string: {string: Promise<FileResult>}};

  constructor(items: {string: {string: Promise<FileResult>}}) {
    super();
    this._items = items;
  }

  getPromptText() {
    return 'test';
  }

  executeQuery(query: String): Promise<{string: {string: Promise<FileResult>}}> {
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

    var testProvider = new TestQuickSelectionProvider({});
    component = React.render(
      <QuickSelectionComponent provider={testProvider} />,
      componentRoot
    );
  });

  afterEach(() => {
    React.unmountComponentAtNode(componentRoot);
    document.body.removeChild(componentRoot);
  });

  // Updates the component to be using a TestQuickSelectionProvider that will serve @items, then
  // executes @callback after the component has completely updated to be using the new provider.
  function withItemsSetTo(items: {string: {string: Promise<FileResult>}}, callback: (component: QuickSelectionComponent) => void) {
    waitsForPromise(() => new Promise((resolve, reject) => {

      component.onItemsChanged((newItems) => {
        resolve(component);
      });
      component = React.render(
        <QuickSelectionComponent provider={new TestQuickSelectionProvider(items)} />,
        componentRoot
      );
      window.advanceClock(250);

      component.clear();

      }).then(callback)
    );
  }

  describe('Confirmation', () => {
    it('should return the selected item on selection', () => {
      withItemsSetTo({testDirectory: {testProvider: Promise.resolve({results: [1, 2, 3]})}}, () => {

        var selectedItemIndex = component.getSelectedIndex();
        expect(selectedItemIndex.selectedDirectory).toBe('');
        expect(selectedItemIndex.selectedService).toBe('');
        expect(selectedItemIndex.selectedItemIndex).toBe(-1);

        waitsForPromise(() => new Promise((resolve, reject) => {
            component.onSelection((item) => {
              expect(item).toBe(1);
              resolve();
            });

            component.moveSelectionDown();
            component.select();
          }));
      });
    });

    it('should select on the core:confirm command (enter)', () => {
      withItemsSetTo({testDirectory: {testProvider: Promise.resolve({results: [1, 2, 3]})}}, () => {
        var componentNode = component.getDOMNode();

        var selectedItemIndex = component.getSelectedIndex();
        expect(selectedItemIndex.selectedDirectory).toBe('');
        expect(selectedItemIndex.selectedService).toBe('');
        expect(selectedItemIndex.selectedItemIndex).toBe(-1);

        waitsForPromise(() => new Promise((resolve, reject) => {
            component.onSelection((item) => {
              expect(item).toBe(1);
              resolve();
            });

            component.moveSelectionDown();
            atom.commands.dispatch(componentNode, 'core:confirm');
          }));
      });

    });

    it('should cancel instead of selecting when there are no items', () => {
      withItemsSetTo({}, () => {
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
      withItemsSetTo({testDirectory: {testProvider: Promise.resolve({results: [1, 2, 3]})}}, () => {
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
    it('should start out without selection', () => {
      withItemsSetTo({testDirectory: {testProvider: Promise.resolve({results: [1, 2, 3]})}}, () => {
        var selectedItemIndex = component.getSelectedIndex();
        expect(selectedItemIndex.selectedDirectory).toBe('');
        expect(selectedItemIndex.selectedService).toBe('');
        expect(selectedItemIndex.selectedItemIndex).toBe(-1);
      });
    });

    it('should move the selection and wrap at the top/bottom', () => {
      withItemsSetTo({testDirectory: {testProvider: Promise.resolve({results: [1, 2, 3]})}}, () => {
        expect(component.getSelectedIndex().selectedItemIndex).toBe(-1);

        waitsForPromise(() => new Promise((resolve, reject) => {
          component.onSelectionChanged((newIndex) => {
            resolve(newIndex);
          });
          component.moveSelectionDown();
        }).then(newIndex => {
          expect(newIndex.selectedItemIndex).toBe(0);
        }));

        waitsForPromise(() => new Promise((resolve, reject) => {
          component.onSelectionChanged((newIndex) => {
            resolve(newIndex);
          });
          component.moveSelectionDown();
        }).then(newIndex => {
          expect(newIndex.selectedItemIndex).toBe(1);
        }));

        waitsForPromise(() => new Promise((resolve, reject) => {
          component.onSelectionChanged((newIndex) => {
            resolve(newIndex);
          });
          component.moveSelectionDown();
        }).then(newIndex => {
          expect(newIndex.selectedItemIndex).toBe(2);
        }));

        waitsForPromise(() => new Promise((resolve, reject) => {
          component.onSelectionChanged((newIndex) => {
            resolve(newIndex);
          });
          component.moveSelectionDown();
        }).then(newIndex => {
          expect(newIndex.selectedItemIndex).toBe(0);
        }));

        waitsForPromise(() => new Promise((resolve, reject) => {
          component.onSelectionChanged((newIndex) => {
            resolve(newIndex);
          });
          component.moveSelectionUp();
        }).then(newIndex => {
          expect(newIndex.selectedItemIndex).toBe(2);
        }));

        waitsForPromise(() => new Promise((resolve, reject) => {
          component.onSelectionChanged((newIndex) => {
            resolve(newIndex);
          });
          component.moveSelectionUp();
        }).then(newIndex => {
          expect(newIndex.selectedItemIndex).toBe(1);
        }));

        waitsForPromise(() => new Promise((resolve, reject) => {
          component.onSelectionChanged((newIndex) => {
            resolve(newIndex);
          });
          component.moveSelectionUp();
        }).then(newIndex => {
          expect(newIndex.selectedItemIndex).toBe(0);
        }));

        waitsForPromise(() => new Promise((resolve, reject) => {
          component.onSelectionChanged((newIndex) => {
            resolve(newIndex);
          });
          component.moveSelectionUp();
        }).then(newIndex => {
          expect(newIndex.selectedItemIndex).toBe(2);
        }));

      });
    });

    it('should move the selection appropriately on core:move* commands', () => {
      withItemsSetTo({testDirectory: {testProvider: Promise.resolve({results: [1, 2, 3]})}}, () => {
        var componentNode = component.getDOMNode();

        var steps = [
          {expectedIndex: 0, nextCommand: 'core:move-up'},
          {expectedIndex: 2, nextCommand: 'core:move-down'},
          {expectedIndex: 0, nextCommand: 'core:move-down'},
          {expectedIndex: 1, nextCommand: 'core:move-to-bottom'},
          {expectedIndex: 2, nextCommand: 'core:move-to-top'},
          {expectedIndex: 0, nextCommand: ''},
        ];
        var index = 0;

        expect(component.getSelectedIndex().selectedItemIndex).toBe(-1);
        waitsForPromise(() => new Promise((resolve, reject) => {
          component.onSelectionChanged((newIndex) => {
            if (index === steps.length - 1) {
              resolve();
            } else {
              var spec = steps[index];
              expect(newIndex.selectedItemIndex).toBe(spec.expectedIndex);
              atom.commands.dispatch(componentNode, spec.nextCommand);
              index++;
            }
          });
          component.moveSelectionToTop();
        }));

      });
    });

    it('should reset the selection when the list contents change', () => {
      withItemsSetTo({testDirectory: {testProvider: Promise.resolve({results: [1, 2, 3]})}}, () => {
        expect(component.getSelectedIndex().selectedItemIndex).toBe(-1);

        waitsForPromise(() => new Promise((resolve, reject) => {
          component.onSelectionChanged((newIndex) => {
            resolve(newIndex);
          });
          component.moveSelectionDown();
        }).then(newIndex => {
          expect(newIndex.selectedItemIndex).toBe(0);
        }));

        withItemsSetTo({testDirectory: {testProvider: Promise.resolve({results: [5, 6, 7]})}}, () => {
          expect(component.getSelectedIndex().selectedItemIndex).toBe(-1);
        });
      });
    });

    it('should keep the selection index at -1 when there are no items', () => {
      withItemsSetTo({}, () => {
        //enable setTimeout: https://discuss.atom.io/t/solved-settimeout-not-working-firing-in-specs-tests/11427
        jasmine.unspy(window, 'setTimeout');

        expect(component.getSelectedIndex().selectedItemIndex).toBe(-1);

        waitsForPromise(() => new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(component.getSelectedIndex().selectedItemIndex).toBe(-1);
            resolve();
          }, 0);
          component.moveSelectionDown();
        }));

        waitsForPromise(() => new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(component.getSelectedIndex().selectedItemIndex).toBe(-1);
            resolve();
          }, 0);
          component.moveSelectionToBottom();
        }));

        waitsForPromise(() => new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(component.getSelectedIndex().selectedItemIndex).toBe(-1);
            resolve();
          }, 0);
          component.moveSelectionUp();
        }));

        waitsForPromise(() => new Promise((resolve, reject) => {
          setTimeout(() => {
            expect(component.getSelectedIndex().selectedItemIndex).toBe(-1);
            resolve();
          }, 0);
          component.moveSelectionToTop();
        }));
      });
    });
  });
});
