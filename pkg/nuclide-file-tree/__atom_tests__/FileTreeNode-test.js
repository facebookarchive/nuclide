'use strict';

var _FileTreeNode;

function _load_FileTreeNode() {
  return _FileTreeNode = require('../lib/FileTreeNode');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _nuclideWorkingSetsCommon;

function _load_nuclideWorkingSetsCommon() {
  return _nuclideWorkingSetsCommon = require('../../nuclide-working-sets-common');
}

var _FileTreeSelectionManager;

function _load_FileTreeSelectionManager() {
  return _FileTreeSelectionManager = require('../lib/FileTreeSelectionManager');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

const CONF = {
  vcsStatuses: (_immutable || _load_immutable()).Map(),
  fileChanges: (_immutable || _load_immutable()).Map(),
  workingSet: new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(),
  editedWorkingSet: new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(),
  hideIgnoredNames: true,
  hideVcsIgnoredPaths: true,
  excludeVcsIgnoredPaths: true,
  ignoredPatterns: (_immutable || _load_immutable()).Set(),
  repositories: (_immutable || _load_immutable()).Set(),
  usePreviewTabs: true,
  focusEditorOnFileSelection: false,
  isEditingWorkingSet: false,
  openFilesWorkingSet: new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(),
  reposByRoot: {},
  selectionManager: new (_FileTreeSelectionManager || _load_FileTreeSelectionManager()).FileTreeSelectionManager(() => {})
};

describe('FileTreeNode', () => {
  it('properly sets the default properties', () => {
    const node = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({
      uri: '/abc/def',
      rootUri: '/abc/'
    }, CONF);

    expect(node.uri).toBe('/abc/def');
    expect(node.rootUri).toBe('/abc/');
    expect(node.isExpanded).toBe(false);
    expect(node.isSelected()).toBe(false);
    expect(node.isLoading).toBe(false);
    expect(node.isCwd).toBe(false);
    expect(node.children.isEmpty()).toBe(true);
    expect(node.highlightedText).toEqual('');
    expect(node.matchesFilter).toBeTruthy();
  });

  it('properly sets the supplied properties', () => {
    const children = (_immutable || _load_immutable()).OrderedMap();
    const node = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({
      uri: '/abc/def',
      rootUri: '/abc/',
      isExpanded: true,
      isSelected: true,
      isLoading: true,
      isCwd: true,
      children
    }, CONF);

    expect(node.uri).toBe('/abc/def');
    expect(node.rootUri).toBe('/abc/');
    expect(node.isExpanded).toBe(true);
    expect(node.isSelected()).toBe(true);
    expect(node.isLoading).toBe(true);
    expect(node.isCwd).toBe(true);
    expect(node.children).toBe(children);
    expect(node.highlightedText).toEqual('');
    expect(node.matchesFilter).toBeTruthy();
  });

  it('derives properties', () => {
    const node = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({
      uri: '/abc/def/ghi',
      rootUri: '/abc/'
    }, CONF);

    // Derived
    expect(node.name).toBe('ghi');
    expect(node.relativePath).toBe('def/ghi');
    expect(node.localPath).toBe('/abc/def/ghi');
    expect(node.isContainer).toBe(false);
    expect(node.shouldBeShown).toBe(true);
    expect(node.checkedStatus).toBe('clear');
    expect(node.shouldBeSoftened).toBe(false);
    expect(node.highlightedText).toEqual('');
    expect(node.matchesFilter).toBeTruthy();
  });

  it('preserves instance on non-modifying updates', () => {
    const child1 = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({
      uri: '/abc/def/ghi1',
      rootUri: '/abc/'
    }, CONF);

    const child2 = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({
      uri: '/abc/def/ghi2',
      rootUri: '/abc/'
    }, CONF);

    const children = (_immutable || _load_immutable()).OrderedMap([[child1.name, child1], [child2.name, child2]]);
    const node = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({
      uri: '/abc/def',
      rootUri: '/abc/',
      isExpanded: true,
      isSelected: false,
      isLoading: false,
      isCwd: true,
      children
    }, CONF);

    expect(node.isExpanded).toBe(true);
    let updatedNode = node.setIsExpanded(true);
    expect(updatedNode).toBe(node);
    updatedNode = node.setIsSelected(false);
    expect(updatedNode).toBe(node);
    updatedNode = node.setIsLoading(false);
    expect(updatedNode).toBe(node);
    updatedNode = node.setIsCwd(true);
    expect(updatedNode).toBe(node);
    updatedNode = node.setChildren((_immutable || _load_immutable()).OrderedMap(children));
    expect(updatedNode).toBe(node);
    updatedNode = node.setRecursive(null, child => child.setIsSelected(false));
    expect(updatedNode).toBe(node);
    updatedNode = node.updateChild(child1.setIsSelected(false));
    expect(updatedNode).toBe(node);
    updatedNode = node.set({
      isExpanded: true,
      isLoading: false,
      isCwd: true,
      children
    });
    expect(updatedNode).toBe(node);

    updatedNode = node.updateChild(child2.setIsSelected(true));
    expect(updatedNode).toBe(node);
  });

  it('finds nodes', () => {
    const rootUri = '/r/';
    const nodeABC = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({ uri: '/r/A/B/C/', rootUri }, CONF);
    const nodeABD = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({ uri: '/r/A/B/D/', rootUri }, CONF);
    let children = (_FileTreeNode || _load_FileTreeNode()).FileTreeNode.childrenFromArray([nodeABC, nodeABD]);
    const nodeAB = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({ uri: '/r/A/B/', rootUri, children }, CONF);
    children = (_FileTreeNode || _load_FileTreeNode()).FileTreeNode.childrenFromArray([nodeAB]);
    const nodeA = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({ uri: '/r/A/', rootUri, children }, CONF);
    const nodeB = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({ uri: '/r/B/', rootUri }, CONF);
    children = (_FileTreeNode || _load_FileTreeNode()).FileTreeNode.childrenFromArray([nodeA, nodeB]);
    const root = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({ uri: '/r/', rootUri, children }, CONF);

    expect(root.find('/r/')).toBe(root);
    expect(root.find('/r/A/')).toBe(nodeA);
    expect(root.find('/r/B/')).toBe(nodeB);
    expect(root.find('/r/A/B/')).toBe(nodeAB);
    expect(root.find('/r/A/B/C/')).toBe(nodeABC);
    expect(root.find('/r/A/B/D/')).toBe(nodeABD);

    expect(root.findDeepest('/r/A/B/E/')).toBe(nodeAB);
    expect(root.findDeepest('/r/A/B/C/E/')).toBe(nodeABC);
    expect(root.findDeepest('/r/B/B/C/E/')).toBe(nodeB);
    expect(root.findDeepest('/r/C/B/C/E/')).toBe(root);

    expect(root.find('/r/A/B/E/')).toBe(null);
    expect(root.findDeepest('/nonRoot/C/B/C/E/')).toBe(null);
  });
});