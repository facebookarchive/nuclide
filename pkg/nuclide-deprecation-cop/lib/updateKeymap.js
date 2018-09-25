"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _escapeStringRegexp() {
  const data = _interopRequireDefault(require("escape-string-regexp"));

  _escapeStringRegexp = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
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
 */
function quoteRegExp(str) {
  const boundary = '([\'"])';
  return `${boundary}(${str})${boundary}`;
}

var updateKeymap = async function updateKeymap(keymapPath, deprecatedCommands) {
  const keymapFile = await _fsPromise().default.readFile(keymapPath, 'utf8'); // Search for all deprecated commands (whole words, escaped).

  const mergedRegExp = Object.keys(deprecatedCommands).map(_escapeStringRegexp().default).join('|');
  const matches = keymapFile.match(new RegExp(quoteRegExp(mergedRegExp), 'g'));

  if (matches != null) {
    // Format as a list.
    const matchesSet = new Set(matches.map(m => m.substr(1, m.length - 2)));
    const matchesArray = Array.from(matchesSet);
    const matchesList = matchesArray.map(command => `- \`${command}\``).join('\n');
    return new Promise(resolve => {
      const notification = atom.notifications.addInfo('Nuclide: Deprecated Commands', {
        icon: 'nuclicon-nuclide',
        description: 'Your keymap contains the following deprecated commands:' + `\n\n${matchesList}\n\n` + 'Would you like to update your keymap?',
        dismissable: true,
        buttons: [{
          text: 'Update Keymap',
          className: 'icon icon-keyboard',
          onDidClick: async () => {
            (0, _nuclideAnalytics().track)('deprecated-command-replaced', {
              commands: matchesArray
            });
            const replaced = matchesArray.reduce((str, match) => str.replace(new RegExp(quoteRegExp((0, _escapeStringRegexp().default)(match)), 'g'), `$1${deprecatedCommands[match]}$3`), keymapFile);
            await _fsPromise().default.writeFile(keymapPath, replaced);
            atom.notifications.addSuccess('Keymap successfully updated!');
            notification.dismiss();
            resolve();
          }
        }]
      });
    });
  }
};

exports.default = updateKeymap;