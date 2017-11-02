'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _escapeStringRegexp;

function _load_escapeStringRegexp() {
  return _escapeStringRegexp = _interopRequireDefault(require('escape-string-regexp'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function quoteRegExp(str) {
  const boundary = '([\'"])';
  return `${boundary}(${str})${boundary}`;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (keymapPath, deprecatedCommands) {
    const keymapFile = yield (_fsPromise || _load_fsPromise()).default.readFile(keymapPath, 'utf8');
    // Search for all deprecated commands (whole words, escaped).
    const mergedRegExp = Object.keys(deprecatedCommands).map((_escapeStringRegexp || _load_escapeStringRegexp()).default).join('|');
    const matches = keymapFile.match(new RegExp(quoteRegExp(mergedRegExp), 'g'));
    if (matches != null) {
      // Format as a list.
      const matchesSet = new Set(matches.map(function (m) {
        return m.substr(1, m.length - 2);
      }));
      const matchesArray = Array.from(matchesSet);
      const matchesList = matchesArray.map(function (command) {
        return `- \`${command}\``;
      }).join('\n');
      return new Promise(function (resolve) {
        const notification = atom.notifications.addInfo('Nuclide: Deprecated Commands', {
          icon: 'nuclicon-nuclide',
          description: 'Your keymap contains the following deprecated commands:' + `\n\n${matchesList}\n\n` + 'Would you like to update your keymap?',
          dismissable: true,
          buttons: [{
            text: 'Update Keymap',
            className: 'icon icon-keyboard',
            onDidClick: (() => {
              var _ref2 = (0, _asyncToGenerator.default)(function* () {
                (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('deprecated-command-replaced', { commands: matchesArray });
                const replaced = matchesArray.reduce(function (str, match) {
                  return str.replace(new RegExp(quoteRegExp((0, (_escapeStringRegexp || _load_escapeStringRegexp()).default)(match)), 'g'), `$1${deprecatedCommands[match]}$3`);
                }, keymapFile);
                yield (_fsPromise || _load_fsPromise()).default.writeFile(keymapPath, replaced);
                atom.notifications.addSuccess('Keymap successfully updated!');
                notification.dismiss();
                resolve();
              });

              return function onDidClick() {
                return _ref2.apply(this, arguments);
              };
            })()
          }]
        });
      });
    }
  });

  function updateKeymap(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return updateKeymap;
})();