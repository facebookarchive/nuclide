var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var UnresolvedBreakpointsSidebarPane = require('./UnresolvedBreakpointsSidebarPane');

// Supress ESLint no-undef about using WebInspector without window, which would
// not have flow types attached.
var WebInspector = window.WebInspector;

/**
 * The App is declared in `module.json` and the highest priority one is loaded
 * by `Main`.
 *
 * The one method, `presentUI` is called by `Main` to attach the UI into the
 * DOM. Here we can inject any modifications into the UI.
 */

var NuclideApp = (function (_WebInspector$App) {
  _inherits(NuclideApp, _WebInspector$App);

  function NuclideApp() {
    _classCallCheck(this, NuclideApp);

    _get(Object.getPrototypeOf(NuclideApp.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NuclideApp, [{
    key: 'presentUI',
    value: function presentUI() {
      var _this = this;

      var rootView = new WebInspector.RootView();
      WebInspector.inspectorView.show(rootView.element);
      WebInspector.inspectorView.panel('sources').then(function (panel) {
        // Force Sources view to hide the editor.
        var sourcesPanel = panel;
        sourcesPanel._splitView.addEventListener(WebInspector.SplitView.Events.ShowModeChanged, _this._forceOnlySidebar, _this);
        sourcesPanel.sidebarPanes.domBreakpoints.setVisible(false);
        sourcesPanel.sidebarPanes.xhrBreakpoints.setVisible(false);
        sourcesPanel.sidebarPanes.eventListenerBreakpoints.setVisible(false);
        sourcesPanel.sidebarPanes.unresolvedBreakpoints = new UnresolvedBreakpointsSidebarPane();
        // Force redraw
        sourcesPanel.sidebarPaneView.detach();
        sourcesPanel.sidebarPaneView = null;
        sourcesPanel._dockSideChanged();

        window.WebInspector.inspectorView.showInitialPanel();
        sourcesPanel._splitView.hideMain();
        rootView.attachToDocument(document);
        /*eslint-disable no-console */
      })['catch'](function (e) {
        return console.error(e);
      });
      /*eslint-enable no-console */

      // Clear breakpoints whenever they are saved to localStorage.
      WebInspector.settings.breakpoints.addChangeListener(this._onBreakpointSettingsChanged, this);
    }
  }, {
    key: '_forceOnlySidebar',
    value: function _forceOnlySidebar(event) {
      if (event.data !== WebInspector.SplitView.ShowMode.OnlySidebar) {
        event.target.hideMain();
      }
    }
  }, {
    key: '_onBreakpointSettingsChanged',
    value: function _onBreakpointSettingsChanged(event) {
      if (event.data.length > 0) {
        WebInspector.settings.breakpoints.set([]);
      }
    }
  }]);

  return NuclideApp;
})(WebInspector.App);

var NuclideAppProvider = (function (_WebInspector$AppProvider) {
  _inherits(NuclideAppProvider, _WebInspector$AppProvider);

  function NuclideAppProvider() {
    _classCallCheck(this, NuclideAppProvider);

    _get(Object.getPrototypeOf(NuclideAppProvider.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NuclideAppProvider, [{
    key: 'createApp',
    value: function createApp() {
      return new NuclideApp();
    }
  }]);

  return NuclideAppProvider;
})(WebInspector.AppProvider);

module.exports = NuclideAppProvider;
//# sourceMappingURL=data:application/json;base64,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QUFHLGtCQUFrQixDQUFDIiwiZmlsZSI6Ik51Y2xpZGVBcHBQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IFVucmVzb2x2ZWRCcmVha3BvaW50c1NpZGViYXJQYW5lID0gcmVxdWlyZSgnLi9VbnJlc29sdmVkQnJlYWtwb2ludHNTaWRlYmFyUGFuZScpO1xuXG4vLyBTdXByZXNzIEVTTGludCBuby11bmRlZiBhYm91dCB1c2luZyBXZWJJbnNwZWN0b3Igd2l0aG91dCB3aW5kb3csIHdoaWNoIHdvdWxkXG4vLyBub3QgaGF2ZSBmbG93IHR5cGVzIGF0dGFjaGVkLlxuY29uc3QgV2ViSW5zcGVjdG9yOiB0eXBlb2YgV2ViSW5zcGVjdG9yID0gd2luZG93LldlYkluc3BlY3RvcjtcblxuLyoqXG4gKiBUaGUgQXBwIGlzIGRlY2xhcmVkIGluIGBtb2R1bGUuanNvbmAgYW5kIHRoZSBoaWdoZXN0IHByaW9yaXR5IG9uZSBpcyBsb2FkZWRcbiAqIGJ5IGBNYWluYC5cbiAqXG4gKiBUaGUgb25lIG1ldGhvZCwgYHByZXNlbnRVSWAgaXMgY2FsbGVkIGJ5IGBNYWluYCB0byBhdHRhY2ggdGhlIFVJIGludG8gdGhlXG4gKiBET00uIEhlcmUgd2UgY2FuIGluamVjdCBhbnkgbW9kaWZpY2F0aW9ucyBpbnRvIHRoZSBVSS5cbiAqL1xuY2xhc3MgTnVjbGlkZUFwcCBleHRlbmRzIFdlYkluc3BlY3Rvci5BcHAge1xuICBwcmVzZW50VUkoKSB7XG4gICAgY29uc3Qgcm9vdFZpZXcgPSBuZXcgV2ViSW5zcGVjdG9yLlJvb3RWaWV3KCk7XG4gICAgV2ViSW5zcGVjdG9yLmluc3BlY3RvclZpZXcuc2hvdyhyb290Vmlldy5lbGVtZW50KTtcbiAgICBXZWJJbnNwZWN0b3IuaW5zcGVjdG9yVmlldy5wYW5lbCgnc291cmNlcycpLnRoZW4ocGFuZWwgPT4ge1xuICAgICAgLy8gRm9yY2UgU291cmNlcyB2aWV3IHRvIGhpZGUgdGhlIGVkaXRvci5cbiAgICAgIGNvbnN0IHNvdXJjZXNQYW5lbDogYW55ID0gcGFuZWw7XG4gICAgICBzb3VyY2VzUGFuZWwuX3NwbGl0Vmlldy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBXZWJJbnNwZWN0b3IuU3BsaXRWaWV3LkV2ZW50cy5TaG93TW9kZUNoYW5nZWQsXG4gICAgICAgIHRoaXMuX2ZvcmNlT25seVNpZGViYXIsXG4gICAgICAgIHRoaXMpO1xuICAgICAgc291cmNlc1BhbmVsLnNpZGViYXJQYW5lcy5kb21CcmVha3BvaW50cy5zZXRWaXNpYmxlKGZhbHNlKTtcbiAgICAgIHNvdXJjZXNQYW5lbC5zaWRlYmFyUGFuZXMueGhyQnJlYWtwb2ludHMuc2V0VmlzaWJsZShmYWxzZSk7XG4gICAgICBzb3VyY2VzUGFuZWwuc2lkZWJhclBhbmVzLmV2ZW50TGlzdGVuZXJCcmVha3BvaW50cy5zZXRWaXNpYmxlKGZhbHNlKTtcbiAgICAgIHNvdXJjZXNQYW5lbC5zaWRlYmFyUGFuZXMudW5yZXNvbHZlZEJyZWFrcG9pbnRzID0gbmV3IFVucmVzb2x2ZWRCcmVha3BvaW50c1NpZGViYXJQYW5lKCk7XG4gICAgICAvLyBGb3JjZSByZWRyYXdcbiAgICAgIHNvdXJjZXNQYW5lbC5zaWRlYmFyUGFuZVZpZXcuZGV0YWNoKCk7XG4gICAgICBzb3VyY2VzUGFuZWwuc2lkZWJhclBhbmVWaWV3ID0gbnVsbDtcbiAgICAgIHNvdXJjZXNQYW5lbC5fZG9ja1NpZGVDaGFuZ2VkKCk7XG5cbiAgICAgIHdpbmRvdy5XZWJJbnNwZWN0b3IuaW5zcGVjdG9yVmlldy5zaG93SW5pdGlhbFBhbmVsKCk7XG4gICAgICBzb3VyY2VzUGFuZWwuX3NwbGl0Vmlldy5oaWRlTWFpbigpO1xuICAgICAgcm9vdFZpZXcuYXR0YWNoVG9Eb2N1bWVudChkb2N1bWVudCk7XG4gICAgLyplc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgfSkuY2F0Y2goKGUpID0+IGNvbnNvbGUuZXJyb3IoZSkpO1xuICAgIC8qZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG5cbiAgICAvLyBDbGVhciBicmVha3BvaW50cyB3aGVuZXZlciB0aGV5IGFyZSBzYXZlZCB0byBsb2NhbFN0b3JhZ2UuXG4gICAgV2ViSW5zcGVjdG9yLnNldHRpbmdzLmJyZWFrcG9pbnRzLmFkZENoYW5nZUxpc3RlbmVyKFxuICAgICAgdGhpcy5fb25CcmVha3BvaW50U2V0dGluZ3NDaGFuZ2VkLCB0aGlzKTtcbiAgfVxuXG4gIF9mb3JjZU9ubHlTaWRlYmFyKGV2ZW50OiBhbnkpIHtcbiAgICBpZiAoZXZlbnQuZGF0YSAhPT0gV2ViSW5zcGVjdG9yLlNwbGl0Vmlldy5TaG93TW9kZS5Pbmx5U2lkZWJhcikge1xuICAgICAgZXZlbnQudGFyZ2V0LmhpZGVNYWluKCk7XG4gICAgfVxuICB9XG5cbiAgX29uQnJlYWtwb2ludFNldHRpbmdzQ2hhbmdlZChldmVudDogV2ViSW5zcGVjdG9yLkV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgV2ViSW5zcGVjdG9yLnNldHRpbmdzLmJyZWFrcG9pbnRzLnNldChbXSk7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIE51Y2xpZGVBcHBQcm92aWRlciBleHRlbmRzIFdlYkluc3BlY3Rvci5BcHBQcm92aWRlciB7XG4gIGNyZWF0ZUFwcCgpOiBXZWJJbnNwZWN0b3IuQXBwIHtcbiAgICByZXR1cm4gbmV3IE51Y2xpZGVBcHAoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE51Y2xpZGVBcHBQcm92aWRlcjtcbiJdfQ==