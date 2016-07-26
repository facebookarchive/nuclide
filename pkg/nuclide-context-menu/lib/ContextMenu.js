Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

/**
 * This class represents a collection of context menu items that have been registered with Atom's
 * ContextMenuManager under a single CSS selector. These items are ordered based on the specified
 * priority with which they are added to this object. (The CSS selector is either specified
 * explicitly via the `cssSelector` property of the RootMenuOptions passed to the constructor, or
 * implicitly via the `parent` property of the SubmenuOptions passed to the constructor.)
 *
 * This is in contrast to Atom's ContextMenuManager, which relies on the specificity of the CSS
 * selector for a menu item to determine its precedence. The motivation behind this approach is to
 * provide a total order on menu item ordering rather than a partial order. As such, this class
 * serves as an adapter between the numeric priority model and ContextMenuManager's model.
 *
 * Note that this class also provides support for submenu items. This requires Atom 1.6 or later
 * because it relies on this fix: https://github.com/atom/atom/pull/10486.
 */

var ContextMenu = (function () {
  function ContextMenu(menuOptions) {
    _classCallCheck(this, ContextMenu);

    this._menuOptions = menuOptions;
    this._items = [];
    this._needsSort = false;
    this._sort = this._sort.bind(this);
    this._disposable = null;
  }

  /** Comparator used to sort menu items by priority: lower priorities appear earlier. */

  /**
   * @return true if this menu does not contain any items; otherwise, returns false. Note this will
   *   return true if it contains only empty submenu items.
   */

  _createClass(ContextMenu, [{
    key: 'isEmpty',
    value: function isEmpty() {
      return this._items.length === 0;
    }

    /**
     * Adds the specified item to this contenxt menu.
     *
     * Items with lower priority values appear earlier in the context menu
     * (i.e., items appear in numerical order with respect to priority).
     *
     * @return object whose dispose() method can be used to remove the menu item from this object.
     */
  }, {
    key: 'addItem',
    value: function addItem(item, priority) {
      var value = { type: 'item', item: item, priority: priority };
      return this._addItemToList(value);
    }

    /**
     * Adds the specified submenu to this contenxt menu.
     *
     * Items with lower priority values appear earlier in the context menu
     * (i.e., items appear in numerical order with respect to priority).
     *
     * @return object whose dispose() method can be used to remove the submenu from this object.
     */
  }, {
    key: 'addSubmenu',
    value: function addSubmenu(contextMenu, priority) {
      var value = { type: 'menu', menu: contextMenu, priority: priority };
      return this._addItemToList(value);
    }
  }, {
    key: '_addItemToList',
    value: function _addItemToList(value) {
      var _this = this;

      this._items.push(value);
      this._needsSort = true;
      process.nextTick(this._sort);

      // TODO(mbolin): Ideally, this Disposable should be garbage-collected if this ContextMenu is
      // disposed.
      return new (_atom2 || _atom()).Disposable(function () {
        var index = _this._items.indexOf(value);
        _this._items.splice(index, 1);

        // We need to invoke _sort for the management of this._disposable and atom.contextMenu.add.
        _this._needsSort = true;
        _this._sort();
      });
    }

    /**
     * This method must be invoked after this._items has been modified. If necessary, it will remove
     * all items that this object previously registered with Atom's ContextMenuManager. Then it will
     * re-register everything in this._items once it has been sorted.
     */
  }, {
    key: '_sort',
    value: function _sort() {
      if (!this._needsSort) {
        return;
      }

      this._needsSort = false;

      if (this._disposable != null) {
        this._disposable.dispose();
      }

      var menuOptions = this._menuOptions;
      if (menuOptions.type === 'root') {
        var items = this._sortAndFilterItems();
        this._disposable = atom.contextMenu.add(_defineProperty({}, menuOptions.cssSelector, items.map(this._contextMenuItemForInternalItem, this)));
      } else if (menuOptions.type === 'submenu') {
        // Tell the parent menu to sort itself.
        menuOptions.parent._needsSort = true;
        menuOptions.parent._sort();
      }
    }

    /** Translates this object's internal representation of a menu item to Atom's representation. */
  }, {
    key: '_contextMenuItemForInternalItem',
    value: function _contextMenuItemForInternalItem(internalItem) {
      if (internalItem.type === 'item') {
        return internalItem.item;
      } else if (internalItem.type === 'menu') {
        // Note that due to our own strict renaming rules, this must be a private method instead of a
        // static function becuase of the access to _menuOptions and _items.
        var menuOptions = internalItem.menu._menuOptions;
        (0, (_assert2 || _assert()).default)(menuOptions.type === 'submenu');
        var items = internalItem.menu._sortAndFilterItems();
        return {
          label: menuOptions.label,
          submenu: items.map(this._contextMenuItemForInternalItem, this),
          shouldDisplay: menuOptions.shouldDisplay
        };
      } else {
        (0, (_assert2 || _assert()).default)(false);
      }
    }
  }, {
    key: '_sortAndFilterItems',
    value: function _sortAndFilterItems() {
      var items = this._items.filter(function (item) {
        if (item.type === 'item') {
          return true;
        } else if (item.type === 'menu') {
          var contextMenu = item.menu;
          return !contextMenu.isEmpty();
        }
      });
      items.sort(compareInternalItems);
      return items;
    }

    /** Removes all items this object has added to Atom's ContextMenuManager. */
  }, {
    key: 'dispose',
    value: function dispose() {
      this._needsSort = false;
      if (this._disposable != null) {
        this._disposable.dispose();
      }
      this._items.length = 0;
    }
  }]);

  return ContextMenu;
})();

exports.default = ContextMenu;
function compareInternalItems(a, b) {
  return a.priority - b.priority;
}
module.exports = exports.default;

/**
 * List of items that have been added to this context menu in the order they were added.
 * Note that this list does not get sorted: only a filtered version of it does.
 * Further, this list is mutated heavily, but it is never reassigned.
 */

/**
 * This is the Disposable that represents adding all of this object's menu items to Atom's own
 * ContextMenuManager. When a new item is added to this object, we must remove all of the items
 * that we previously added to the ContextMenuManager and then re-add them based on the new
 * ordering of priorities that results from the new item.
 */