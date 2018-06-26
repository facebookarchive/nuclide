'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

var _updateKeymap;

function _load_updateKeymap() {
  return _updateKeymap = _interopRequireDefault(require('../lib/updateKeymap'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(_temp || _load_temp()).default.track(); /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          * @format
                                          */

describe('updateKeymap', () => {
  it('updates a user keymap', async () => {
    let notification;
    let updatePromise;
    const { path } = (_temp || _load_temp()).default.openSync({ suffix: 'test.cson' });

    _fs.default.writeFileSync(path, '"alt-w": "command"\n"ctrl-w": "command-1"');

    jest.spyOn(atom.notifications, 'addInfo').mockImplementation((title, data) => {
      notification = data;
      return { dismiss: () => {} };
    });

    updatePromise = (0, (_updateKeymap || _load_updateKeymap()).default)(path, {
      command: 'new-command',
      'command-1': 'new-command-1'
    });

    await (0, (_waits_for || _load_waits_for()).default)(() => notification != null);

    expect(notification.description).toContain('- `command`\n- `command-1`');
    notification.buttons[0].onDidClick();

    await updatePromise;
    const file = _fs.default.readFileSync(path, 'utf8');
    expect(file).toBe('"alt-w": "new-command"\n"ctrl-w": "new-command-1"');
  });
});