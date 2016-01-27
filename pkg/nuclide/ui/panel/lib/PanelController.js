var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('react-for-atom');

var React = _require.React;

var assign = require('../../../commons').object.assign;

var PanelComponent = require('./PanelComponent');

/**
 * Instantiating this class adds it to the UI (even if it's not visible).
 * It currently does this with `atom.workspace.addLeftPanel()` but should
 * support different sides in the future.
 */

var PanelController = (function () {
  function PanelController(childElement, props, state) {
    _classCallCheck(this, PanelController);

    this._hostEl = document.createElement('div');
    // Fill the entire panel with this div so content can also use 100% to fill
    // up the entire panel.
    this._hostEl.style.height = '100%';

    var shouldBeVisible = false;
    var newProps = assign({}, props);
    if (state) {
      newProps.initialLength = state.resizableLength;
      shouldBeVisible = state.isVisible;
    }

    this._component = React.render(React.createElement(
      PanelComponent,
      newProps,
      childElement
    ), this._hostEl);
    this._panel = atom.workspace.addLeftPanel({ item: this._hostEl, visible: shouldBeVisible });
  }

  _createClass(PanelController, [{
    key: 'destroy',
    value: function destroy() {
      React.unmountComponentAtNode(this._hostEl);
      this._panel.destroy();
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      this.setVisible(!this.isVisible());
    }
  }, {
    key: 'setVisible',
    value: function setVisible(shouldBeVisible) {
      if (shouldBeVisible) {
        this._panel.show();
        this._component.focus();
      } else {
        this._panel.hide();
      }
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this._panel.isVisible();
    }
  }, {
    key: 'getChildComponent',
    value: function getChildComponent() {
      return this._component.getChildComponent();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        isVisible: this.isVisible(),
        resizableLength: this._component.getLength()
      };
    }
  }]);

  return PanelController;
})();

