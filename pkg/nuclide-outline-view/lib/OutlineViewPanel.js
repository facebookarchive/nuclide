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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactForAtom = require('react-for-atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideUiPanel = require('../../nuclide-ui-panel');

var _OutlineView = require('./OutlineView');

var OutlineViewPanelState = (function () {
  function OutlineViewPanelState(outlines, width, visible) {
    _classCallCheck(this, OutlineViewPanelState);

    this._outlines = outlines;
    this._outlineViewPanel = null;
    this._width = width;

    if (visible) {
      this._show();
    }
  }

  _createClass(OutlineViewPanelState, [{
    key: 'dispose',
    value: function dispose() {
      if (this.isVisible()) {
        this._destroyPanel();
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      if (this.isVisible()) {
        this._hide();
      } else {
        this._show();
      }
    }
  }, {
    key: 'getWidth',
    value: function getWidth() {
      return this._width;
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this._outlineViewPanel != null;
    }
  }, {
    key: '_show',
    value: function _show() {
      (0, _assert2['default'])(this._outlineViewPanel == null);

      this._outlineViewPanel = new OutlineViewPanel(this._outlines, this._width, this._onResize.bind(this));
    }
  }, {
    key: '_hide',
    value: function _hide() {
      this._destroyPanel();
    }
  }, {
    key: '_destroyPanel',
    value: function _destroyPanel() {
      var outlineViewPanel = this._outlineViewPanel;
      (0, _assert2['default'])(outlineViewPanel != null);

      outlineViewPanel.dispose();
      this._outlineViewPanel = null;
    }
  }, {
    key: '_onResize',
    value: function _onResize(newWidth) {
      this._width = newWidth;
    }
  }]);

  return OutlineViewPanelState;
})();

exports.OutlineViewPanelState = OutlineViewPanelState;

var OutlineViewPanel = (function () {
  function OutlineViewPanel(outlines, initialWidth, onResize) {
    _classCallCheck(this, OutlineViewPanel);

    this._panelDOMElement = document.createElement('div');
    // Otherwise it does not fill the whole panel, which might be alright except it means that the
    // resize-handle doesn't extend all the way to the bottom.
    this._panelDOMElement.style.height = '100%';

    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
      'div',
      { style: { height: '100%' } },
      _reactForAtom.React.createElement(OutlineViewHeader, null),
      _reactForAtom.React.createElement(
        _nuclideUiPanel.PanelComponent,
        {
          dock: 'right',
          initialLength: initialWidth,
          onResize: onResize },
        _reactForAtom.React.createElement(_OutlineView.OutlineView, { outlines: outlines })
      )
    ), this._panelDOMElement);
    this._panel = atom.workspace.addRightPanel({
      item: this._panelDOMElement,
      priority: 200
    });
  }

  _createClass(OutlineViewPanel, [{
    key: 'dispose',
    value: function dispose() {
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._panelDOMElement);
      this._panel.destroy();
    }
  }]);

  return OutlineViewPanel;
})();

