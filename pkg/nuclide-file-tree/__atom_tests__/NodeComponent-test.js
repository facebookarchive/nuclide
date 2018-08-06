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

import {Provider} from 'react-redux';
import {ActionTypes} from '../lib/FileTreeDispatcher';
import {FileTreeNode} from '../lib/FileTreeNode';
import {WorkingSet} from '../../nuclide-working-sets-common';
import FileTreeEntryComponent from '../components/FileTreeEntryComponent';
import invariant from 'assert';
import * as Immutable from 'immutable';
import * as React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import createStore from '../lib/redux/createStore';
import * as Selectors from '../lib/FileTreeSelectors';
import * as Actions from '../lib/redux/Actions';
import * as SelectionActions from '../lib/redux/SelectionActions';

function renderEntryComponentIntoDocument(
  Component: Object,
  store,
  props: Object = {},
  conf: Object = {},
): React.Component<any, any> {
  const nodeProps = {
    isExpanded: false,
    isLoading: false,
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
    ...conf,
  };

  const node = new FileTreeNode(nodeProps, nodeConf);
  store.dispatch(SelectionActions.focus(node));
  return TestUtils.renderIntoDocument(
    <Provider store={store}>
      <Component
        node={node}
        selectedNodes={Selectors.getSelectedNodes(store.getState()).toSet()}
        focusedNodes={Selectors.getFocusedNodes(store.getState()).toSet()}
      />
    </Provider>,
  );
}

describe('Directory FileTreeEntryComponent', () => {
  let store;
  beforeEach(() => {
    store = createStore();
    jest.spyOn(store, 'dispatch');
  });

  describe('when expanding/collapsing dir component', () => {
    it.only('expands on click when node is selected', () => {
      const props = {
        rootUri: '/a/',
        uri: '/a/b/',
        isContainer: true,
      };
      store.dispatch(Actions.setSelectedNode(props.rootUri, props.uri));
      const nodeComponent = renderEntryComponentIntoDocument(
        FileTreeEntryComponent,
        store,
        props,
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
  let store;
  beforeEach(() => {
    store = createStore();
    jest.spyOn(store, 'dispatch');
  });

  describe('when expanding/collapsing file component', () => {
    it('does not expand on click when node is selected', () => {
      const props = {
        rootUri: '/a/',
        uri: '/a/b',
        isContainer: false,
      };
      store.dispatch(Actions.setSelectedNode(props.rootUri, props.uri));
      const nodeComponent = renderEntryComponentIntoDocument(
        FileTreeEntryComponent,
        store,
        props,
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
    it('opens a file if a selected node is clicked', () => {
      const props = {
        rootUri: '/a/',
        uri: '/a/b',
        isContainer: false,
        usePreviewTabs: true,
      };
      store.dispatch(Actions.setSelectedNode(props.rootUri, props.uri));

      const nodeComponent = renderEntryComponentIntoDocument(
        FileTreeEntryComponent,
        store,
        props,
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
