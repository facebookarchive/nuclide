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
import NodeComponent from '../components/NodeComponent';
import React from 'react-for-atom';

let {TestUtils} = React.addons;

function renderNodeComponentIntoDocument(props: Object = {}) {
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
  return TestUtils.renderIntoDocument(<NodeComponent {...componentProps} />);
}

describe('NodeComponent', () => {
  const actions = FileTreeActions.getInstance();

  describe('when expanding/collapsing', () => {
    beforeEach(() => {
      spyOn(actions, 'expandNode');
    });

    it('expands on click when node is a selected container', () => {
      const nodeComponent = renderNodeComponentIntoDocument({
        isContainer: true,
        isSelected: true,
      });
      const domNode = React.findDOMNode(nodeComponent);
      TestUtils.Simulate.click(domNode);
      expect(actions.expandNode).toHaveBeenCalled();
    });

    it('does not expand on click when node is a selected file (non-container)', () => {
      const nodeComponent = renderNodeComponentIntoDocument({
        isContainer: false,
        isSelected: true,
      });
      const domNode = React.findDOMNode(nodeComponent);
      TestUtils.Simulate.click(domNode);
      expect(actions.expandNode).not.toHaveBeenCalled();
    });
  });
});