var OutlineViewHeader = (function (_React$Component) {
  _inherits(OutlineViewHeader, _React$Component);

  function OutlineViewHeader() {
    _classCallCheck(this, OutlineViewHeader);

    _get(Object.getPrototypeOf(OutlineViewHeader.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(OutlineViewHeader, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'panel-heading' },
        _reactForAtom.React.createElement('span', { className: 'icon icon-list-unordered' }),
        'Outline View'
      );
    }
  }]);

  return OutlineViewHeader;
})(_reactForAtom.React.Component);
//# sourceMappingURL=data:application/json;base64,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QUksQ0FBQyxnQkFBZ0I7QUFDM0IsY0FBUSxFQUFFLEdBQUc7S0FDZCxDQUFDLENBQUM7R0FDSjs7ZUE5QkcsZ0JBQWdCOztXQWdDYixtQkFBUztBQUNkLDZCQUFTLHNCQUFzQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3ZELFVBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdkI7OztTQW5DRyxnQkFBZ0I7OztJQXNDaEIsaUJBQWlCO1lBQWpCLGlCQUFpQjs7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OytCQUFqQixpQkFBaUI7OztlQUFqQixpQkFBaUI7O1dBQ2Ysa0JBQWtCO0FBQ3RCLGFBQ0U7O1VBQUssU0FBUyxFQUFDLGVBQWU7UUFDNUIsNENBQU0sU0FBUyxFQUFDLDBCQUEwQixHQUFHOztPQUV6QyxDQUNOO0tBQ0g7OztTQVJHLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiT3V0bGluZVZpZXdQYW5lbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQgdHlwZSB7T3V0bGluZUZvclVpfSBmcm9tICcuLic7XG5cbmltcG9ydCB7UmVhY3QsIFJlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7UGFuZWxDb21wb25lbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWktcGFuZWwnO1xuXG5pbXBvcnQge091dGxpbmVWaWV3fSBmcm9tICcuL091dGxpbmVWaWV3JztcblxuZXhwb3J0IGNsYXNzIE91dGxpbmVWaWV3UGFuZWxTdGF0ZSB7XG4gIF9vdXRsaW5lczogT2JzZXJ2YWJsZTxPdXRsaW5lRm9yVWk+O1xuICBfb3V0bGluZVZpZXdQYW5lbDogP091dGxpbmVWaWV3UGFuZWw7XG4gIF93aWR0aDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG91dGxpbmVzOiBPYnNlcnZhYmxlPE91dGxpbmVGb3JVaT4sIHdpZHRoOiBudW1iZXIsIHZpc2libGU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9vdXRsaW5lcyA9IG91dGxpbmVzO1xuICAgIHRoaXMuX291dGxpbmVWaWV3UGFuZWwgPSBudWxsO1xuICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XG5cbiAgICBpZiAodmlzaWJsZSkge1xuICAgICAgdGhpcy5fc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lbCgpO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgdGhpcy5faGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0V2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cblxuICBpc1Zpc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX291dGxpbmVWaWV3UGFuZWwgIT0gbnVsbDtcbiAgfVxuXG4gIF9zaG93KCk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9vdXRsaW5lVmlld1BhbmVsID09IG51bGwpO1xuXG4gICAgdGhpcy5fb3V0bGluZVZpZXdQYW5lbCA9IG5ldyBPdXRsaW5lVmlld1BhbmVsKFxuICAgICAgdGhpcy5fb3V0bGluZXMsXG4gICAgICB0aGlzLl93aWR0aCxcbiAgICAgIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcyksXG4gICAgKTtcbiAgfVxuXG4gIF9oaWRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rlc3Ryb3lQYW5lbCgpO1xuICB9XG5cbiAgX2Rlc3Ryb3lQYW5lbCgpOiB2b2lkIHtcbiAgICBjb25zdCBvdXRsaW5lVmlld1BhbmVsID0gdGhpcy5fb3V0bGluZVZpZXdQYW5lbDtcbiAgICBpbnZhcmlhbnQob3V0bGluZVZpZXdQYW5lbCAhPSBudWxsKTtcblxuICAgIG91dGxpbmVWaWV3UGFuZWwuZGlzcG9zZSgpO1xuICAgIHRoaXMuX291dGxpbmVWaWV3UGFuZWwgPSBudWxsO1xuICB9XG5cbiAgX29uUmVzaXplKG5ld1dpZHRoOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl93aWR0aCA9IG5ld1dpZHRoO1xuICB9XG59XG5cbmNsYXNzIE91dGxpbmVWaWV3UGFuZWwge1xuICBfcGFuZWxET01FbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgX3BhbmVsOiBhdG9tJFBhbmVsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG91dGxpbmVzOiBPYnNlcnZhYmxlPE91dGxpbmVGb3JVaT4sXG4gICAgaW5pdGlhbFdpZHRoOiBudW1iZXIsXG4gICAgb25SZXNpemU6ICh3aWR0aDogbnVtYmVyKSA9PiBtaXhlZCxcbiAgKSB7XG4gICAgdGhpcy5fcGFuZWxET01FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgLy8gT3RoZXJ3aXNlIGl0IGRvZXMgbm90IGZpbGwgdGhlIHdob2xlIHBhbmVsLCB3aGljaCBtaWdodCBiZSBhbHJpZ2h0IGV4Y2VwdCBpdCBtZWFucyB0aGF0IHRoZVxuICAgIC8vIHJlc2l6ZS1oYW5kbGUgZG9lc24ndCBleHRlbmQgYWxsIHRoZSB3YXkgdG8gdGhlIGJvdHRvbS5cbiAgICB0aGlzLl9wYW5lbERPTUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuXG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgPGRpdiBzdHlsZT17e2hlaWdodDogJzEwMCUnfX0+XG4gICAgICAgIDxPdXRsaW5lVmlld0hlYWRlciAvPlxuICAgICAgICA8UGFuZWxDb21wb25lbnRcbiAgICAgICAgICBkb2NrPVwicmlnaHRcIlxuICAgICAgICAgIGluaXRpYWxMZW5ndGg9e2luaXRpYWxXaWR0aH1cbiAgICAgICAgICBvblJlc2l6ZT17b25SZXNpemV9PlxuICAgICAgICAgIDxPdXRsaW5lVmlldyBvdXRsaW5lcz17b3V0bGluZXN9IC8+XG4gICAgICAgIDwvUGFuZWxDb21wb25lbnQ+XG4gICAgICA8L2Rpdj4sXG4gICAgICB0aGlzLl9wYW5lbERPTUVsZW1lbnQsXG4gICAgKTtcbiAgICB0aGlzLl9wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoe1xuICAgICAgaXRlbTogdGhpcy5fcGFuZWxET01FbGVtZW50LFxuICAgICAgcHJpb3JpdHk6IDIwMCxcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9wYW5lbERPTUVsZW1lbnQpO1xuICAgIHRoaXMuX3BhbmVsLmRlc3Ryb3koKTtcbiAgfVxufVxuXG5jbGFzcyBPdXRsaW5lVmlld0hlYWRlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1oZWFkaW5nXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1saXN0LXVub3JkZXJlZFwiIC8+XG4gICAgICAgIE91dGxpbmUgVmlld1xuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl19