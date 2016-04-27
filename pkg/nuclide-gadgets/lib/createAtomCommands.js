Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _bind = Function.prototype.bind;
exports['default'] = createAtomCommands;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _atom = require('atom');

var _normalizeEventString = require('./normalizeEventString');

var _normalizeEventString2 = _interopRequireDefault(_normalizeEventString);

function createAtomCommands(gadgets, appCommands) {
  var commands = gadgets.valueSeq().flatMap(function (gadget) {
    return [atom.commands.add('atom-workspace', formatCommandName(gadget.gadgetId, 'Show'), function () {
      return appCommands.showGadget(gadget.gadgetId);
    }), atom.commands.add('atom-workspace', formatCommandName(gadget.gadgetId, 'Hide'), function () {
      return appCommands.hideGadget(gadget.gadgetId);
    }), atom.commands.add('atom-workspace', formatCommandName(gadget.gadgetId, 'Toggle'), function () {
      return appCommands.toggleGadget(gadget.gadgetId);
    })];
  }).toArray();
  return new (_bind.apply(_atom.CompositeDisposable, [null].concat(_toConsumableArray(commands))))();
}

function formatCommandName(gadgetId, action) {
  return (0, _normalizeEventString2['default'])(gadgetId) + ':' + (0, _normalizeEventString2['default'])(action);
}
module.exports = exports['default'];