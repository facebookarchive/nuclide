/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+nuclide
 */
import {setup} from '../__mocks__/file_tree_setup';
import type {FileTreeNode} from '../lib/FileTreeNode';
import {WorkingSet} from '../../nuclide-working-sets-common';
import createStore from '../lib/redux/createStore';
import FileTreeHelpers from '../lib/FileTreeHelpers';

import nuclideUri from 'nuclide-commons/nuclideUri';
import invariant from 'assert';

import * as Selectors from '../lib/redux/Selectors';
import * as Actions from '../lib/redux/Actions';
import * as EpicHelpers from '../lib/redux/EpicHelpers';

const {updateNodeAtRoot} = FileTreeHelpers;

describe('FileTreeController', () => {
  const store = createStore();

  function getNode(rootKey: string, nodeKey: string): FileTreeNode {
    const node = Selectors.getNode(store.getState(), rootKey, nodeKey);
    invariant(node);
    return node;
  }

  function isSelected(rootKey: string, nodeKey: string): boolean {
    return Selectors.getNodeIsSelected(
      store.getState(),
      getNode(rootKey, nodeKey),
    );
  }

  function isExpanded(rootKey: string, nodeKey: string): boolean {
    return getNode(rootKey, nodeKey).isExpanded;
  }

  function numSelected(): number {
    return Selectors.getSelectedNodes(store.getState()).size;
  }

  beforeEach(() => {
    setup(store);

    // The controller uses the currently active file to decide when and what to reveal in the file
    // tree when revealActiveFile is called. Importantly, it also short-circuits in some cases if
    // the path is null or undefined. Here we mock it out so that we get normal behavior in our
    // tests.
    jest.spyOn(atom.workspace, 'getActiveTextEditor').mockReturnValue({
      getPath() {
        return 'foo';
      },
    });
  });

  afterEach(() => {
    store.dispatch(Actions.updateWorkingSet(new WorkingSet([])));
    store.dispatch(Actions.reset());
  });

  describe('navigating with the keyboard', () => {
    const rootKey = nuclideUri.join(__dirname, '../__mocks__/fixtures') + '/';
    const dir0key =
      nuclideUri.join(__dirname, '../__mocks__/fixtures/dir0') + '/';
    const dir1Key =
      nuclideUri.join(__dirname, '../__mocks__/fixtures/dir1') + '/';
    const fooTxtKey = nuclideUri.join(
      __dirname,
      '../__mocks__/fixtures/dir1/foo.txt',
    );
    const dir2Key =
      nuclideUri.join(__dirname, '../__mocks__/fixtures/dir2') + '/';

    describe('with a collapsed root', () => {
      /*
       * Start with a simple structure that looks like the following:
       *
       *   → fixtures
       */
      describe('via _collapseSelection (left arrow)', () => {
        it('does not modify the selection if the root is selected', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, rootKey));
          expect(isSelected(rootKey, rootKey)).toEqual(true);
          store.dispatch(Actions.collapseSelection());

          // root was expanded, selection shouldn't change
          expect(isSelected(rootKey, rootKey)).toEqual(true);
        });
      });
    });

    describe('with single nesting', () => {
      beforeEach(async () => {
        /*
         * ༼ つ ◕_◕ ༽つ
         * Start with an expanded and fetched state that looks like the following:
         *
         *   ↓ fixtures
         *     → dir1
         *     → dir2
         */
        store.dispatch(Actions.expandNode(rootKey, rootKey));
        // Populate real files from real disk like real people.
        await EpicHelpers.fetchChildKeys(store, rootKey);
      });

      describe('via _collapseSelection (left arrow) nested', () => {
        it('selects the parent if the selected node is a collapsed directory', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, dir2Key));
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
          store.dispatch(Actions.collapseSelection());

          // the root is dir2's parent
          expect(isSelected(rootKey, rootKey)).toEqual(true);
        });

        it('does not modify the selection if selected node is an expanded directory', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, rootKey));
          expect(isSelected(rootKey, rootKey)).toEqual(true);
          store.dispatch(Actions.collapseSelection());

          // root was expanded, selection shouldn't change
          expect(isSelected(rootKey, rootKey)).toEqual(true);
        });
      });

      describe('via _moveDown', () => {
        it('selects the first root if there is no selection', () => {
          expect(Selectors.getSingleSelectedNode(store.getState())).toBeNull();
          store.dispatch(Actions.moveSelectionDown());
          expect(isSelected(rootKey, rootKey)).toEqual(true);
        });

        it('does nothing if the bottommost node is selected', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, dir2Key));
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
          store.dispatch(Actions.moveSelectionDown());
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
        });

        it('selects first child if parent is selected', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, rootKey));
          expect(isSelected(rootKey, rootKey)).toEqual(true);
          store.dispatch(Actions.moveSelectionDown());

          // dir1 is the first child, should get selected
          expect(isSelected(rootKey, dir0key)).toEqual(true);
        });

        it('selects the next sibling when one exists', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, dir1Key));
          expect(isSelected(rootKey, dir1Key)).toEqual(true);
          store.dispatch(Actions.moveSelectionDown());

          // dir2 is the next sibling, should get selected
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
        });
      });

      describe('via _moveUp', () => {
        it('selects the lowermost descendant if there is no selection', () => {
          expect(Selectors.getSingleSelectedNode(store.getState())).toBeNull();
          store.dispatch(Actions.moveSelectionUp());
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
        });

        it('does nothing if the topmost root node is selected', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, rootKey));
          expect(isSelected(rootKey, rootKey)).toEqual(true);
          store.dispatch(Actions.moveSelectionUp());
          expect(isSelected(rootKey, rootKey)).toEqual(true);
        });

        it('selects parent if first child is selected', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, dir0key));
          expect(isSelected(rootKey, dir0key)).toEqual(true);
          store.dispatch(Actions.moveSelectionUp());

          // dir1 is the first child, parent (root) should get selected
          expect(isSelected(rootKey, rootKey)).toEqual(true);
        });

        it('selects the previous sibling if one exists', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, dir2Key));
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
          store.dispatch(Actions.moveSelectionUp());

          // dir2 is the second child, previous sibling (dir1) should be selected
          expect(isSelected(rootKey, dir1Key)).toEqual(true);
        });

        it('selects the root after deselecting via collapsing', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, dir2Key));
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
          store.dispatch(Actions.collapseNode(rootKey, rootKey));
          expect(isSelected(rootKey, dir2Key)).toEqual(false);
          store.dispatch(Actions.moveSelectionUp());

          expect(isSelected(rootKey, rootKey)).toEqual(true);
        });
      });
    });

    describe('with double+ nesting', () => {
      beforeEach(async () => {
        /*
           * ¯\_(ツ)_/���
           * Expand to a view like the following:
           *
           *   ↓ fixtures
           *     ↓ dir1
           *       · foo.txt
           *     → dir2
           */
        store.dispatch(Actions.expandNode(rootKey, rootKey));
        await EpicHelpers.fetchChildKeys(store, rootKey);
        store.dispatch(Actions.expandNode(rootKey, dir1Key));
        await EpicHelpers.fetchChildKeys(store, dir1Key);
      });

      describe('via _collapseAll ( cmd+{ )', () => {
        it('collapses all visible nodes', () => {
          store.dispatch(Actions.collapseAll());
          expect(isExpanded(rootKey, rootKey)).toBe(false);
          expect(isExpanded(rootKey, dir1Key)).toBe(false);
        });
      });

      describe('via _collapseSelection (left arrow) nested double+', () => {
        it('selects the parent if the selected node is a file', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, fooTxtKey));
          expect(isSelected(rootKey, fooTxtKey)).toEqual(true);
          store.dispatch(Actions.collapseSelection());

          // dir1 is foo.txt's parent
          expect(isSelected(rootKey, dir1Key)).toEqual(true);
        });
      });

      describe('via _moveDown nested double+', () => {
        it('selects the previous nested descendant when one exists', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, fooTxtKey));
          expect(isSelected(rootKey, fooTxtKey)).toEqual(true);
          store.dispatch(Actions.moveSelectionDown());

          // foo.txt is the previous visible descendant to dir2
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
        });
      });

      describe('via _moveUp nested double+', () => {
        it('selects the previous nested descendant when one exists', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, dir2Key));
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
          store.dispatch(Actions.moveSelectionUp());

          // foo.txt is the previous visible descendant to dir2
          expect(isSelected(rootKey, fooTxtKey)).toEqual(true);
        });
      });

      describe('via _moveToTop', () => {
        it('selects the root', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, dir2Key));
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
          store.dispatch(Actions.moveSelectionToTop());

          // the root is the topmost node
          expect(isSelected(rootKey, rootKey)).toEqual(true);
        });
      });

      describe('via _moveToBottom', () => {
        it('selects the bottommost node', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, rootKey));
          expect(isSelected(rootKey, rootKey)).toEqual(true);
          store.dispatch(Actions.moveSelectionToBottom());

          // dir2 is the bottommost node
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
        });
      });
    });

    describe('with an expanded + loading directory', () => {
      beforeEach(async () => {
        /*
           * Expand to a view like the following with a loading (indicated by ↻) dir1:
           *
           *   ↓ fixtures
           *     ↻ dir1
           *     → dir2
           */
        store.dispatch(Actions.expandNode(rootKey, rootKey));
        await EpicHelpers.fetchChildKeys(store, rootKey);
        // Mimic the loading state where `dir1` reports itself as expanded but has no children
        // yet. Don't use `actions.expandNode` because it causes a re-render, which queues a real
        // fetch and might populate the children of `dir1`. We don't want that.
        store.dispatch(
          Actions.setRoots(
            updateNodeAtRoot(
              Selectors.getRoots(store.getState()),
              rootKey,
              dir1Key,
              node => node.set({isLoading: true, isExpanded: true}),
            ),
          ),
        );
      });

      describe('via _moveDown expanded + loading', () => {
        it('selects the next sibling', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, dir1Key));
          expect(isSelected(rootKey, dir1Key)).toEqual(true);
          store.dispatch(Actions.moveSelectionDown());
          // dir2 is dir1's next sibling
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
        });
      });

      describe('via _moveUp expanded + loading', () => {
        it('selects the previous sibling', () => {
          store.dispatch(Actions.setSelectedNode(rootKey, dir2Key));
          expect(isSelected(rootKey, dir2Key)).toEqual(true);
          store.dispatch(Actions.moveSelectionUp());

          // dir1 is dir2's previous sibling
          expect(isSelected(rootKey, dir1Key)).toEqual(true);
        });
      });
    });
  });

  describe('multi-selection and range-selection', () => {
    const rootKey = nuclideUri.join(__dirname, '../__mocks__/fixtures') + '/';
    const dir0 = nuclideUri.join(__dirname, '../__mocks__/fixtures/dir0') + '/';
    const bar =
      nuclideUri.join(__dirname, '../__mocks__/fixtures/dir0/bar') + '/';
    const bar1 = nuclideUri.join(
      __dirname,
      '../__mocks__/fixtures/dir0/bar/bar1',
    );
    const bar2 = nuclideUri.join(
      __dirname,
      '../__mocks__/fixtures/dir0/bar/bar2',
    );
    const bar3 = nuclideUri.join(
      __dirname,
      '../__mocks__/fixtures/dir0/bar/bar3',
    );
    const foo =
      nuclideUri.join(__dirname, '../__mocks__/fixtures/dir0/foo') + '/';
    const foo1 = nuclideUri.join(
      __dirname,
      '../__mocks__/fixtures/dir0/foo/foo1',
    );
    const foo2 = nuclideUri.join(
      __dirname,
      '../__mocks__/fixtures/dir0/foo/foo2',
    );
    const foo3 = nuclideUri.join(
      __dirname,
      '../__mocks__/fixtures/dir0/foo/foo3',
    );
    const afile = nuclideUri.join(
      __dirname,
      '../__mocks__/fixtures/dir0/afile',
    );
    const bfile = nuclideUri.join(
      __dirname,
      '../__mocks__/fixtures/dir0/bfile',
    );
    const zfile = nuclideUri.join(
      __dirname,
      '../__mocks__/fixtures/dir0/zfile',
    );

    beforeEach(async () => {
      // Await **internal-only** API because the public `expandNodeDeep` API does not
      // return the promise that can be awaited on
      await EpicHelpers.expandNodeDeep(store, rootKey, rootKey);
    });

    it('selects multiple items', () => {
      store.dispatch(Actions.addSelectedNode(rootKey, rootKey));
      store.dispatch(Actions.addSelectedNode(rootKey, dir0));
      store.dispatch(Actions.addSelectedNode(rootKey, bar1));
      expect(isSelected(rootKey, rootKey)).toBe(true);
      expect(isSelected(rootKey, dir0)).toBe(true);
      expect(isSelected(rootKey, bar1)).toBe(true);
      expect(numSelected()).toBe(3);
      store.dispatch(Actions.setSelectedNode(rootKey, bar));
      expect(isSelected(rootKey, bar)).toBe(true);
      expect(numSelected()).toBe(1);
    });

    it('selects a range of items', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar2));
      expect(isSelected(rootKey, bar2)).toBe(true);
      expect(isSelected(rootKey, bar3)).toBe(true);
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(numSelected()).toBe(4);
    });

    it('selects multiple range of items', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar2));
      store.dispatch(Actions.addSelectedNode(rootKey, foo3));
      store.dispatch(Actions.rangeSelectToNode(rootKey, afile));
      expect(isSelected(rootKey, bar2)).toBe(true);
      expect(isSelected(rootKey, bar3)).toBe(true);
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(isSelected(rootKey, foo3)).toBe(true);
      expect(isSelected(rootKey, afile)).toBe(true);
      expect(numSelected()).toBe(6);
    });

    it('selects range in opposite directions', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar2));
      expect(isSelected(rootKey, bar2)).toBe(true);
      expect(isSelected(rootKey, bar3)).toBe(true);
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(numSelected()).toBe(4);
      store.dispatch(Actions.rangeSelectToNode(rootKey, afile));
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(isSelected(rootKey, foo2)).toBe(true);
      expect(isSelected(rootKey, foo3)).toBe(true);
      expect(isSelected(rootKey, afile)).toBe(true);
      expect(numSelected()).toBe(4);
    });

    it('handles overlap ranges', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar2));
      store.dispatch(Actions.addSelectedNode(rootKey, bar1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, afile));
      expect(isSelected(rootKey, bar1)).toBe(true);
      expect(isSelected(rootKey, bar2)).toBe(true);
      expect(isSelected(rootKey, bar3)).toBe(true);
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(isSelected(rootKey, foo2)).toBe(true);
      expect(isSelected(rootKey, foo3)).toBe(true);
      expect(isSelected(rootKey, afile)).toBe(true);
      expect(numSelected()).toBe(8);
    });

    it('support shift up and shift down', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectUp());
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(numSelected()).toBe(2);
      store.dispatch(Actions.rangeSelectDown());
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(numSelected()).toBe(1);
      store.dispatch(Actions.rangeSelectDown());
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(isSelected(rootKey, foo2)).toBe(true);
      expect(numSelected()).toBe(2);
      store.dispatch(Actions.rangeSelectDown());
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(isSelected(rootKey, foo2)).toBe(true);
      expect(isSelected(rootKey, foo3)).toBe(true);
      expect(numSelected()).toBe(3);
    });

    it('merges range for shift up and down', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, bar2));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar3));
      store.dispatch(Actions.addSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectUp());
      store.dispatch(Actions.rangeSelectUp());
      expect(isSelected(rootKey, bar1)).toBe(true);
      expect(isSelected(rootKey, bar2)).toBe(true);
      expect(isSelected(rootKey, bar3)).toBe(true);
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(numSelected()).toBe(5);
    });

    it('handles unselected anchor', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar2));
      store.dispatch(Actions.unselectNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar1));
      expect(isSelected(rootKey, bar1)).toBe(true);
      expect(isSelected(rootKey, bar2)).toBe(true);
      expect(isSelected(rootKey, bar3)).toBe(true);
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(numSelected()).toBe(4);
    });

    it('handles unselected range', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar2));
      store.dispatch(Actions.unselectNode(rootKey, bar2));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar1));
      expect(isSelected(rootKey, bar1)).toBe(true);
      expect(isSelected(rootKey, bar2)).toBe(true);
      expect(isSelected(rootKey, bar3)).toBe(true);
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(numSelected()).toBe(5);
      store.dispatch(Actions.rangeSelectDown());
      expect(isSelected(rootKey, bar1)).toBe(false);
      expect(numSelected()).toBe(4);
    });

    it('handles unselected node within the range', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar2));
      store.dispatch(Actions.unselectNode(rootKey, bar3));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar1));
      expect(isSelected(rootKey, bar1)).toBe(true);
      expect(isSelected(rootKey, bar2)).toBe(true);
      expect(isSelected(rootKey, bar3)).toBe(false);
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(numSelected()).toBe(4);
      store.dispatch(Actions.rangeSelectToNode(rootKey, foo2));
      expect(isSelected(rootKey, foo1)).toBe(true);
      expect(isSelected(rootKey, foo2)).toBe(true);
      expect(numSelected()).toBe(2);
    });

    it('does nothing when all nodes are unselected', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar2));
      store.dispatch(Actions.unselectNode(rootKey, bar2));
      store.dispatch(Actions.unselectNode(rootKey, bar3));
      store.dispatch(Actions.unselectNode(rootKey, foo));
      store.dispatch(Actions.unselectNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar1));
      expect(numSelected()).toBe(0);
    });

    it('can handle part of the selected range been collaped', () => {
      store.dispatch(Actions.setSelectedNode(rootKey, foo1));
      store.dispatch(Actions.rangeSelectToNode(rootKey, bar2));
      store.dispatch(Actions.collapseNode(rootKey, foo));
      expect(isSelected(rootKey, bar2)).toBe(true);
      expect(isSelected(rootKey, bar3)).toBe(true);
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(numSelected()).toBe(3);
      store.dispatch(Actions.rangeSelectToNode(rootKey, bfile));
      expect(isSelected(rootKey, foo)).toBe(true);
      expect(isSelected(rootKey, afile)).toBe(true);
      expect(isSelected(rootKey, bfile)).toBe(true);
      expect(numSelected()).toBe(3);
    });

    it('supports workingset', () => {
      store.dispatch(
        Actions.updateWorkingSet(new WorkingSet([bar2, foo, zfile])),
      );
      store.dispatch(Actions.setSelectedNode(rootKey, foo3));
      store.dispatch(Actions.rangeSelectToNode(rootKey, zfile));
      expect(isSelected(rootKey, foo3)).toBe(true);
      expect(isSelected(rootKey, zfile)).toBe(true);
      expect(numSelected()).toBe(2);
      store.dispatch(Actions.rangeSelectUp());
      expect(isSelected(rootKey, foo3)).toBe(true);
      expect(numSelected()).toBe(1);
    });
  });
});
