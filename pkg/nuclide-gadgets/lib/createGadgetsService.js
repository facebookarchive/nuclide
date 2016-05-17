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

exports.default = createGadgetsService;

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

/**
 * Create an object that other packages can use (via Atom services) to interact with this package.
 */

function createGadgetsService(commands_) {
  // Create a local, nullable variable to close over so that other packages won't keep the
  // `Commands` instance in memory after this package has been deactivated.
  var commands = commands_;

  var service = {
    destroyGadget: function destroyGadget(gadgetId) {
      if (commands != null) {
        commands.destroyGadget(gadgetId);
      }
    },

    registerGadget: function registerGadget(gadget) {
      if (commands != null) {
        commands.registerGadget(gadget);
      }
      return new (_atom2 || _atom()).Disposable(function () {
        if (commands != null) {
          commands.unregisterGadget(gadget.gadgetId);
        }
      });
    },

    showGadget: function showGadget(gadgetId) {
      if (commands != null) {
        commands.showGadget(gadgetId);
      }
    }
  };

  return {
    service: service,
    dispose: function dispose() {
      commands = null;
    }
  };
}

module.exports = exports.default;