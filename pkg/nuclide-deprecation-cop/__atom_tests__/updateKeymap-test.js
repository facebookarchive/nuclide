"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _updateKeymap() {
  const data = _interopRequireDefault(require("../lib/updateKeymap"));

  _updateKeymap = function () {
    return data;
  };

  return data;
}

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
_temp().default.track();

describe('updateKeymap', () => {
  it('updates a user keymap', async () => {
    let notification;

    const {
      path
    } = _temp().default.openSync({
      suffix: 'test.cson'
    });

    _fs.default.writeFileSync(path, '"alt-w": "command"\n"ctrl-w": "command-1"');

    jest.spyOn(atom.notifications, 'addInfo').mockImplementation((title, data) => {
      notification = data;
      return {
        dismiss: () => {}
      };
    });
    const updatePromise = (0, _updateKeymap().default)(path, {
      command: 'new-command',
      'command-1': 'new-command-1'
    });
    await (0, _waits_for().default)(() => notification != null);
    expect(notification.description).toContain('- `command`\n- `command-1`');
    notification.buttons[0].onDidClick();
    await updatePromise;

    const file = _fs.default.readFileSync(path, 'utf8');

    expect(file).toBe('"alt-w": "new-command"\n"ctrl-w": "new-command-1"');
  });
});