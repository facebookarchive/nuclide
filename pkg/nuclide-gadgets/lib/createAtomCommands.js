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

exports.default = createAtomCommands;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _normalizeEventString2;

function _normalizeEventString() {
  return _normalizeEventString2 = _interopRequireDefault(require('./normalizeEventString'));
}

function createAtomCommands(gadget, appCommands) {
  var _atomWorkspace;

  return {
    'atom-workspace': (_atomWorkspace = {}, _defineProperty(_atomWorkspace, formatCommandName(gadget.gadgetId, 'Show'), function () {
      return appCommands.showGadget(gadget.gadgetId);
    }), _defineProperty(_atomWorkspace, formatCommandName(gadget.gadgetId, 'Hide'), function () {
      return appCommands.hideGadget(gadget.gadgetId);
    }), _defineProperty(_atomWorkspace, formatCommandName(gadget.gadgetId, 'Toggle'), function () {
      return appCommands.toggleGadget(gadget.gadgetId);
    }), _atomWorkspace)
  };
}

function formatCommandName(gadgetId, action) {
  return (0, (_normalizeEventString2 || _normalizeEventString()).default)(gadgetId) + ':' + (0, (_normalizeEventString2 || _normalizeEventString()).default)(action);
}
module.exports = exports.default;