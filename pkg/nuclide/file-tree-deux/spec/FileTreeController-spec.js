'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeController = require('../lib/FileTreeController');
var React = require('react-for-atom');

describe('FileTreeController', () => {
  var controller: FileTreeController;
  var workspaceElement;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    // Attach the workspace to the DOM so focus can be determined in tests below.
    jasmine.attachToDOM(workspaceElement);
    controller = new FileTreeController(null);
  });

  afterEach(() => {
    controller.destroy();
  });

  describe('revealActiveFile', () => {
    it('shows/unhides the controller\'s panel', () => {
      // Ensure the file tree's panel is hidden at first.
      controller.toggleVisibility();
      expect(controller._isVisible).toBe(false);

      controller.revealActiveFile();
      expect(controller._isVisible).toBe(true);
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
});
