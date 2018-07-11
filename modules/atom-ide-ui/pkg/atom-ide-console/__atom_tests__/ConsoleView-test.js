"use strict";

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _testUtils() {
  const data = _interopRequireDefault(require("react-dom/test-utils"));

  _testUtils = function () {
    return data;
  };

  return data;
}

function _ConsoleView() {
  const data = _interopRequireDefault(require("../lib/ui/ConsoleView"));

  _ConsoleView = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
describe('ConsoleView', () => {
  it('focuses the filter when "/" is pressed inside the console-scroll-pane-wrapper div', () => {
    const consoleView = _testUtils().default.renderIntoDocument(React.createElement(_ConsoleView().default, {
      clearRecords: () => {},
      createPaste: null,
      currentExecutor: null,
      displayableRecords: [],
      enableRegExpFilter: true,
      execute: () => {},
      executors: new Map(),
      filterText: '',
      filteredRecordCount: 0,
      fontSize: 12,
      getProvider: () => {},
      history: [],
      invalidFilterInput: false,
      onDisplayableRecordHeightChange: () => {},
      resetAllFilters: () => {},
      selectExecutor: () => {},
      selectSources: () => {},
      selectedSourceIds: [],
      sources: [],
      updateFilter: () => {},
      watchEditor: null
    }));

    const workspaceEl = atom.views.getView(atom.workspace);

    const consoleViewNode = _reactDom.default.findDOMNode(consoleView);

    if (!(consoleViewNode != null)) {
      throw new Error("Invariant violation: \"consoleViewNode != null\"");
    }

    workspaceEl.appendChild(consoleViewNode);
    const consoleHeaderComponent = consoleView._consoleHeaderComponent;

    if (!(consoleHeaderComponent != null)) {
      throw new Error("Invariant violation: \"consoleHeaderComponent != null\"");
    }

    const filterFocusSpy = jest.spyOn(consoleHeaderComponent, 'focusFilter');
    const consoleScrollPaneTarget = workspaceEl.querySelector('.console-scroll-pane-wrapper');

    if (!(consoleScrollPaneTarget != null)) {
      throw new Error("Invariant violation: \"consoleScrollPaneTarget != null\"");
    }

    atom.commands.dispatch(consoleScrollPaneTarget, 'atom-ide:filter');
    expect(filterFocusSpy).toHaveBeenCalled();
    workspaceEl.removeChild(consoleViewNode);
  });
});