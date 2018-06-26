'use strict';

var _FileTreeActions;

function _load_FileTreeActions() {
  return _FileTreeActions = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = _interopRequireDefault(require('../lib/FileTreeStore'));
}

var _FileTreeNode;

function _load_FileTreeNode() {
  return _FileTreeNode = require('../lib/FileTreeNode');
}

var _FileTreeEntryComponent;

function _load_FileTreeEntryComponent() {
  return _FileTreeEntryComponent = require('../components/FileTreeEntryComponent');
}

var _nuclideWorkingSetsCommon;

function _load_nuclideWorkingSetsCommon() {
  return _nuclideWorkingSetsCommon = require('../../nuclide-working-sets-common');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _testUtils;

function _load_testUtils() {
  return _testUtils = _interopRequireDefault(require('react-dom/test-utils'));
}

var _FileTreeSelectionManager;

function _load_FileTreeSelectionManager() {
  return _FileTreeSelectionManager = require('../lib/FileTreeSelectionManager');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/* global Element */

function renderEntryComponentIntoDocument(componentKlass, store, actions, props = {}, conf = {}) {
  const selectionManager = new (_FileTreeSelectionManager || _load_FileTreeSelectionManager()).FileTreeSelectionManager(() => {});
  const nodeProps = Object.assign({
    isExpanded: false,
    isLoading: false,
    isSelected: false,
    isCwd: false
  }, props);

  const nodeConf = Object.assign({
    vcsStatuses: (_immutable || _load_immutable()).Map(),
    workingSet: new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(),
    editedWorkingSet: new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(),
    hideIgnoredNames: true,
    excludeVcsIgnoredPaths: true,
    ignoredPatterns: (_immutable || _load_immutable()).Set(),
    repositories: (_immutable || _load_immutable()).Set(),
    usePreviewTabs: true,
    focusEditorOnFileSelection: false,
    isEditingWorkingSet: false,
    openFilesWorkingSet: new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(),
    reposByRoot: {},
    selectionManager
  }, conf);

  const node = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode(nodeProps, nodeConf);
  return (_testUtils || _load_testUtils()).default.renderIntoDocument(_react.createElement(componentKlass, {
    store,
    actions,
    node,
    selectedNodes: selectionManager.selectedNodes(),
    focusedNodes: selectionManager.focusedNodes()
  }));
}

describe('Directory FileTreeEntryComponent', () => {
  const store = new (_FileTreeStore || _load_FileTreeStore()).default();
  const actions = new (_FileTreeActions || _load_FileTreeActions()).default(store);

  describe('when expanding/collapsing dir component', () => {
    beforeEach(() => {
      spyOn(actions, 'expandNode');
    });

    it('expands on click when node is selected', () => {
      const nodeComponent = renderEntryComponentIntoDocument((_FileTreeEntryComponent || _load_FileTreeEntryComponent()).FileTreeEntryComponent, store, actions, {
        rootUri: '/a/',
        uri: '/a/b/',
        isSelected: true,
        isContainer: true
      });

      // The onClick is listened not by the <li> element, but by its first child.
      // $FlowFixMe
      const domNode = _reactDom.default.findDOMNode(nodeComponent).children[0];
      (_testUtils || _load_testUtils()).default.Simulate.click(domNode);
      expect(actions.expandNode).toHaveBeenCalled();
    });
  });
});

describe('File FileTreeEntryComponent', () => {
  const store = new (_FileTreeStore || _load_FileTreeStore()).default();
  const actions = new (_FileTreeActions || _load_FileTreeActions()).default(store);

  describe('when expanding/collapsing file component', () => {
    beforeEach(() => {
      spyOn(actions, 'expandNode');
    });

    it('does not expand on click when node is selected', () => {
      const nodeComponent = renderEntryComponentIntoDocument((_FileTreeEntryComponent || _load_FileTreeEntryComponent()).FileTreeEntryComponent, store, actions, {
        rootUri: '/a/',
        uri: '/a/b',
        isSelected: true,
        isContainer: false
      });
      const domNode = _reactDom.default.findDOMNode(nodeComponent);

      if (!(domNode instanceof Element)) {
        throw new Error('Invariant violation: "domNode instanceof Element"');
      }

      (_testUtils || _load_testUtils()).default.Simulate.click(domNode);
      expect(actions.expandNode).not.toHaveBeenCalled();
    });
  });

  describe('when preview tabs are enabled', () => {
    beforeEach(() => {
      spyOn(actions, 'confirmNode');
    });

    it('opens a file if a selected node is clicked', () => {
      const nodeComponent = renderEntryComponentIntoDocument((_FileTreeEntryComponent || _load_FileTreeEntryComponent()).FileTreeEntryComponent, store, actions, {
        rootUri: '/a/',
        uri: '/a/b',
        isSelected: true,
        isContainer: false,
        usePreviewTabs: true
      });
      const domNode = _reactDom.default.findDOMNode(nodeComponent);

      if (!(domNode instanceof Element)) {
        throw new Error('Invariant violation: "domNode instanceof Element"');
      }

      (_testUtils || _load_testUtils()).default.Simulate.click(domNode);
      expect(actions.confirmNode).toHaveBeenCalled();
    });
  });
});