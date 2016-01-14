var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhbmVsQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7SUFDakMsTUFBTSxHQUFJLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE1BQU0sQ0FBNUMsTUFBTTs7QUFFYixJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7Ozs7Ozs7SUFZN0MsZUFBZTtBQUtSLFdBTFAsZUFBZSxDQU1qQixZQUEwQixFQUMxQixLQUFxQixFQUNyQixLQUE0QixFQUM1QjswQkFURSxlQUFlOztBQVVqQixRQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7OztBQUc3QyxRQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztBQUVuQyxRQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7QUFDNUIsUUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNuQyxRQUFJLEtBQUssRUFBRTtBQUNULGNBQVEsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztBQUMvQyxxQkFBZSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7S0FDbkM7O0FBRUQsUUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUM1QjtBQUFDLG9CQUFjO01BQUssUUFBUTtNQUFHLFlBQVk7S0FBa0IsRUFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFDLENBQUMsQ0FBQztHQUMzRjs7ZUExQkcsZUFBZTs7V0E0QlosbUJBQVM7QUFDZCxXQUFLLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNDLFVBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdkI7OztXQUVLLGtCQUFTO0FBQ2IsVUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDOzs7V0FFUyxvQkFBQyxlQUF3QixFQUFRO0FBQ3pDLFVBQUksZUFBZSxFQUFFO0FBQ25CLFlBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUN6QixNQUFNO0FBQ0wsWUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNwQjtLQUNGOzs7V0FFUSxxQkFBWTtBQUNuQixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDaEM7OztXQUVnQiw2QkFBbUI7QUFDbEMsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7S0FDNUM7OztXQUVRLHFCQUF5QjtBQUNoQyxhQUFPO0FBQ0wsaUJBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQzNCLHVCQUFlLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7T0FDN0MsQ0FBQztLQUNIOzs7U0EzREcsZUFBZTs7O0FBOERyQixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJQYW5lbENvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7YXNzaWdufSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKS5vYmplY3Q7XG5cbmNvbnN0IFBhbmVsQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9QYW5lbENvbXBvbmVudCcpO1xuXG50eXBlIFBhbmVsQ29udHJvbGxlclN0YXRlID0ge1xuICBpc1Zpc2libGU6IGJvb2xlYW47XG4gIHJlc2l6YWJsZUxlbmd0aDogbnVtYmVyO1xufTtcblxuLyoqXG4gKiBJbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgYWRkcyBpdCB0byB0aGUgVUkgKGV2ZW4gaWYgaXQncyBub3QgdmlzaWJsZSkuXG4gKiBJdCBjdXJyZW50bHkgZG9lcyB0aGlzIHdpdGggYGF0b20ud29ya3NwYWNlLmFkZExlZnRQYW5lbCgpYCBidXQgc2hvdWxkXG4gKiBzdXBwb3J0IGRpZmZlcmVudCBzaWRlcyBpbiB0aGUgZnV0dXJlLlxuICovXG5jbGFzcyBQYW5lbENvbnRyb2xsZXIge1xuICBfY29tcG9uZW50OiBQYW5lbENvbXBvbmVudDtcbiAgX2hvc3RFbDogSFRNTEVsZW1lbnQ7XG4gIF9wYW5lbDogYXRvbSRQYW5lbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjaGlsZEVsZW1lbnQ6IFJlYWN0RWxlbWVudCxcbiAgICBwcm9wczoge2RvY2s6IHN0cmluZ30sXG4gICAgc3RhdGU6ID9QYW5lbENvbnRyb2xsZXJTdGF0ZVxuICApIHtcbiAgICB0aGlzLl9ob3N0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAvLyBGaWxsIHRoZSBlbnRpcmUgcGFuZWwgd2l0aCB0aGlzIGRpdiBzbyBjb250ZW50IGNhbiBhbHNvIHVzZSAxMDAlIHRvIGZpbGxcbiAgICAvLyB1cCB0aGUgZW50aXJlIHBhbmVsLlxuICAgIHRoaXMuX2hvc3RFbC5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG5cbiAgICBsZXQgc2hvdWxkQmVWaXNpYmxlID0gZmFsc2U7XG4gICAgY29uc3QgbmV3UHJvcHMgPSBhc3NpZ24oe30sIHByb3BzKTtcbiAgICBpZiAoc3RhdGUpIHtcbiAgICAgIG5ld1Byb3BzLmluaXRpYWxMZW5ndGggPSBzdGF0ZS5yZXNpemFibGVMZW5ndGg7XG4gICAgICBzaG91bGRCZVZpc2libGUgPSBzdGF0ZS5pc1Zpc2libGU7XG4gICAgfVxuXG4gICAgdGhpcy5fY29tcG9uZW50ID0gUmVhY3QucmVuZGVyKFxuICAgICAgPFBhbmVsQ29tcG9uZW50IHsuLi5uZXdQcm9wc30+e2NoaWxkRWxlbWVudH08L1BhbmVsQ29tcG9uZW50PixcbiAgICAgIHRoaXMuX2hvc3RFbCk7XG4gICAgdGhpcy5fcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRMZWZ0UGFuZWwoe2l0ZW06IHRoaXMuX2hvc3RFbCwgdmlzaWJsZTogc2hvdWxkQmVWaXNpYmxlfSk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5faG9zdEVsKTtcbiAgICB0aGlzLl9wYW5lbC5kZXN0cm95KCk7XG4gIH1cblxuICB0b2dnbGUoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRWaXNpYmxlKCF0aGlzLmlzVmlzaWJsZSgpKTtcbiAgfVxuXG4gIHNldFZpc2libGUoc2hvdWxkQmVWaXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHNob3VsZEJlVmlzaWJsZSkge1xuICAgICAgdGhpcy5fcGFuZWwuc2hvdygpO1xuICAgICAgdGhpcy5fY29tcG9uZW50LmZvY3VzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhbmVsLmhpZGUoKTtcbiAgICB9XG4gIH1cblxuICBpc1Zpc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3BhbmVsLmlzVmlzaWJsZSgpO1xuICB9XG5cbiAgZ2V0Q2hpbGRDb21wb25lbnQoKTogUmVhY3RDb21wb25lbnQge1xuICAgIHJldHVybiB0aGlzLl9jb21wb25lbnQuZ2V0Q2hpbGRDb21wb25lbnQoKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBQYW5lbENvbnRyb2xsZXJTdGF0ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmlzaWJsZTogdGhpcy5pc1Zpc2libGUoKSxcbiAgICAgIHJlc2l6YWJsZUxlbmd0aDogdGhpcy5fY29tcG9uZW50LmdldExlbmd0aCgpLFxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYW5lbENvbnRyb2xsZXI7XG4iXX0=