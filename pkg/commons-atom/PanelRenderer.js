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

/**
 * A class that gives us an idempotent API for rendering panels, creating them lazily.
 */

var PanelRenderer = (function () {
  function PanelRenderer(options) {
    _classCallCheck(this, PanelRenderer);

    this._createItem = options.createItem;
    this._location = options.location;
    this._priority = options.priority;
  }

  _createClass(PanelRenderer, [{
    key: 'render',
    value: function render(props) {
      if (props.visible) {
        if (this._panel == null) {
          var item = this._item == null ? this._item = this._createItem() : this._item;
          this._panel = addPanel(this._location, {
            item: item,
            priority: this._priority == null ? undefined : this._priority
          });
        } else {
          this._panel.show();
        }
      } else if (this._panel != null) {
        this._panel.hide();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._item != null && typeof this._item.destroy === 'function') {
        this._item.destroy();
      }
      if (this._panel != null) {
        this._panel.destroy();
      }
    }
  }]);

  return PanelRenderer;
})();

exports.default = PanelRenderer;

function addPanel(location, options) {
  switch (location) {
    case 'top':
      return atom.workspace.addTopPanel(options);
    case 'right':
      return atom.workspace.addRightPanel(options);
    case 'bottom':
      return atom.workspace.addBottomPanel(options);
    case 'left':
      return atom.workspace.addLeftPanel(options);
    default:
      throw new Error('Invalid location: ' + location);
  }
}
module.exports = exports.default;