module.exports = PanelController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhbmVsQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7ZUFXZ0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSzs7SUFDTCxNQUFNLEdBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxDQUE1QyxNQUFNOztBQUViLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOzs7Ozs7OztJQVk3QyxlQUFlO0FBS1IsV0FMUCxlQUFlLENBTWpCLFlBQTBCLEVBQzFCLEtBQXFCLEVBQ3JCLEtBQTRCLEVBQzVCOzBCQVRFLGVBQWU7O0FBVWpCLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7O0FBRzdDLFFBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O0FBRW5DLFFBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztBQUM1QixRQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ25DLFFBQUksS0FBSyxFQUFFO0FBQ1QsY0FBUSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDO0FBQy9DLHFCQUFlLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztLQUNuQzs7QUFFRCxRQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQzVCO0FBQUMsb0JBQWM7TUFBSyxRQUFRO01BQUcsWUFBWTtLQUFrQixFQUM3RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUMsQ0FBQyxDQUFDO0dBQzNGOztlQTFCRyxlQUFlOztXQTRCWixtQkFBUztBQUNkLFdBQUssQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0MsVUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN2Qjs7O1dBRUssa0JBQVM7QUFDYixVQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7S0FDcEM7OztXQUVTLG9CQUFDLGVBQXdCLEVBQVE7QUFDekMsVUFBSSxlQUFlLEVBQUU7QUFDbkIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixZQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ3pCLE1BQU07QUFDTCxZQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ3BCO0tBQ0Y7OztXQUVRLHFCQUFZO0FBQ25CLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUNoQzs7O1dBRWdCLDZCQUFtQjtBQUNsQyxhQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUM1Qzs7O1dBRVEscUJBQXlCO0FBQ2hDLGFBQU87QUFDTCxpQkFBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDM0IsdUJBQWUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtPQUM3QyxDQUFDO0tBQ0g7OztTQTNERyxlQUFlOzs7QUE4RHJCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IlBhbmVsQ29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge2Fzc2lnbn0gPSByZXF1aXJlKCcuLi8uLi8uLi9jb21tb25zJykub2JqZWN0O1xuXG5jb25zdCBQYW5lbENvbXBvbmVudCA9IHJlcXVpcmUoJy4vUGFuZWxDb21wb25lbnQnKTtcblxudHlwZSBQYW5lbENvbnRyb2xsZXJTdGF0ZSA9IHtcbiAgaXNWaXNpYmxlOiBib29sZWFuO1xuICByZXNpemFibGVMZW5ndGg6IG51bWJlcjtcbn07XG5cbi8qKlxuICogSW5zdGFudGlhdGluZyB0aGlzIGNsYXNzIGFkZHMgaXQgdG8gdGhlIFVJIChldmVuIGlmIGl0J3Mgbm90IHZpc2libGUpLlxuICogSXQgY3VycmVudGx5IGRvZXMgdGhpcyB3aXRoIGBhdG9tLndvcmtzcGFjZS5hZGRMZWZ0UGFuZWwoKWAgYnV0IHNob3VsZFxuICogc3VwcG9ydCBkaWZmZXJlbnQgc2lkZXMgaW4gdGhlIGZ1dHVyZS5cbiAqL1xuY2xhc3MgUGFuZWxDb250cm9sbGVyIHtcbiAgX2NvbXBvbmVudDogUGFuZWxDb21wb25lbnQ7XG4gIF9ob3N0RWw6IEhUTUxFbGVtZW50O1xuICBfcGFuZWw6IGF0b20kUGFuZWw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgY2hpbGRFbGVtZW50OiBSZWFjdEVsZW1lbnQsXG4gICAgcHJvcHM6IHtkb2NrOiBzdHJpbmd9LFxuICAgIHN0YXRlOiA/UGFuZWxDb250cm9sbGVyU3RhdGVcbiAgKSB7XG4gICAgdGhpcy5faG9zdEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgLy8gRmlsbCB0aGUgZW50aXJlIHBhbmVsIHdpdGggdGhpcyBkaXYgc28gY29udGVudCBjYW4gYWxzbyB1c2UgMTAwJSB0byBmaWxsXG4gICAgLy8gdXAgdGhlIGVudGlyZSBwYW5lbC5cbiAgICB0aGlzLl9ob3N0RWwuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuXG4gICAgbGV0IHNob3VsZEJlVmlzaWJsZSA9IGZhbHNlO1xuICAgIGNvbnN0IG5ld1Byb3BzID0gYXNzaWduKHt9LCBwcm9wcyk7XG4gICAgaWYgKHN0YXRlKSB7XG4gICAgICBuZXdQcm9wcy5pbml0aWFsTGVuZ3RoID0gc3RhdGUucmVzaXphYmxlTGVuZ3RoO1xuICAgICAgc2hvdWxkQmVWaXNpYmxlID0gc3RhdGUuaXNWaXNpYmxlO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbXBvbmVudCA9IFJlYWN0LnJlbmRlcihcbiAgICAgIDxQYW5lbENvbXBvbmVudCB7Li4ubmV3UHJvcHN9PntjaGlsZEVsZW1lbnR9PC9QYW5lbENvbXBvbmVudD4sXG4gICAgICB0aGlzLl9ob3N0RWwpO1xuICAgIHRoaXMuX3BhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTGVmdFBhbmVsKHtpdGVtOiB0aGlzLl9ob3N0RWwsIHZpc2libGU6IHNob3VsZEJlVmlzaWJsZX0pO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX2hvc3RFbCk7XG4gICAgdGhpcy5fcGFuZWwuZGVzdHJveSgpO1xuICB9XG5cbiAgdG9nZ2xlKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0VmlzaWJsZSghdGhpcy5pc1Zpc2libGUoKSk7XG4gIH1cblxuICBzZXRWaXNpYmxlKHNob3VsZEJlVmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChzaG91bGRCZVZpc2libGUpIHtcbiAgICAgIHRoaXMuX3BhbmVsLnNob3coKTtcbiAgICAgIHRoaXMuX2NvbXBvbmVudC5mb2N1cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wYW5lbC5oaWRlKCk7XG4gICAgfVxuICB9XG5cbiAgaXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wYW5lbC5pc1Zpc2libGUoKTtcbiAgfVxuXG4gIGdldENoaWxkQ29tcG9uZW50KCk6IFJlYWN0Q29tcG9uZW50IHtcbiAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50LmdldENoaWxkQ29tcG9uZW50KCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogUGFuZWxDb250cm9sbGVyU3RhdGUge1xuICAgIHJldHVybiB7XG4gICAgICBpc1Zpc2libGU6IHRoaXMuaXNWaXNpYmxlKCksXG4gICAgICByZXNpemFibGVMZW5ndGg6IHRoaXMuX2NvbXBvbmVudC5nZXRMZW5ndGgoKSxcbiAgICB9O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFuZWxDb250cm9sbGVyO1xuIl19