'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import {FileTreeNode} from '../lib/FileTreeNode';
import Immutable from 'immutable';
import {WorkingSet} from '../../nuclide-working-sets';


const CONF = {
  vcsStatuses: {},
  workingSet: new WorkingSet(),
  editedWorkingSet: new WorkingSet(),
  hideIgnoredNames: true,
  excludeVcsIgnoredPaths: true,
  ignoredPatterns: new Immutable.Set(),
  repositories: new Immutable.Set(),
  usePreviewTabs: true,
  isEditingWorkingSet: false,
  openFilesWorkingSet: new WorkingSet(),
  reposByRoot: {},
};


describe('FileTreeNode', () => {
  it('properly sets the default properties', () => {
    const node = new FileTreeNode({
      uri: '/abc/def',
      rootUri: '/abc/',
    }, CONF);

    expect(node.uri).toBe('/abc/def');
    expect(node.rootUri).toBe('/abc/');
    expect(node.isExpanded).toBe(false);
    expect(node.isSelected).toBe(false);
    expect(node.isLoading).toBe(false);
    expect(node.isCwd).toBe(false);
    expect(node.isTracked).toBe(false);
    expect(node.children.isEmpty()).toBe(true);
    expect(node.highlightedText).toEqual('');
    expect(node.matchesFilter).toBeTruthy();
  });

  it('properly sets the supplied properties', () => {
    const children = new Immutable.OrderedMap();
    const node = new FileTreeNode({
      uri: '/abc/def',
      rootUri: '/abc/',
      isExpanded: true,
      isSelected: true,
      isLoading: true,
      isCwd: true,
      isTracked: true,
      children,
    }, CONF);

    expect(node.uri).toBe('/abc/def');
    expect(node.rootUri).toBe('/abc/');
    expect(node.isExpanded).toBe(true);
    expect(node.isSelected).toBe(true);
    expect(node.isLoading).toBe(true);
    expect(node.isCwd).toBe(true);
    expect(node.isTracked).toBe(true);
    expect(node.children).toBe(children);
    expect(node.highlightedText).toEqual('');
    expect(node.matchesFilter).toBeTruthy();
  });

  it('derives properties', () => {
    const node = new FileTreeNode({
      uri: '/abc/def/ghi',
      rootUri: '/abc/',
    }, CONF);

    // Derived
    expect(node.name).toBe('ghi');
    expect(node.hashKey).toBeTruthy();
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
    const child1 = new FileTreeNode({
      uri: '/abc/def/ghi1',
      rootUri: '/abc/',
    }, CONF);

    const child2 = new FileTreeNode({
      uri: '/abc/def/ghi2',
      rootUri: '/abc/',
    }, CONF);

    const children = new Immutable.OrderedMap([
      [child1.name, child1],
      [child2.name, child2],
    ]);
    const node = new FileTreeNode({
      uri: '/abc/def',
      rootUri: '/abc/',
      isExpanded: true,
      isSelected: false,
      isLoading: false,
      isCwd: true,
      isTracked: false,
      children,
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
    updatedNode = node.setIsTracked(false);
    expect(updatedNode).toBe(node);
    updatedNode = node.setChildren(new Immutable.OrderedMap(children));
    expect(updatedNode).toBe(node);
    updatedNode = node.setRecursive(null, child => child.setIsSelected(false));
    expect(updatedNode).toBe(node);
    updatedNode = node.updateChild(child1.setIsSelected(false));
    expect(updatedNode).toBe(node);
    updatedNode = node.set({
      isExpanded: true,
      isSelected: false,
      isLoading: false,
      isCwd: true,
      isTracked: false,
      children,
    });
    expect(updatedNode).toBe(node);

    updatedNode = node.updateChild(child2.setIsSelected(true));
    expect(updatedNode).not.toBe(node);
  });
});
