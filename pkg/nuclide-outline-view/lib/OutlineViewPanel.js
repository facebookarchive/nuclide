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

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideUiLibPanelComponent = require('../../nuclide-ui/lib/PanelComponent');

var _nuclideUiLibPanelComponentScroller = require('../../nuclide-ui/lib/PanelComponentScroller');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

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
    key: 'show',
    value: function show() {
      if (!this.isVisible()) {
        this._show();
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (this.isVisible()) {
        this._hide();
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

      (0, _nuclideAnalytics.track)('nuclide-outline-view-show');

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
    //
    // Use 'flex' to fit Atom v1.6.0+ and `height: inherit` to fit Atom <v1.6.0. The latter uses
    // `height: 100%;` down the hierarchy and becomes innocuous in 1.6.0 because inheriting will
    // give `height: auto;`.
    this._panelDOMElement.style.display = 'flex';
    this._panelDOMElement.style.height = 'inherit';

    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
      _nuclideUiLibPanelComponent.PanelComponent,
      {
        dock: 'right',
        initialLength: initialWidth,
        noScroll: true,
        onResize: onResize },
      _reactForAtom.React.createElement(
        'div',
        { style: { display: 'flex', 'flex-direction': 'column', 'width': '100%' } },
        _reactForAtom.React.createElement(OutlineViewHeader, null),
        _reactForAtom.React.createElement(
          _nuclideUiLibPanelComponentScroller.PanelComponentScroller,
          null,
          _reactForAtom.React.createElement(_OutlineView.OutlineView, { outlines: outlines })
        )
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
      return(
        // Because the container is flex, prevent this header from shrinking smaller than its
        // contents. The default for flex children is to shrink as needed.
        _reactForAtom.React.createElement(
          'div',
          { className: 'panel-heading', style: { 'flex-shrink': 0 } },
          _reactForAtom.React.createElement('span', { className: 'icon icon-list-unordered' }),
          'Outline View',
          _reactForAtom.React.createElement(_nuclideUiLibButton.Button, {
            className: 'pull-right nuclide-outline-view-close-button',
            size: _nuclideUiLibButton.ButtonSizes.EXTRA_SMALL,
            icon: 'x',
            onClick: hideOutlineView,
            title: 'Hide Outline View'
          })
        )
      );
    }
  }]);

  return OutlineViewHeader;
})(_reactForAtom.React.Component);

