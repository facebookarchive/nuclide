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
          _reactForAtom.React.createElement('button', {
            className: 'btn btn-xs icon icon-x pull-right nuclide-outline-view-close-button',
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
//# sourceMappingURL=data:application/json;base64,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R0FBUyxvQkFBTSxTQUFTOztBQWtCL0MsU0FBUyxlQUFlLEdBQUc7QUFDekIsTUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsMkJBQTJCLENBQzVCLENBQUM7Q0FDSCIsImZpbGUiOiJPdXRsaW5lVmlld1BhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCB0eXBlIHtPdXRsaW5lRm9yVWl9IGZyb20gJy4uJztcblxuaW1wb3J0IHtSZWFjdCwgUmVhY3RET019IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtQYW5lbENvbXBvbmVudH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvUGFuZWxDb21wb25lbnQnO1xuaW1wb3J0IHtQYW5lbENvbXBvbmVudFNjcm9sbGVyfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9QYW5lbENvbXBvbmVudFNjcm9sbGVyJztcbmltcG9ydCB7T3V0bGluZVZpZXd9IGZyb20gJy4vT3V0bGluZVZpZXcnO1xuXG5leHBvcnQgY2xhc3MgT3V0bGluZVZpZXdQYW5lbFN0YXRlIHtcbiAgX291dGxpbmVzOiBPYnNlcnZhYmxlPE91dGxpbmVGb3JVaT47XG4gIF9vdXRsaW5lVmlld1BhbmVsOiA/T3V0bGluZVZpZXdQYW5lbDtcbiAgX3dpZHRoOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Iob3V0bGluZXM6IE9ic2VydmFibGU8T3V0bGluZUZvclVpPiwgd2lkdGg6IG51bWJlciwgdmlzaWJsZTogYm9vbGVhbikge1xuICAgIHRoaXMuX291dGxpbmVzID0gb3V0bGluZXM7XG4gICAgdGhpcy5fb3V0bGluZVZpZXdQYW5lbCA9IG51bGw7XG4gICAgdGhpcy5fd2lkdGggPSB3aWR0aDtcblxuICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICB0aGlzLl9zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgdGhpcy5fZGVzdHJveVBhbmVsKCk7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLl9oaWRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Nob3coKTtcbiAgICB9XG4gIH1cblxuICBzaG93KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgdGhpcy5fc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIGhpZGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHRoaXMuX2hpZGUoKTtcbiAgICB9XG4gIH1cblxuICBnZXRXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl93aWR0aDtcbiAgfVxuXG4gIGlzVmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fb3V0bGluZVZpZXdQYW5lbCAhPSBudWxsO1xuICB9XG5cbiAgX3Nob3coKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX291dGxpbmVWaWV3UGFuZWwgPT0gbnVsbCk7XG5cbiAgICB0cmFjaygnbnVjbGlkZS1vdXRsaW5lLXZpZXctc2hvdycpO1xuXG4gICAgdGhpcy5fb3V0bGluZVZpZXdQYW5lbCA9IG5ldyBPdXRsaW5lVmlld1BhbmVsKFxuICAgICAgdGhpcy5fb3V0bGluZXMsXG4gICAgICB0aGlzLl93aWR0aCxcbiAgICAgIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcyksXG4gICAgKTtcbiAgfVxuXG4gIF9oaWRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rlc3Ryb3lQYW5lbCgpO1xuICB9XG5cbiAgX2Rlc3Ryb3lQYW5lbCgpOiB2b2lkIHtcbiAgICBjb25zdCBvdXRsaW5lVmlld1BhbmVsID0gdGhpcy5fb3V0bGluZVZpZXdQYW5lbDtcbiAgICBpbnZhcmlhbnQob3V0bGluZVZpZXdQYW5lbCAhPSBudWxsKTtcblxuICAgIG91dGxpbmVWaWV3UGFuZWwuZGlzcG9zZSgpO1xuICAgIHRoaXMuX291dGxpbmVWaWV3UGFuZWwgPSBudWxsO1xuICB9XG5cbiAgX29uUmVzaXplKG5ld1dpZHRoOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl93aWR0aCA9IG5ld1dpZHRoO1xuICB9XG59XG5cbmNsYXNzIE91dGxpbmVWaWV3UGFuZWwge1xuICBfcGFuZWxET01FbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgX3BhbmVsOiBhdG9tJFBhbmVsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG91dGxpbmVzOiBPYnNlcnZhYmxlPE91dGxpbmVGb3JVaT4sXG4gICAgaW5pdGlhbFdpZHRoOiBudW1iZXIsXG4gICAgb25SZXNpemU6ICh3aWR0aDogbnVtYmVyKSA9PiB2b2lkLFxuICApIHtcbiAgICB0aGlzLl9wYW5lbERPTUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAvLyBPdGhlcndpc2UgaXQgZG9lcyBub3QgZmlsbCB0aGUgd2hvbGUgcGFuZWwsIHdoaWNoIG1pZ2h0IGJlIGFscmlnaHQgZXhjZXB0IGl0IG1lYW5zIHRoYXQgdGhlXG4gICAgLy8gcmVzaXplLWhhbmRsZSBkb2Vzbid0IGV4dGVuZCBhbGwgdGhlIHdheSB0byB0aGUgYm90dG9tLlxuICAgIC8vXG4gICAgLy8gVXNlICdmbGV4JyB0byBmaXQgQXRvbSB2MS42LjArIGFuZCBgaGVpZ2h0OiBpbmhlcml0YCB0byBmaXQgQXRvbSA8djEuNi4wLiBUaGUgbGF0dGVyIHVzZXNcbiAgICAvLyBgaGVpZ2h0OiAxMDAlO2AgZG93biB0aGUgaGllcmFyY2h5IGFuZCBiZWNvbWVzIGlubm9jdW91cyBpbiAxLjYuMCBiZWNhdXNlIGluaGVyaXRpbmcgd2lsbFxuICAgIC8vIGdpdmUgYGhlaWdodDogYXV0bztgLlxuICAgIHRoaXMuX3BhbmVsRE9NRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgIHRoaXMuX3BhbmVsRE9NRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnaW5oZXJpdCc7XG5cbiAgICBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8UGFuZWxDb21wb25lbnRcbiAgICAgICAgZG9jaz1cInJpZ2h0XCJcbiAgICAgICAgaW5pdGlhbExlbmd0aD17aW5pdGlhbFdpZHRofVxuICAgICAgICBub1Njcm9sbFxuICAgICAgICBvblJlc2l6ZT17b25SZXNpemV9PlxuICAgICAgICA8ZGl2IHN0eWxlPXt7ZGlzcGxheTogJ2ZsZXgnLCAnZmxleC1kaXJlY3Rpb24nOiAnY29sdW1uJywgJ3dpZHRoJzogJzEwMCUnfX0+XG4gICAgICAgICAgPE91dGxpbmVWaWV3SGVhZGVyIC8+XG4gICAgICAgICAgPFBhbmVsQ29tcG9uZW50U2Nyb2xsZXI+XG4gICAgICAgICAgICA8T3V0bGluZVZpZXcgb3V0bGluZXM9e291dGxpbmVzfSAvPlxuICAgICAgICAgIDwvUGFuZWxDb21wb25lbnRTY3JvbGxlcj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1BhbmVsQ29tcG9uZW50PixcbiAgICAgIHRoaXMuX3BhbmVsRE9NRWxlbWVudCxcbiAgICApO1xuICAgIHRoaXMuX3BhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkUmlnaHRQYW5lbCh7XG4gICAgICBpdGVtOiB0aGlzLl9wYW5lbERPTUVsZW1lbnQsXG4gICAgICBwcmlvcml0eTogMjAwLFxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX3BhbmVsRE9NRWxlbWVudCk7XG4gICAgdGhpcy5fcGFuZWwuZGVzdHJveSgpO1xuICB9XG59XG5cbmNsYXNzIE91dGxpbmVWaWV3SGVhZGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICAvLyBCZWNhdXNlIHRoZSBjb250YWluZXIgaXMgZmxleCwgcHJldmVudCB0aGlzIGhlYWRlciBmcm9tIHNocmlua2luZyBzbWFsbGVyIHRoYW4gaXRzXG4gICAgICAvLyBjb250ZW50cy4gVGhlIGRlZmF1bHQgZm9yIGZsZXggY2hpbGRyZW4gaXMgdG8gc2hyaW5rIGFzIG5lZWRlZC5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFuZWwtaGVhZGluZ1wiIHN0eWxlPXt7J2ZsZXgtc2hyaW5rJzogMH19PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tbGlzdC11bm9yZGVyZWRcIiAvPlxuICAgICAgICBPdXRsaW5lIFZpZXdcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4teHMgaWNvbiBpY29uLXggcHVsbC1yaWdodCBudWNsaWRlLW91dGxpbmUtdmlldy1jbG9zZS1idXR0b25cIlxuICAgICAgICAgIG9uQ2xpY2s9e2hpZGVPdXRsaW5lVmlld31cbiAgICAgICAgICB0aXRsZT1cIkhpZGUgT3V0bGluZSBWaWV3XCJcbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGlkZU91dGxpbmVWaWV3KCkge1xuICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgJ251Y2xpZGUtb3V0bGluZS12aWV3OmhpZGUnXG4gICk7XG59XG4iXX0=