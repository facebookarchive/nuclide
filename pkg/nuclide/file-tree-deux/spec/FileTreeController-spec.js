'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeActions = require('../lib/FileTreeActions');
var FileTreeController = require('../lib/FileTreeController');
var FileTreeStore = require('../lib/FileTreeStore');
var React = require('react-for-atom');

const pathModule = require('path');

describe('FileTreeController', () => {
  const actions = FileTreeActions.getInstance();
  const store = FileTreeStore.getInstance();

  let controller: ?FileTreeController;
  let workspaceElement;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    // Attach the workspace to the DOM so focus can be determined in tests below.
    jasmine.attachToDOM(workspaceElement);
    controller = new FileTreeController(null);

    // The controller uses the currently active file to decide when and what to reveal in the file
    // tree when revealActiveFile is called. Importantly, it also short-circuits in some cases if
    // the path is null or undefined. Here we mock it out so that we get normal behavior in our
    // tests.
    spyOn(atom.workspace, 'getActiveTextEditor').andReturn({
      getBuffer() {
        return {
          file: {
            getPath() {
              return 'foo';
            },
          },
        };
      },
    });
  });

  afterEach(() => {
    controller.destroy();
    store.reset();
  });

  describe('revealActiveFile', () => {
    beforeEach(() => {
      // Ensure the file tree's panel is hidden at first.
      controller.toggleVisibility();
      expect(controller._isVisible).toBe(false);
    });

    it('shows/unhides the controller\'s panel', () => {
      controller.revealActiveFile();
      expect(controller._isVisible).toBe(true);
    });

    it('does not show the panel if showIfHidden is false', () => {
      controller.revealActiveFile(/* showIfHidden */ false);
      expect(controller._isVisible).toBe(false);
    });
  });

  describe('toggleVisibility', () => {
    it('focuses the file tree element when going from hidden to visible', () => {
      var domNode = React.findDOMNode(controller._fileTreePanel.getFileTree());
      controller.toggleVisibility();
      expect(domNode).not.toMatchSelector(':focus');
      controller.toggleVisibility();
      expect(domNode).toMatchSelector(':focus');
    });

    it('blurs the file tree element when going from visible to hidden', () => {
      var domNode = React.findDOMNode(controller._fileTreePanel.getFileTree());
      controller.focusTree();
      expect(domNode).toMatchSelector(':focus');
      controller.toggleVisibility();
      expect(domNode).not.toMatchSelector(':focus');
    });
  });

  describe('focusTree', () => {
    it('focuses the expected element', () => {
      var domNode = React.findDOMNode(controller._fileTreePanel.getFileTree());
      expect(domNode).not.toMatchSelector(':focus');
      controller.focusTree();
      expect(domNode).toMatchSelector(':focus');
    });
  });

  describe('blurTree', () => {
    it('sends focus to the workspace element to match Atom\'s tree-view API', () => {
      var domNode = React.findDOMNode(controller._fileTreePanel.getFileTree());
      controller.focusTree();
      expect(domNode).toMatchSelector(':focus');
      controller.blurTree();
      expect(atom.views.getView(atom.workspace.getActivePane())).toMatchSelector(':focus');
    });
  });

  describe('serialize', () => {
    it('returns an object with valid values', () => {
      var serializedControllerData = controller.serialize();
      expect(serializedControllerData.panel).toEqual({
        isVisible: true,
        width: FileTreeController.INITIAL_WIDTH,
      });
      expect(typeof serializedControllerData.panel).toBe('object');
    });
  });

  describe('_moveUp', () => {
    const rootKey = pathModule.join(__dirname, 'fixtures') + '/';
    const dir1Key = pathModule.join(__dirname, 'fixtures/dir1') + '/';
    const fooTxtKey = pathModule.join(__dirname, 'fixtures/dir1/foo.txt');
    const dir2Key = pathModule.join(__dirname, 'fixtures/dir2') + '/';

    beforeEach(() => {
      /*
       * ༼ つ ◕_◕ ༽つ
       * Start with an expanded and fetched state that looks like the following:
       *
       *   ↓ fixtures
       *     → dir1
       *     → dir2
       */
      waitsForPromise(async () => {
        actions.expandNode(rootKey, rootKey);
        // Populate real files from real disk like real people.
        await store._fetchChildKeys(rootKey);
      });
    });

    it('does nothing if the topmost root node is selected', () => {
      actions.selectSingleNode(rootKey, rootKey);
      expect(store.isSelected(rootKey, rootKey)).toEqual(true);
      controller._moveUp();
      expect(store.isSelected(rootKey, rootKey)).toEqual(true);
    });

    it('selects parent if first child is selected', () => {
      actions.selectSingleNode(rootKey, dir1Key);
      expect(store.isSelected(rootKey, dir1Key)).toEqual(true);
      controller._moveUp();

      // dir1 is the first child, parent (root) should get selected
      expect(store.isSelected(rootKey, rootKey)).toEqual(true);
    });

    it('selects the previous sibling if one exists', () => {
      actions.selectSingleNode(rootKey, dir2Key);
      expect(store.isSelected(rootKey, dir2Key)).toEqual(true);
      controller._moveUp();

      // dir2 is the second child, previous sibling (dir1) should be selected
      expect(store.isSelected(rootKey, dir1Key)).toEqual(true);
    });

    it('selects the previous nested descendant if one exists', () => {
      waitsForPromise(async () => {
        /*
         * ¯\_(ツ)_/¯
         * Create an expanded view like the following:
         *
         *   ↓ fixtures
         *     ↓ dir1
         *       · foo.txt
         *     → dir2
         */
        actions.expandNode(rootKey, dir1Key);
        await store._fetchChildKeys(dir1Key);

        actions.selectSingleNode(rootKey, dir2Key);
        expect(store.isSelected(rootKey, dir2Key)).toEqual(true);
        controller._moveUp();

        // foo.txt is the previous visible descendant to dir2
        expect(store.isSelected(rootKey, fooTxtKey)).toEqual(true);
      });
    });
  });
});
