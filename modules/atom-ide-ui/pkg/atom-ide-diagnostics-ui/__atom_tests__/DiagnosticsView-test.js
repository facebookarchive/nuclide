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

function _DiagnosticsView() {
  const data = _interopRequireDefault(require("../lib/ui/DiagnosticsView"));

  _DiagnosticsView = function () {
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
describe('DiagnosticsView', () => {
  it('focuses the filter when "/" is pressed', () => {
    const diagnosticsView = _testUtils().default.renderIntoDocument(React.createElement(_DiagnosticsView().default, {
      autoVisibility: true,
      diagnostics: [],
      filterByActiveTextEditor: false,
      gotoMessageLocation: () => {},
      hiddenGroups: new Set(),
      onFilterByActiveTextEditorChange: () => {},
      isVisible: true,
      onShowTracesChange: () => {},
      onTextFilterChange: () => {},
      onTypeFilterChange: () => {},
      selectMessage: () => {},
      selectedMessage: null,
      showDirectoryColumn: false,
      showTraces: true,
      supportedMessageKinds: new Set(),
      textFilter: {
        text: 'test',
        isRegExp: true,
        invalid: false
      },
      uiConfig: []
    }));

    const workspaceEl = atom.views.getView(atom.workspace);

    const diagnosticsViewNode = _reactDom.default.findDOMNode(diagnosticsView);

    if (!(diagnosticsViewNode != null)) {
      throw new Error("Invariant violation: \"diagnosticsViewNode != null\"");
    }

    workspaceEl.appendChild(diagnosticsViewNode);
    const filterComponent = diagnosticsView._filterComponent;

    if (!(filterComponent != null)) {
      throw new Error("Invariant violation: \"filterComponent != null\"");
    }

    const filterFocusSpy = jest.spyOn(filterComponent, 'focus');
    const diagnosticsTableTarget = workspaceEl.querySelector('.atom-ide-filterable');

    if (!(diagnosticsTableTarget != null)) {
      throw new Error("Invariant violation: \"diagnosticsTableTarget != null\"");
    }

    atom.commands.dispatch(diagnosticsTableTarget, 'atom-ide:filter');
    expect(filterFocusSpy).toHaveBeenCalled();
    workspaceEl.removeChild(diagnosticsViewNode);
  });
});