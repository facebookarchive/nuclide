'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import FileTreeActions from '../lib/FileTreeActions';
import DirectoryEntryComponent from '../components/DirectoryEntryComponent';
import FileEntryComponent from '../components/FileEntryComponent';
import React from 'react-for-atom';

const {TestUtils} = React.addons;

function renderEntryComponentIntoDocument(componentKlass: Object, props: Object = {}) {
  const componentProps = {
    ...{
      indentLevel: 0,
      isContainer: false,
      isExpanded: false,
      isLoading: false,
      isSelected: false,
      nodeKey: '',
      nodeName: '',
      nodePath: '',
      rootKey: '',
    },
    ...props,
  };
  return TestUtils.renderIntoDocument(React.createElement(componentKlass, componentProps));
}

describe('DirectoryEntryComponent', () => {
  const actions = FileTreeActions.getInstance();

  describe('when expanding/collapsing', () => {
    beforeEach(() => {
      spyOn(actions, 'expandNode');
    });

    it('expands on click when node is selected', () => {
      const nodeComponent = renderEntryComponentIntoDocument(
        DirectoryEntryComponent,
        {
          isRoot: false,
          isSelected: true,
        }
      );
      const domNode = React.findDOMNode(nodeComponent);
      TestUtils.Simulate.click(domNode);
      expect(actions.expandNode).toHaveBeenCalled();
    });
  });
});

describe('FileEntryComponent', () => {
  const actions = FileTreeActions.getInstance();

  describe('when expanding/collapsing', () => {
    beforeEach(() => {
      spyOn(actions, 'expandNode');
    });

    it('does not expand on click when node is selected', () => {
      const nodeComponent = renderEntryComponentIntoDocument(
        FileEntryComponent,
        {isSelected: true}
      );
      const domNode = React.findDOMNode(nodeComponent);
      TestUtils.Simulate.click(domNode);
      expect(actions.expandNode).not.toHaveBeenCalled();
    });
  });
});
