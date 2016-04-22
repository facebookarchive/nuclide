Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

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
      return new _atom.Disposable(function () {
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
        (0, _assert2['default'])(menuOptions.type === 'submenu');
        var items = internalItem.menu._sortAndFilterItems();
        return {
          label: menuOptions.label,
          submenu: items.map(this._contextMenuItemForInternalItem, this)
        };
      } else {
        (0, _assert2['default'])(false);
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

exports['default'] = ContextMenu;
function compareInternalItems(a, b) {
  return a.priority - b.priority;
}
module.exports = exports['default'];

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
//# sourceMappingURL=data:application/json;base64,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QztLQUNkOzs7OztXQUdNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDeEIsVUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksRUFBRTtBQUM1QixZQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQzVCO0FBQ0QsVUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQ3hCOzs7U0FwSmtCLFdBQVc7OztxQkFBWCxXQUFXO0FBd0poQyxTQUFTLG9CQUFvQixDQUFDLENBQWUsRUFBRSxDQUFlLEVBQVU7QUFDdEUsU0FBTyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7Q0FDaEMiLCJmaWxlIjoiQ29udGV4dE1lbnUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG50eXBlIEl0ZW0gPSB7XG4gIHR5cGU6ICdpdGVtJztcbiAgaXRlbTogYXRvbSRDb250ZXh0TWVudUl0ZW07XG4gIHByaW9yaXR5OiBudW1iZXI7XG59O1xuXG50eXBlIE1lbnUgPSB7XG4gIHR5cGU6ICdtZW51JztcbiAgbWVudTogQ29udGV4dE1lbnU7XG4gIHByaW9yaXR5OiBudW1iZXI7XG59O1xuXG50eXBlIEludGVybmFsSXRlbSA9IEl0ZW0gfCBNZW51O1xuXG50eXBlIFJvb3RNZW51T3B0aW9ucyA9IHtcbiAgdHlwZTogJ3Jvb3QnO1xuICBjc3NTZWxlY3Rvcjogc3RyaW5nO1xufTtcblxudHlwZSBTdWJtZW51T3B0aW9ucyA9IHtcbiAgdHlwZTogJ3N1Ym1lbnUnO1xuICBsYWJlbDogc3RyaW5nO1xuICBwYXJlbnQ6IENvbnRleHRNZW51O1xufTtcblxudHlwZSBNZW51T3B0aW9ucyA9IFJvb3RNZW51T3B0aW9ucyB8IFN1Ym1lbnVPcHRpb25zO1xuXG4vKipcbiAqIFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhIGNvbGxlY3Rpb24gb2YgY29udGV4dCBtZW51IGl0ZW1zIHRoYXQgaGF2ZSBiZWVuIHJlZ2lzdGVyZWQgd2l0aCBBdG9tJ3NcbiAqIENvbnRleHRNZW51TWFuYWdlciB1bmRlciBhIHNpbmdsZSBDU1Mgc2VsZWN0b3IuIFRoZXNlIGl0ZW1zIGFyZSBvcmRlcmVkIGJhc2VkIG9uIHRoZSBzcGVjaWZpZWRcbiAqIHByaW9yaXR5IHdpdGggd2hpY2ggdGhleSBhcmUgYWRkZWQgdG8gdGhpcyBvYmplY3QuIChUaGUgQ1NTIHNlbGVjdG9yIGlzIGVpdGhlciBzcGVjaWZpZWRcbiAqIGV4cGxpY2l0bHkgdmlhIHRoZSBgY3NzU2VsZWN0b3JgIHByb3BlcnR5IG9mIHRoZSBSb290TWVudU9wdGlvbnMgcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3Rvciwgb3JcbiAqIGltcGxpY2l0bHkgdmlhIHRoZSBgcGFyZW50YCBwcm9wZXJ0eSBvZiB0aGUgU3VibWVudU9wdGlvbnMgcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3Rvci4pXG4gKlxuICogVGhpcyBpcyBpbiBjb250cmFzdCB0byBBdG9tJ3MgQ29udGV4dE1lbnVNYW5hZ2VyLCB3aGljaCByZWxpZXMgb24gdGhlIHNwZWNpZmljaXR5IG9mIHRoZSBDU1NcbiAqIHNlbGVjdG9yIGZvciBhIG1lbnUgaXRlbSB0byBkZXRlcm1pbmUgaXRzIHByZWNlZGVuY2UuIFRoZSBtb3RpdmF0aW9uIGJlaGluZCB0aGlzIGFwcHJvYWNoIGlzIHRvXG4gKiBwcm92aWRlIGEgdG90YWwgb3JkZXIgb24gbWVudSBpdGVtIG9yZGVyaW5nIHJhdGhlciB0aGFuIGEgcGFydGlhbCBvcmRlci4gQXMgc3VjaCwgdGhpcyBjbGFzc1xuICogc2VydmVzIGFzIGFuIGFkYXB0ZXIgYmV0d2VlbiB0aGUgbnVtZXJpYyBwcmlvcml0eSBtb2RlbCBhbmQgQ29udGV4dE1lbnVNYW5hZ2VyJ3MgbW9kZWwuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgY2xhc3MgYWxzbyBwcm92aWRlcyBzdXBwb3J0IGZvciBzdWJtZW51IGl0ZW1zLiBUaGlzIHJlcXVpcmVzIEF0b20gMS42IG9yIGxhdGVyXG4gKiBiZWNhdXNlIGl0IHJlbGllcyBvbiB0aGlzIGZpeDogaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9wdWxsLzEwNDg2LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250ZXh0TWVudSB7XG4gIF9tZW51T3B0aW9uczogTWVudU9wdGlvbnM7XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgaXRlbXMgdGhhdCBoYXZlIGJlZW4gYWRkZWQgdG8gdGhpcyBjb250ZXh0IG1lbnUgaW4gdGhlIG9yZGVyIHRoZXkgd2VyZSBhZGRlZC5cbiAgICogTm90ZSB0aGF0IHRoaXMgbGlzdCBkb2VzIG5vdCBnZXQgc29ydGVkOiBvbmx5IGEgZmlsdGVyZWQgdmVyc2lvbiBvZiBpdCBkb2VzLlxuICAgKiBGdXJ0aGVyLCB0aGlzIGxpc3QgaXMgbXV0YXRlZCBoZWF2aWx5LCBidXQgaXQgaXMgbmV2ZXIgcmVhc3NpZ25lZC5cbiAgICovXG4gIF9pdGVtczogQXJyYXk8SW50ZXJuYWxJdGVtPjtcblxuICBfbmVlZHNTb3J0OiBib29sZWFuO1xuICBfc29ydDogRnVuY3Rpb247XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgdGhlIERpc3Bvc2FibGUgdGhhdCByZXByZXNlbnRzIGFkZGluZyBhbGwgb2YgdGhpcyBvYmplY3QncyBtZW51IGl0ZW1zIHRvIEF0b20ncyBvd25cbiAgICogQ29udGV4dE1lbnVNYW5hZ2VyLiBXaGVuIGEgbmV3IGl0ZW0gaXMgYWRkZWQgdG8gdGhpcyBvYmplY3QsIHdlIG11c3QgcmVtb3ZlIGFsbCBvZiB0aGUgaXRlbXNcbiAgICogdGhhdCB3ZSBwcmV2aW91c2x5IGFkZGVkIHRvIHRoZSBDb250ZXh0TWVudU1hbmFnZXIgYW5kIHRoZW4gcmUtYWRkIHRoZW0gYmFzZWQgb24gdGhlIG5ld1xuICAgKiBvcmRlcmluZyBvZiBwcmlvcml0aWVzIHRoYXQgcmVzdWx0cyBmcm9tIHRoZSBuZXcgaXRlbS5cbiAgICovXG4gIF9kaXNwb3NhYmxlOiA/SURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IobWVudU9wdGlvbnM6IE1lbnVPcHRpb25zKSB7XG4gICAgdGhpcy5fbWVudU9wdGlvbnMgPSBtZW51T3B0aW9ucztcbiAgICB0aGlzLl9pdGVtcyA9IFtdO1xuICAgIHRoaXMuX25lZWRzU29ydCA9IGZhbHNlO1xuICAgIHRoaXMuX3NvcnQgPSB0aGlzLl9zb3J0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB0cnVlIGlmIHRoaXMgbWVudSBkb2VzIG5vdCBjb250YWluIGFueSBpdGVtczsgb3RoZXJ3aXNlLCByZXR1cm5zIGZhbHNlLiBOb3RlIHRoaXMgd2lsbFxuICAgKiAgIHJldHVybiB0cnVlIGlmIGl0IGNvbnRhaW5zIG9ubHkgZW1wdHkgc3VibWVudSBpdGVtcy5cbiAgICovXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZW1zLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBzcGVjaWZpZWQgaXRlbSB0byB0aGlzIGNvbnRlbnh0IG1lbnUuXG4gICAqXG4gICAqIEl0ZW1zIHdpdGggbG93ZXIgcHJpb3JpdHkgdmFsdWVzIGFwcGVhciBlYXJsaWVyIGluIHRoZSBjb250ZXh0IG1lbnVcbiAgICogKGkuZS4sIGl0ZW1zIGFwcGVhciBpbiBudW1lcmljYWwgb3JkZXIgd2l0aCByZXNwZWN0IHRvIHByaW9yaXR5KS5cbiAgICpcbiAgICogQHJldHVybiBvYmplY3Qgd2hvc2UgZGlzcG9zZSgpIG1ldGhvZCBjYW4gYmUgdXNlZCB0byByZW1vdmUgdGhlIG1lbnUgaXRlbSBmcm9tIHRoaXMgb2JqZWN0LlxuICAgKi9cbiAgYWRkSXRlbShpdGVtOiBhdG9tJENvbnRleHRNZW51SXRlbSwgcHJpb3JpdHk6IG51bWJlcik6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCB2YWx1ZSA9IHt0eXBlOiAnaXRlbScsIGl0ZW0sIHByaW9yaXR5fTtcbiAgICByZXR1cm4gdGhpcy5fYWRkSXRlbVRvTGlzdCh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyB0aGUgc3BlY2lmaWVkIHN1Ym1lbnUgdG8gdGhpcyBjb250ZW54dCBtZW51LlxuICAgKlxuICAgKiBJdGVtcyB3aXRoIGxvd2VyIHByaW9yaXR5IHZhbHVlcyBhcHBlYXIgZWFybGllciBpbiB0aGUgY29udGV4dCBtZW51XG4gICAqIChpLmUuLCBpdGVtcyBhcHBlYXIgaW4gbnVtZXJpY2FsIG9yZGVyIHdpdGggcmVzcGVjdCB0byBwcmlvcml0eSkuXG4gICAqXG4gICAqIEByZXR1cm4gb2JqZWN0IHdob3NlIGRpc3Bvc2UoKSBtZXRob2QgY2FuIGJlIHVzZWQgdG8gcmVtb3ZlIHRoZSBzdWJtZW51IGZyb20gdGhpcyBvYmplY3QuXG4gICAqL1xuICBhZGRTdWJtZW51KGNvbnRleHRNZW51OiBDb250ZXh0TWVudSwgcHJpb3JpdHk6IG51bWJlcik6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCB2YWx1ZSA9IHt0eXBlOiAnbWVudScsIG1lbnU6IGNvbnRleHRNZW51LCBwcmlvcml0eX07XG4gICAgcmV0dXJuIHRoaXMuX2FkZEl0ZW1Ub0xpc3QodmFsdWUpO1xuICB9XG5cbiAgX2FkZEl0ZW1Ub0xpc3QodmFsdWU6IEludGVybmFsSXRlbSk6IElEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9pdGVtcy5wdXNoKHZhbHVlKTtcbiAgICB0aGlzLl9uZWVkc1NvcnQgPSB0cnVlO1xuICAgIHByb2Nlc3MubmV4dFRpY2sodGhpcy5fc29ydCk7XG5cbiAgICAvLyBUT0RPKG1ib2xpbik6IElkZWFsbHksIHRoaXMgRGlzcG9zYWJsZSBzaG91bGQgYmUgZ2FyYmFnZS1jb2xsZWN0ZWQgaWYgdGhpcyBDb250ZXh0TWVudSBpc1xuICAgIC8vIGRpc3Bvc2VkLlxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2l0ZW1zLmluZGV4T2YodmFsdWUpO1xuICAgICAgdGhpcy5faXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgLy8gV2UgbmVlZCB0byBpbnZva2UgX3NvcnQgZm9yIHRoZSBtYW5hZ2VtZW50IG9mIHRoaXMuX2Rpc3Bvc2FibGUgYW5kIGF0b20uY29udGV4dE1lbnUuYWRkLlxuICAgICAgdGhpcy5fbmVlZHNTb3J0ID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3NvcnQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBtdXN0IGJlIGludm9rZWQgYWZ0ZXIgdGhpcy5faXRlbXMgaGFzIGJlZW4gbW9kaWZpZWQuIElmIG5lY2Vzc2FyeSwgaXQgd2lsbCByZW1vdmVcbiAgICogYWxsIGl0ZW1zIHRoYXQgdGhpcyBvYmplY3QgcHJldmlvdXNseSByZWdpc3RlcmVkIHdpdGggQXRvbSdzIENvbnRleHRNZW51TWFuYWdlci4gVGhlbiBpdCB3aWxsXG4gICAqIHJlLXJlZ2lzdGVyIGV2ZXJ5dGhpbmcgaW4gdGhpcy5faXRlbXMgb25jZSBpdCBoYXMgYmVlbiBzb3J0ZWQuXG4gICAqL1xuICBfc29ydCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX25lZWRzU29ydCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX25lZWRzU29ydCA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWVudU9wdGlvbnMgPSB0aGlzLl9tZW51T3B0aW9ucztcbiAgICBpZiAobWVudU9wdGlvbnMudHlwZSA9PT0gJ3Jvb3QnKSB7XG4gICAgICBjb25zdCBpdGVtcyA9IHRoaXMuX3NvcnRBbmRGaWx0ZXJJdGVtcygpO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZSA9IGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICAgW21lbnVPcHRpb25zLmNzc1NlbGVjdG9yXTogaXRlbXMubWFwKHRoaXMuX2NvbnRleHRNZW51SXRlbUZvckludGVybmFsSXRlbSwgdGhpcyksXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKG1lbnVPcHRpb25zLnR5cGUgPT09ICdzdWJtZW51Jykge1xuICAgICAgLy8gVGVsbCB0aGUgcGFyZW50IG1lbnUgdG8gc29ydCBpdHNlbGYuXG4gICAgICBtZW51T3B0aW9ucy5wYXJlbnQuX25lZWRzU29ydCA9IHRydWU7XG4gICAgICBtZW51T3B0aW9ucy5wYXJlbnQuX3NvcnQoKTtcbiAgICB9XG4gIH1cblxuICAvKiogVHJhbnNsYXRlcyB0aGlzIG9iamVjdCdzIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIGEgbWVudSBpdGVtIHRvIEF0b20ncyByZXByZXNlbnRhdGlvbi4gKi9cbiAgX2NvbnRleHRNZW51SXRlbUZvckludGVybmFsSXRlbShpbnRlcm5hbEl0ZW06IEludGVybmFsSXRlbSk6IGF0b20kQ29udGV4dE1lbnVJdGVtIHtcbiAgICBpZiAoaW50ZXJuYWxJdGVtLnR5cGUgPT09ICdpdGVtJykge1xuICAgICAgcmV0dXJuIGludGVybmFsSXRlbS5pdGVtO1xuICAgIH0gZWxzZSBpZiAoaW50ZXJuYWxJdGVtLnR5cGUgPT09ICdtZW51Jykge1xuICAgICAgLy8gTm90ZSB0aGF0IGR1ZSB0byBvdXIgb3duIHN0cmljdCByZW5hbWluZyBydWxlcywgdGhpcyBtdXN0IGJlIGEgcHJpdmF0ZSBtZXRob2QgaW5zdGVhZCBvZiBhXG4gICAgICAvLyBzdGF0aWMgZnVuY3Rpb24gYmVjdWFzZSBvZiB0aGUgYWNjZXNzIHRvIF9tZW51T3B0aW9ucyBhbmQgX2l0ZW1zLlxuICAgICAgY29uc3QgbWVudU9wdGlvbnMgPSBpbnRlcm5hbEl0ZW0ubWVudS5fbWVudU9wdGlvbnM7XG4gICAgICBpbnZhcmlhbnQobWVudU9wdGlvbnMudHlwZSA9PT0gJ3N1Ym1lbnUnKTtcbiAgICAgIGNvbnN0IGl0ZW1zID0gaW50ZXJuYWxJdGVtLm1lbnUuX3NvcnRBbmRGaWx0ZXJJdGVtcygpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGFiZWw6IG1lbnVPcHRpb25zLmxhYmVsLFxuICAgICAgICBzdWJtZW51OiBpdGVtcy5tYXAodGhpcy5fY29udGV4dE1lbnVJdGVtRm9ySW50ZXJuYWxJdGVtLCB0aGlzKSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudChmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgX3NvcnRBbmRGaWx0ZXJJdGVtcygpOiBBcnJheTxJbnRlcm5hbEl0ZW0+IHtcbiAgICBjb25zdCBpdGVtcyA9IHRoaXMuX2l0ZW1zLmZpbHRlcigoaXRlbTogSW50ZXJuYWxJdGVtKSA9PiB7XG4gICAgICBpZiAoaXRlbS50eXBlID09PSAnaXRlbScpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PT0gJ21lbnUnKSB7XG4gICAgICAgIGNvbnN0IGNvbnRleHRNZW51ID0gaXRlbS5tZW51O1xuICAgICAgICByZXR1cm4gIWNvbnRleHRNZW51LmlzRW1wdHkoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpdGVtcy5zb3J0KGNvbXBhcmVJbnRlcm5hbEl0ZW1zKTtcbiAgICByZXR1cm4gaXRlbXM7XG4gIH1cblxuICAvKiogUmVtb3ZlcyBhbGwgaXRlbXMgdGhpcyBvYmplY3QgaGFzIGFkZGVkIHRvIEF0b20ncyBDb250ZXh0TWVudU1hbmFnZXIuICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fbmVlZHNTb3J0ID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2l0ZW1zLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuLyoqIENvbXBhcmF0b3IgdXNlZCB0byBzb3J0IG1lbnUgaXRlbXMgYnkgcHJpb3JpdHk6IGxvd2VyIHByaW9yaXRpZXMgYXBwZWFyIGVhcmxpZXIuICovXG5mdW5jdGlvbiBjb21wYXJlSW50ZXJuYWxJdGVtcyhhOiBJbnRlcm5hbEl0ZW0sIGI6IEludGVybmFsSXRlbSk6IG51bWJlciB7XG4gIHJldHVybiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eTtcbn1cbiJdfQ==