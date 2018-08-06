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
/* global Element */

import {ActionTypes} from '../lib/FileTreeDispatcher';
import FileTreeStore from '../lib/FileTreeStore';
import {FileTreeNode} from '../lib/FileTreeNode';
import {FileTreeEntryComponent} from '../components/FileTreeEntryComponent';
import {WorkingSet} from '../../nuclide-working-sets-common';
import * as Actions from '../lib/redux/Actions';
import invariant from 'assert';
import * as Immutable from 'immutable';
import * as React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import {FileTreeSelectionManager} from '../lib/FileTreeSelectionManager';
import createStore from '../redux/createStore';

function renderEntryComponentIntoDocument(
  componentKlass: Object,
  store,
  props: Object = {},
  conf: Object = {},
): React.Component<any, any> {
  const selectionManager = new FileTreeSelectionManager(() => {});
  const nodeProps = {
    isExpanded: false,
    isLoading: false,
    isSelected: false,
    isCwd: false,
    ...props,
  };

  const nodeConf = {
    vcsStatuses: Immutable.Map(),
    workingSet: new WorkingSet(),
    editedWorkingSet: new WorkingSet(),
    hideIgnoredNames: true,
    excludeVcsIgnoredPaths: true,
    ignoredPatterns: Immutable.Set(),
    repositories: Immutable.Set(),
    usePreviewTabs: true,
    focusEditorOnFileSelection: false,
    isEditingWorkingSet: false,
    openFilesWorkingSet: new WorkingSet(),
    reposByRoot: {},
    selectionManager,
    ...conf,
  };

  const node = new FileTreeNode(nodeProps, nodeConf);
  return TestUtils.renderIntoDocument(
    React.createElement(componentKlass, {
      store,
      node,
      selectedNodes: selectionManager.selectedNodes(),
      focusedNodes: selectionManager.focusedNodes(),
    }),
  );
}

describe('Directory FileTreeEntryComponent', () => {
  const store = createStore(new FileTreeStore());

  describe('when expanding/collapsing dir component', () => {
    beforeEach(() => {
      jest.spyOn(store, 'dispatch');
    });

    it('expands on click when node is selected', () => {
      const nodeComponent = renderEntryComponentIntoDocument(
        FileTreeEntryComponent,
        store,
        {
          rootUri: '/a/',
          uri: '/a/b/',
          isSelected: true,
          isContainer: true,
        },
      );

      // The onClick is listened not by the <li> element, but by its first child.
      // $FlowFixMe
      const domNode = ReactDOM.findDOMNode(nodeComponent).children[0];
      TestUtils.Simulate.click(domNode);
      expect(store.dispatch.mock.calls.map(call => call[0].type)).toContain(
        ActionTypes.EXPAND_NODE,
      );
    });
  });
});

describe('File FileTreeEntryComponent', () => {
  const store = createStore(new FileTreeStore());

  describe('when expanding/collapsing file component', () => {
    beforeEach(() => {
      jest.spyOn(store, 'dispatch');
    });

    it('does not expand on click when node is selected', () => {
      const nodeComponent = renderEntryComponentIntoDocument(
        FileTreeEntryComponent,
        store,
        {
          rootUri: '/a/',
          uri: '/a/b',
          isSelected: true,
          isContainer: false,
        },
      );
      const domNode = ReactDOM.findDOMNode(nodeComponent);
      invariant(domNode instanceof Element);
      TestUtils.Simulate.click(domNode);
      expect(store.dispatch.mock.calls.map(call => call[0].type)).not.toContain(
        ActionTypes.EXPAND_NODE,
      );
    });
  });

  describe('when preview tabs are enabled', () => {
    beforeEach(() => {
      jest.spyOn(store, 'dispatch');
    });

    it('opens a file if a selected node is clicked', () => {
      const nodeComponent = renderEntryComponentIntoDocument(
        FileTreeEntryComponent,
        store,
        {
          rootUri: '/a/',
          uri: '/a/b',
          isSelected: true,
          isContainer: false,
          usePreviewTabs: true,
        },
      );
      const domNode = ReactDOM.findDOMNode(nodeComponent);
      invariant(domNode instanceof Element);
      TestUtils.Simulate.click(domNode);
      expect(store.dispatch.mock.calls.map(call => call[0].type)).toContain(
        ActionTypes.CONFIRM_NODE,
      );
    });
  });
});
