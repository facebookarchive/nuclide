"use strict";

var _os = _interopRequireDefault(require("os"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _CodeActionManager() {
  const data = require("../lib/CodeActionManager");

  _CodeActionManager = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
describe('CodeActionManager', () => {
  let manager;
  let provider;
  let delegate;
  let editor;
  beforeEach(async () => {
    editor = await atom.workspace.open(_nuclideUri().default.join(_os.default.tmpdir(), 'test.txt'));
    editor.setText('abc\ndef\nghi');
    manager = new (_CodeActionManager().CodeActionManager)();
    provider = {
      priority: 1,
      grammarScopes: ['text.plain.null-grammar'],

      async getCodeActions(_e, _r, _d) {
        return [];
      }

    };
    delegate = {
      clearMessages: () => {},
      setAllMessages: _messages => {}
    };
    manager._linterDelegate = delegate;
    manager.addProvider(provider);
  });
  it('finds code actions on highlight change and updates linter', async () => {
    const actions = [{
      apply() {},

      async getTitle() {
        return 'Mock action';
      },

      dispose() {}

    }];
    const spyActions = jest.spyOn(provider, 'getCodeActions').mockReturnValue(actions);
    const spyLinter = jest.spyOn(delegate, 'setAllMessages');
    await (0, _promise().sleep)(1); // trigger debounce

    editor.selectAll();
    await (0, _promise().sleep)(501);
    await (0, _waits_for().default)(() => spyLinter.mock.calls.length > 0, 'should have called setAllMessages');
    expect(spyActions).toHaveBeenCalled();
    expect(spyLinter).toHaveBeenCalled();
    expect(spyLinter.mock.calls[spyLinter.mock.calls.length - 1][0][0].solutions.length).toEqual(1);
  });
});