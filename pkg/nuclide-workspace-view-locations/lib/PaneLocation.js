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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _observePanes2;

function _observePanes() {
  return _observePanes2 = require('./observePanes');
}

var _syncPaneItemVisibility2;

function _syncPaneItemVisibility() {
  return _syncPaneItemVisibility2 = require('./syncPaneItemVisibility');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var PaneLocation = (function () {
  function PaneLocation() {
    _classCallCheck(this, PaneLocation);

    this._disposables = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default((0, (_syncPaneItemVisibility2 || _syncPaneItemVisibility()).syncPaneItemVisibility)((0, (_observePanes2 || _observePanes()).observePanes)(atom.workspace.paneContainer), (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(true)));
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
     * means, so we'll be conservative but predictable and not destroy any items.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this._disposables.dispose();
    }
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
      var pane = atom.workspace.paneForItem(item);
      return pane != null && pane.getActiveItem() === item;
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