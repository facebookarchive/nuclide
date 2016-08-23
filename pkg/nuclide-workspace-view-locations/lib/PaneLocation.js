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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var PaneLocation = (function () {
  function PaneLocation() {
    _classCallCheck(this, PaneLocation);
  }

  _createClass(PaneLocation, [{
    key: 'addItem',
    value: function addItem(item) {
      atom.workspace.getActivePane().addItem(item);
    }

    /**
     * The PaneLocation is a little special. Since it delegates all of the work to Atom, it doesn't
     * actually manage all of its own state. A viewable added to this location in a previous session
     * (and then serialized and deserialized) is indistinguishable from a pane item added via other
     * means, so we'll be conservative but predictable and not destroy anything.
     */
  }, {
    key: 'destroy',
    value: function destroy() {}
  }, {
    key: 'destroyItem',
    value: function destroyItem(item) {
      var pane = atom.workspace.paneForItem(item);
      if (pane != null) {
        pane.destroyItem(item);
      }
    }
  }, {
    key: 'getItems',
    value: function getItems() {
      return atom.workspace.getPaneItems();
    }
  }, {
    key: '_destroyItem',
    value: function _destroyItem(item) {
      // The user may have split since adding, so find the item first.
      var pane = atom.workspace.paneForItem(item);
      if (pane != null) {
        pane.destroyItem(item);
      }
    }
  }, {
    key: 'hideItem',
    value: function hideItem(item) {
      this.destroyItem(item);
    }
  }, {
    key: 'itemIsVisible',
    value: function itemIsVisible(item) {
      return atom.workspace.paneForItem(item) != null;
    }
  }, {
    key: 'showItem',
    value: function showItem(item) {
      var pane = atom.workspace.paneForItem(item);
      if (pane == null) {
        pane = atom.workspace.getActivePane();
        pane.addItem(item);
      }
      pane.activate();
      pane.activateItem(item);
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      // We rely on the default Atom serialization for Panes.
      return null;
    }
  }]);

  return PaneLocation;
})();

exports.PaneLocation = PaneLocation;