function hideOutlineView() {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-outline-view:hide');
}
//# sourceMappingURL=data:application/json;base64,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QUFlLEFBQUM7QUFDekIsaUJBQUssRUFBQyxtQkFBbUI7WUFDekI7U0FDRTtRQUNOO0tBQ0g7OztTQWpCRyxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTOztBQW9CL0MsU0FBUyxlQUFlLEdBQUc7QUFDekIsTUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsMkJBQTJCLENBQzVCLENBQUM7Q0FDSCIsImZpbGUiOiJPdXRsaW5lVmlld1BhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQgdHlwZSB7T3V0bGluZUZvclVpfSBmcm9tICcuLic7XG5cbmltcG9ydCB7UmVhY3QsIFJlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7UGFuZWxDb21wb25lbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1BhbmVsQ29tcG9uZW50JztcbmltcG9ydCB7UGFuZWxDb21wb25lbnRTY3JvbGxlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvUGFuZWxDb21wb25lbnRTY3JvbGxlcic7XG5pbXBvcnQge1xuICBCdXR0b24sXG4gIEJ1dHRvblNpemVzLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b24nO1xuaW1wb3J0IHtPdXRsaW5lVmlld30gZnJvbSAnLi9PdXRsaW5lVmlldyc7XG5cbmV4cG9ydCBjbGFzcyBPdXRsaW5lVmlld1BhbmVsU3RhdGUge1xuICBfb3V0bGluZXM6IE9ic2VydmFibGU8T3V0bGluZUZvclVpPjtcbiAgX291dGxpbmVWaWV3UGFuZWw6ID9PdXRsaW5lVmlld1BhbmVsO1xuICBfd2lkdGg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihvdXRsaW5lczogT2JzZXJ2YWJsZTxPdXRsaW5lRm9yVWk+LCB3aWR0aDogbnVtYmVyLCB2aXNpYmxlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fb3V0bGluZXMgPSBvdXRsaW5lcztcbiAgICB0aGlzLl9vdXRsaW5lVmlld1BhbmVsID0gbnVsbDtcbiAgICB0aGlzLl93aWR0aCA9IHdpZHRoO1xuXG4gICAgaWYgKHZpc2libGUpIHtcbiAgICAgIHRoaXMuX3Nob3coKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLl9kZXN0cm95UGFuZWwoKTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuX2hpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIHNob3coKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLl9zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgaGlkZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgdGhpcy5faGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldFdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG5cbiAgaXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9vdXRsaW5lVmlld1BhbmVsICE9IG51bGw7XG4gIH1cblxuICBfc2hvdygpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fb3V0bGluZVZpZXdQYW5lbCA9PSBudWxsKTtcblxuICAgIHRyYWNrKCdudWNsaWRlLW91dGxpbmUtdmlldy1zaG93Jyk7XG5cbiAgICB0aGlzLl9vdXRsaW5lVmlld1BhbmVsID0gbmV3IE91dGxpbmVWaWV3UGFuZWwoXG4gICAgICB0aGlzLl9vdXRsaW5lcyxcbiAgICAgIHRoaXMuX3dpZHRoLFxuICAgICAgdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKSxcbiAgICApO1xuICB9XG5cbiAgX2hpZGUoKTogdm9pZCB7XG4gICAgdGhpcy5fZGVzdHJveVBhbmVsKCk7XG4gIH1cblxuICBfZGVzdHJveVBhbmVsKCk6IHZvaWQge1xuICAgIGNvbnN0IG91dGxpbmVWaWV3UGFuZWwgPSB0aGlzLl9vdXRsaW5lVmlld1BhbmVsO1xuICAgIGludmFyaWFudChvdXRsaW5lVmlld1BhbmVsICE9IG51bGwpO1xuXG4gICAgb3V0bGluZVZpZXdQYW5lbC5kaXNwb3NlKCk7XG4gICAgdGhpcy5fb3V0bGluZVZpZXdQYW5lbCA9IG51bGw7XG4gIH1cblxuICBfb25SZXNpemUobmV3V2lkdGg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX3dpZHRoID0gbmV3V2lkdGg7XG4gIH1cbn1cblxuY2xhc3MgT3V0bGluZVZpZXdQYW5lbCB7XG4gIF9wYW5lbERPTUVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBfcGFuZWw6IGF0b20kUGFuZWw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgb3V0bGluZXM6IE9ic2VydmFibGU8T3V0bGluZUZvclVpPixcbiAgICBpbml0aWFsV2lkdGg6IG51bWJlcixcbiAgICBvblJlc2l6ZTogKHdpZHRoOiBudW1iZXIpID0+IHZvaWQsXG4gICkge1xuICAgIHRoaXMuX3BhbmVsRE9NRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIC8vIE90aGVyd2lzZSBpdCBkb2VzIG5vdCBmaWxsIHRoZSB3aG9sZSBwYW5lbCwgd2hpY2ggbWlnaHQgYmUgYWxyaWdodCBleGNlcHQgaXQgbWVhbnMgdGhhdCB0aGVcbiAgICAvLyByZXNpemUtaGFuZGxlIGRvZXNuJ3QgZXh0ZW5kIGFsbCB0aGUgd2F5IHRvIHRoZSBib3R0b20uXG4gICAgLy9cbiAgICAvLyBVc2UgJ2ZsZXgnIHRvIGZpdCBBdG9tIHYxLjYuMCsgYW5kIGBoZWlnaHQ6IGluaGVyaXRgIHRvIGZpdCBBdG9tIDx2MS42LjAuIFRoZSBsYXR0ZXIgdXNlc1xuICAgIC8vIGBoZWlnaHQ6IDEwMCU7YCBkb3duIHRoZSBoaWVyYXJjaHkgYW5kIGJlY29tZXMgaW5ub2N1b3VzIGluIDEuNi4wIGJlY2F1c2UgaW5oZXJpdGluZyB3aWxsXG4gICAgLy8gZ2l2ZSBgaGVpZ2h0OiBhdXRvO2AuXG4gICAgdGhpcy5fcGFuZWxET01FbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgdGhpcy5fcGFuZWxET01FbGVtZW50LnN0eWxlLmhlaWdodCA9ICdpbmhlcml0JztcblxuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxQYW5lbENvbXBvbmVudFxuICAgICAgICBkb2NrPVwicmlnaHRcIlxuICAgICAgICBpbml0aWFsTGVuZ3RoPXtpbml0aWFsV2lkdGh9XG4gICAgICAgIG5vU2Nyb2xsXG4gICAgICAgIG9uUmVzaXplPXtvblJlc2l6ZX0+XG4gICAgICAgIDxkaXYgc3R5bGU9e3tkaXNwbGF5OiAnZmxleCcsICdmbGV4LWRpcmVjdGlvbic6ICdjb2x1bW4nLCAnd2lkdGgnOiAnMTAwJSd9fT5cbiAgICAgICAgICA8T3V0bGluZVZpZXdIZWFkZXIgLz5cbiAgICAgICAgICA8UGFuZWxDb21wb25lbnRTY3JvbGxlcj5cbiAgICAgICAgICAgIDxPdXRsaW5lVmlldyBvdXRsaW5lcz17b3V0bGluZXN9IC8+XG4gICAgICAgICAgPC9QYW5lbENvbXBvbmVudFNjcm9sbGVyPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvUGFuZWxDb21wb25lbnQ+LFxuICAgICAgdGhpcy5fcGFuZWxET01FbGVtZW50LFxuICAgICk7XG4gICAgdGhpcy5fcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRSaWdodFBhbmVsKHtcbiAgICAgIGl0ZW06IHRoaXMuX3BhbmVsRE9NRWxlbWVudCxcbiAgICAgIHByaW9yaXR5OiAyMDAsXG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5fcGFuZWxET01FbGVtZW50KTtcbiAgICB0aGlzLl9wYW5lbC5kZXN0cm95KCk7XG4gIH1cbn1cblxuY2xhc3MgT3V0bGluZVZpZXdIZWFkZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIC8vIEJlY2F1c2UgdGhlIGNvbnRhaW5lciBpcyBmbGV4LCBwcmV2ZW50IHRoaXMgaGVhZGVyIGZyb20gc2hyaW5raW5nIHNtYWxsZXIgdGhhbiBpdHNcbiAgICAgIC8vIGNvbnRlbnRzLiBUaGUgZGVmYXVsdCBmb3IgZmxleCBjaGlsZHJlbiBpcyB0byBzaHJpbmsgYXMgbmVlZGVkLlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1oZWFkaW5nXCIgc3R5bGU9e3snZmxleC1zaHJpbmsnOiAwfX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1saXN0LXVub3JkZXJlZFwiIC8+XG4gICAgICAgIE91dGxpbmUgVmlld1xuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwicHVsbC1yaWdodCBudWNsaWRlLW91dGxpbmUtdmlldy1jbG9zZS1idXR0b25cIlxuICAgICAgICAgIHNpemU9e0J1dHRvblNpemVzLkVYVFJBX1NNQUxMfVxuICAgICAgICAgIGljb249XCJ4XCJcbiAgICAgICAgICBvbkNsaWNrPXtoaWRlT3V0bGluZVZpZXd9XG4gICAgICAgICAgdGl0bGU9XCJIaWRlIE91dGxpbmUgVmlld1wiXG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhpZGVPdXRsaW5lVmlldygpIHtcbiAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICdudWNsaWRlLW91dGxpbmUtdmlldzpoaWRlJ1xuICApO1xufVxuIl19