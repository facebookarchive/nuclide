"use strict";

function _FileTreeActions() {
  const data = _interopRequireDefault(require("../lib/FileTreeActions"));

  _FileTreeActions = function () {
    return data;
  };

  return data;
}

function _FileTreeStore() {
  const data = _interopRequireDefault(require("../lib/FileTreeStore"));

  _FileTreeStore = function () {
    return data;
  };

  return data;
}

function _FileTreeNode() {
  const data = require("../lib/FileTreeNode");

  _FileTreeNode = function () {
    return data;
  };

  return data;
}

function _FileTreeEntryComponent() {
  const data = require("../components/FileTreeEntryComponent");

  _FileTreeEntryComponent = function () {
    return data;
  };

  return data;
}

function _nuclideWorkingSetsCommon() {
  const data = require("../../nuclide-working-sets-common");

  _nuclideWorkingSetsCommon = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _testUtils() {
  const data = _interopRequireDefault(require("react-dom/test-utils"));

  _testUtils = function () {
    return data;
  };

  return data;
}

function _FileTreeSelectionManager() {
  const data = require("../lib/FileTreeSelectionManager");

  _FileTreeSelectionManager = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
 * @emails oncall+nuclide
 */

/* global Element */
function renderEntryComponentIntoDocument(componentKlass, store, actions, props = {}, conf = {}) {
  const selectionManager = new (_FileTreeSelectionManager().FileTreeSelectionManager)(() => {});
  const nodeProps = Object.assign({
    isExpanded: false,
    isLoading: false,
    isSelected: false,
    isCwd: false
  }, props);
  const nodeConf = Object.assign({
    vcsStatuses: Immutable().Map(),
    workingSet: new (_nuclideWorkingSetsCommon().WorkingSet)(),
    editedWorkingSet: new (_nuclideWorkingSetsCommon().WorkingSet)(),
    hideIgnoredNames: true,
    excludeVcsIgnoredPaths: true,
    ignoredPatterns: Immutable().Set(),
    repositories: Immutable().Set(),
    usePreviewTabs: true,
    focusEditorOnFileSelection: false,
    isEditingWorkingSet: false,
    openFilesWorkingSet: new (_nuclideWorkingSetsCommon().WorkingSet)(),
    reposByRoot: {},
    selectionManager
  }, conf);
  const node = new (_FileTreeNode().FileTreeNode)(nodeProps, nodeConf);
  return _testUtils().default.renderIntoDocument(React.createElement(componentKlass, {
    store,
    actions,
    node,
    selectedNodes: selectionManager.selectedNodes(),
    focusedNodes: selectionManager.focusedNodes()
  }));
}

describe('Directory FileTreeEntryComponent', () => {
  const store = new (_FileTreeStore().default)();
  const actions = new (_FileTreeActions().default)(store);
  describe('when expanding/collapsing dir component', () => {
    beforeEach(() => {
      jest.spyOn(actions, 'expandNode');
    });
    it('expands on click when node is selected', () => {
      const nodeComponent = renderEntryComponentIntoDocument(_FileTreeEntryComponent().FileTreeEntryComponent, store, actions, {
        rootUri: '/a/',
        uri: '/a/b/',
        isSelected: true,
        isContainer: true
      }); // The onClick is listened not by the <li> element, but by its first child.
      // $FlowFixMe

      const domNode = _reactDom.default.findDOMNode(nodeComponent).children[0];

      _testUtils().default.Simulate.click(domNode);

      expect(actions.expandNode).toHaveBeenCalled();
    });
  });
});
describe('File FileTreeEntryComponent', () => {
  const store = new (_FileTreeStore().default)();
  const actions = new (_FileTreeActions().default)(store);
  describe('when expanding/collapsing file component', () => {
    beforeEach(() => {
      jest.spyOn(actions, 'expandNode');
    });
    it('does not expand on click when node is selected', () => {
      const nodeComponent = renderEntryComponentIntoDocument(_FileTreeEntryComponent().FileTreeEntryComponent, store, actions, {
        rootUri: '/a/',
        uri: '/a/b',
        isSelected: true,
        isContainer: false
      });

      const domNode = _reactDom.default.findDOMNode(nodeComponent);

      if (!(domNode instanceof Element)) {
        throw new Error("Invariant violation: \"domNode instanceof Element\"");
      }

      _testUtils().default.Simulate.click(domNode);

      expect(actions.expandNode).not.toHaveBeenCalled();
    });
  });
  describe('when preview tabs are enabled', () => {
    beforeEach(() => {
      jest.spyOn(actions, 'confirmNode');
    });
    it('opens a file if a selected node is clicked', () => {
      const nodeComponent = renderEntryComponentIntoDocument(_FileTreeEntryComponent().FileTreeEntryComponent, store, actions, {
        rootUri: '/a/',
        uri: '/a/b',
        isSelected: true,
        isContainer: false,
        usePreviewTabs: true
      });

      const domNode = _reactDom.default.findDOMNode(nodeComponent);

      if (!(domNode instanceof Element)) {
        throw new Error("Invariant violation: \"domNode instanceof Element\"");
      }

      _testUtils().default.Simulate.click(domNode);

      expect(actions.confirmNode).toHaveBeenCalled();
    });
  });
});