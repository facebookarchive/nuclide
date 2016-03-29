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
    this._panelDOMElement.style.height = '100%';

    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
      'div',
      { style: { height: '100%' } },
      _reactForAtom.React.createElement(OutlineViewHeader, null),
      _reactForAtom.React.createElement(
        _nuclideUiLibPanelComponent.PanelComponent,
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
        'Outline View',
        _reactForAtom.React.createElement('button', {
          className: 'pull-right btn icon icon-x nuclide-outline-view-close-button',
          onClick: hideOutlineView
        })
      );
    }
  }]);

  return OutlineViewHeader;
})(_reactForAtom.React.Component);

function hideOutlineView() {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-outline-view:hide');
}
//# sourceMappingURL=data:application/json;base64,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IEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IHR5cGUge091dGxpbmVGb3JVaX0gZnJvbSAnLi4nO1xuXG5pbXBvcnQge1JlYWN0LCBSZWFjdERPTX0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge1BhbmVsQ29tcG9uZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9QYW5lbENvbXBvbmVudCc7XG5pbXBvcnQge091dGxpbmVWaWV3fSBmcm9tICcuL091dGxpbmVWaWV3JztcblxuZXhwb3J0IGNsYXNzIE91dGxpbmVWaWV3UGFuZWxTdGF0ZSB7XG4gIF9vdXRsaW5lczogT2JzZXJ2YWJsZTxPdXRsaW5lRm9yVWk+O1xuICBfb3V0bGluZVZpZXdQYW5lbDogP091dGxpbmVWaWV3UGFuZWw7XG4gIF93aWR0aDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG91dGxpbmVzOiBPYnNlcnZhYmxlPE91dGxpbmVGb3JVaT4sIHdpZHRoOiBudW1iZXIsIHZpc2libGU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9vdXRsaW5lcyA9IG91dGxpbmVzO1xuICAgIHRoaXMuX291dGxpbmVWaWV3UGFuZWwgPSBudWxsO1xuICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XG5cbiAgICBpZiAodmlzaWJsZSkge1xuICAgICAgdGhpcy5fc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lbCgpO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgdGhpcy5faGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgc2hvdygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuX3Nob3coKTtcbiAgICB9XG4gIH1cblxuICBoaWRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLl9oaWRlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0V2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cblxuICBpc1Zpc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX291dGxpbmVWaWV3UGFuZWwgIT0gbnVsbDtcbiAgfVxuXG4gIF9zaG93KCk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9vdXRsaW5lVmlld1BhbmVsID09IG51bGwpO1xuXG4gICAgdHJhY2soJ251Y2xpZGUtb3V0bGluZS12aWV3LXNob3cnKTtcblxuICAgIHRoaXMuX291dGxpbmVWaWV3UGFuZWwgPSBuZXcgT3V0bGluZVZpZXdQYW5lbChcbiAgICAgIHRoaXMuX291dGxpbmVzLFxuICAgICAgdGhpcy5fd2lkdGgsXG4gICAgICB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpLFxuICAgICk7XG4gIH1cblxuICBfaGlkZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kZXN0cm95UGFuZWwoKTtcbiAgfVxuXG4gIF9kZXN0cm95UGFuZWwoKTogdm9pZCB7XG4gICAgY29uc3Qgb3V0bGluZVZpZXdQYW5lbCA9IHRoaXMuX291dGxpbmVWaWV3UGFuZWw7XG4gICAgaW52YXJpYW50KG91dGxpbmVWaWV3UGFuZWwgIT0gbnVsbCk7XG5cbiAgICBvdXRsaW5lVmlld1BhbmVsLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9vdXRsaW5lVmlld1BhbmVsID0gbnVsbDtcbiAgfVxuXG4gIF9vblJlc2l6ZShuZXdXaWR0aDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fd2lkdGggPSBuZXdXaWR0aDtcbiAgfVxufVxuXG5jbGFzcyBPdXRsaW5lVmlld1BhbmVsIHtcbiAgX3BhbmVsRE9NRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIF9wYW5lbDogYXRvbSRQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBvdXRsaW5lczogT2JzZXJ2YWJsZTxPdXRsaW5lRm9yVWk+LFxuICAgIGluaXRpYWxXaWR0aDogbnVtYmVyLFxuICAgIG9uUmVzaXplOiAod2lkdGg6IG51bWJlcikgPT4gdm9pZCxcbiAgKSB7XG4gICAgdGhpcy5fcGFuZWxET01FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgLy8gT3RoZXJ3aXNlIGl0IGRvZXMgbm90IGZpbGwgdGhlIHdob2xlIHBhbmVsLCB3aGljaCBtaWdodCBiZSBhbHJpZ2h0IGV4Y2VwdCBpdCBtZWFucyB0aGF0IHRoZVxuICAgIC8vIHJlc2l6ZS1oYW5kbGUgZG9lc24ndCBleHRlbmQgYWxsIHRoZSB3YXkgdG8gdGhlIGJvdHRvbS5cbiAgICB0aGlzLl9wYW5lbERPTUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuXG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgPGRpdiBzdHlsZT17e2hlaWdodDogJzEwMCUnfX0+XG4gICAgICAgIDxPdXRsaW5lVmlld0hlYWRlciAvPlxuICAgICAgICA8UGFuZWxDb21wb25lbnRcbiAgICAgICAgICBkb2NrPVwicmlnaHRcIlxuICAgICAgICAgIGluaXRpYWxMZW5ndGg9e2luaXRpYWxXaWR0aH1cbiAgICAgICAgICBvblJlc2l6ZT17b25SZXNpemV9PlxuICAgICAgICAgIDxPdXRsaW5lVmlldyBvdXRsaW5lcz17b3V0bGluZXN9IC8+XG4gICAgICAgIDwvUGFuZWxDb21wb25lbnQ+XG4gICAgICA8L2Rpdj4sXG4gICAgICB0aGlzLl9wYW5lbERPTUVsZW1lbnQsXG4gICAgKTtcbiAgICB0aGlzLl9wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoe1xuICAgICAgaXRlbTogdGhpcy5fcGFuZWxET01FbGVtZW50LFxuICAgICAgcHJpb3JpdHk6IDIwMCxcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9wYW5lbERPTUVsZW1lbnQpO1xuICAgIHRoaXMuX3BhbmVsLmRlc3Ryb3koKTtcbiAgfVxufVxuXG5jbGFzcyBPdXRsaW5lVmlld0hlYWRlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1oZWFkaW5nXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1saXN0LXVub3JkZXJlZFwiIC8+XG4gICAgICAgIE91dGxpbmUgVmlld1xuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwicHVsbC1yaWdodCBidG4gaWNvbiBpY29uLXggbnVjbGlkZS1vdXRsaW5lLXZpZXctY2xvc2UtYnV0dG9uXCJcbiAgICAgICAgICBvbkNsaWNrPXtoaWRlT3V0bGluZVZpZXd9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhpZGVPdXRsaW5lVmlldygpIHtcbiAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICdudWNsaWRlLW91dGxpbmUtdmlldzpoaWRlJ1xuICApO1xufVxuIl19