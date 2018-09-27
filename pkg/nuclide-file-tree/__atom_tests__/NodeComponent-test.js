"use strict";

function _reactRedux() {
  const data = require("react-redux");

  _reactRedux = function () {
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

function _nuclideWorkingSetsCommon() {
  const data = require("../../nuclide-working-sets-common");

  _nuclideWorkingSetsCommon = function () {
    return data;
  };

  return data;
}

function _FileTreeEntryComponent() {
  const data = _interopRequireDefault(require("../components/FileTreeEntryComponent"));

  _FileTreeEntryComponent = function () {
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

function _createStore() {
  const data = _interopRequireDefault(require("../lib/redux/createStore"));

  _createStore = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/redux/Selectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../lib/redux/Actions"));

  Actions = function () {
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
function renderEntryComponentIntoDocument(Component, store, props = {}, conf = {}) {
  const nodeProps = Object.assign({
    isExpanded: false,
    isLoading: false,
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
    reposByRoot: {}
  }, conf);
  const node = new (_FileTreeNode().FileTreeNode)(nodeProps, nodeConf);
  store.dispatch(Actions().focus(node));
  const selectedNodes = Selectors().getSelectedNodes(store.getState()).toSet();
  return _testUtils().default.renderIntoDocument(React.createElement(_reactRedux().Provider, {
    store: store
  }, React.createElement(Component, Object.assign({
    node: node
  }, props, {
    selectedNodes: selectedNodes
  }))));
}

let store;
beforeEach(() => {
  store = (0, _createStore().default)();
  jest.spyOn(store, 'dispatch');
});
describe('Directory FileTreeEntryComponent', () => {
  describe('when expanding/collapsing dir component', () => {
    // TODO: This implementation changed. We need to update the test accordingly.
    it.skip('expands on click when node is selected', () => {
      const props = {
        rootUri: '/a/',
        uri: '/a/b/',
        isContainer: true
      };
      store.dispatch(Actions().setSelectedNode(props.rootUri, props.uri));
      const nodeComponent = renderEntryComponentIntoDocument(_FileTreeEntryComponent().default, store, props); // The onClick is listened not by the <li> element, but by its first child.
      // $FlowFixMe

      const domNode = _reactDom.default.findDOMNode(nodeComponent).children[0];

      _testUtils().default.Simulate.click(domNode);

      expect(store.dispatch.mock.calls.map(call => call[0].type)).toContain(Actions().EXPAND_NODE);
    });
  });
});
describe('File FileTreeEntryComponent', () => {
  describe('when expanding/collapsing file component', () => {
    it('does not expand on click when node is selected', () => {
      const props = {
        rootUri: '/a/',
        uri: '/a/b',
        isContainer: false
      };
      store.dispatch(Actions().setSelectedNode(props.rootUri, props.uri));
      const nodeComponent = renderEntryComponentIntoDocument(_FileTreeEntryComponent().default, store, props);

      const domNode = _reactDom.default.findDOMNode(nodeComponent);

      if (!(domNode instanceof Element)) {
        throw new Error("Invariant violation: \"domNode instanceof Element\"");
      }

      _testUtils().default.Simulate.click(domNode);

      expect(store.dispatch.mock.calls.map(call => call[0].type)).not.toContain(Actions().EXPAND_NODE);
    });
  });
  describe('when preview tabs are enabled', () => {
    it('opens a file if a selected node is clicked', () => {
      const props = {
        rootUri: '/a/',
        uri: '/a/b',
        isContainer: false
      };
      store.dispatch(Actions().setUsePreviewTabs(true));
      store.dispatch(Actions().setSelectedNode(props.rootUri, props.uri));
      const nodeComponent = renderEntryComponentIntoDocument(_FileTreeEntryComponent().default, store, props);

      const domNode = _reactDom.default.findDOMNode(nodeComponent);

      if (!(domNode instanceof Element)) {
        throw new Error("Invariant violation: \"domNode instanceof Element\"");
      }

      _testUtils().default.Simulate.click(domNode);

      expect(store.dispatch.mock.calls.map(call => call[0].type)).toContain(Actions().CONFIRM_NODE);
    });
  });
});