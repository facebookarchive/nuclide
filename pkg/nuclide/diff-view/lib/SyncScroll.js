Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var SyncScroll = (function () {
  function SyncScroll(editor1Element, editor2Element) {
    var _this = this;

    _classCallCheck(this, SyncScroll);

    // Atom master or >= v1.0.18 have changed the scroll logic to the editor element.
    var subscriptions = this._subscriptions = new _atom.CompositeDisposable();
    this._syncInfo = [{
      scrollElement: editor1Element,
      scrolling: false
    }, {
      scrollElement: editor2Element,
      scrolling: false
    }];
    this._syncInfo.forEach(function (editorInfo, i) {
      // Note that `onDidChangeScrollTop` isn't technically in the public API.
      var scrollElement = editorInfo.scrollElement;

      var updateScrollPosition = function updateScrollPosition() {
        return _this._scrollPositionChanged(i);
      };
      // $FlowFixMe Atom API backword compatability.
      subscriptions.add(scrollElement.onDidChangeScrollTop(updateScrollPosition));
      // $FlowFixMe Atom API backword compatability.
      subscriptions.add(scrollElement.onDidChangeScrollLeft(updateScrollPosition));
    });
  }

  _createClass(SyncScroll, [{
    key: '_scrollPositionChanged',
    value: function _scrollPositionChanged(changeScrollIndex) {
      var thisInfo = this._syncInfo[changeScrollIndex];
      if (thisInfo.scrolling) {
        return;
      }
      var otherInfo = this._syncInfo[1 - changeScrollIndex];
      var otherElement = otherInfo.scrollElement;

      if (otherElement.component == null) {
        // The other editor isn't yet attached,
        // while both editors were already in sync when attached.
        return;
      }
      var thisElement = thisInfo.scrollElement;

      otherInfo.scrolling = true;
      // $FlowFixMe Atom API backword compatability.
      otherElement.setScrollTop(thisElement.getScrollTop());
      // $FlowFixMe Atom API backword compatability.
      otherElement.setScrollLeft(thisElement.getScrollLeft());
      otherInfo.scrolling = false;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
        this._subscriptions = null;
      }
    }
  }]);

  return SyncScroll;
})();

exports['default'] = SyncScroll;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN5bmNTY3JvbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztvQkFXa0MsTUFBTTs7SUFFbkIsVUFBVTtBQVFsQixXQVJRLFVBQVUsQ0FRakIsY0FBc0MsRUFBRSxjQUFzQyxFQUFFOzs7MEJBUnpFLFVBQVU7OztBQVUzQixRQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDO0FBQ3RFLFFBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQztBQUNoQixtQkFBYSxFQUFFLGNBQWM7QUFDN0IsZUFBUyxFQUFFLEtBQUs7S0FDakIsRUFBRTtBQUNELG1CQUFhLEVBQUUsY0FBYztBQUM3QixlQUFTLEVBQUUsS0FBSztLQUNqQixDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUs7O1VBRWpDLGFBQWEsR0FBSSxVQUFVLENBQTNCLGFBQWE7O0FBQ3BCLFVBQU0sb0JBQW9CLEdBQUcsU0FBdkIsb0JBQW9CO2VBQVMsTUFBSyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7T0FBQSxDQUFDOztBQUVsRSxtQkFBYSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDOztBQUU1RSxtQkFBYSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO0tBQzlFLENBQUMsQ0FBQztHQUNKOztlQTNCa0IsVUFBVTs7V0E2QlAsZ0NBQUMsaUJBQXlCLEVBQVE7QUFDdEQsVUFBTSxRQUFRLEdBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3BELFVBQUksUUFBUSxDQUFDLFNBQVMsRUFBRTtBQUN0QixlQUFPO09BQ1I7QUFDRCxVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO1VBQ2xDLFlBQVksR0FBSSxTQUFTLENBQXhDLGFBQWE7O0FBQ3BCLFVBQUksWUFBWSxDQUFDLFNBQVMsSUFBSSxJQUFJLEVBQUU7OztBQUdsQyxlQUFPO09BQ1I7VUFDcUIsV0FBVyxHQUFJLFFBQVEsQ0FBdEMsYUFBYTs7QUFDcEIsZUFBUyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7O0FBRTNCLGtCQUFZLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDOztBQUV0RCxrQkFBWSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztBQUN4RCxlQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztLQUM3Qjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsWUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixZQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztPQUM1QjtLQUNGOzs7U0F2RGtCLFVBQVU7OztxQkFBVixVQUFVIiwiZmlsZSI6IlN5bmNTY3JvbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTeW5jU2Nyb2xsIHtcblxuICBfc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zeW5jSW5mbzogQXJyYXk8e1xuICAgIHNjcm9sbEVsZW1lbnQ6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQ7XG4gICAgc2Nyb2xsaW5nOiBib29sZWFuO1xuICB9PjtcblxuICBjb25zdHJ1Y3RvcihlZGl0b3IxRWxlbWVudDogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCwgZWRpdG9yMkVsZW1lbnQ6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQpIHtcbiAgICAvLyBBdG9tIG1hc3RlciBvciA+PSB2MS4wLjE4IGhhdmUgY2hhbmdlZCB0aGUgc2Nyb2xsIGxvZ2ljIHRvIHRoZSBlZGl0b3IgZWxlbWVudC5cbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3luY0luZm8gPSBbe1xuICAgICAgc2Nyb2xsRWxlbWVudDogZWRpdG9yMUVsZW1lbnQsXG4gICAgICBzY3JvbGxpbmc6IGZhbHNlLFxuICAgIH0sIHtcbiAgICAgIHNjcm9sbEVsZW1lbnQ6IGVkaXRvcjJFbGVtZW50LFxuICAgICAgc2Nyb2xsaW5nOiBmYWxzZSxcbiAgICB9XTtcbiAgICB0aGlzLl9zeW5jSW5mby5mb3JFYWNoKChlZGl0b3JJbmZvLCBpKSA9PiB7XG4gICAgICAvLyBOb3RlIHRoYXQgYG9uRGlkQ2hhbmdlU2Nyb2xsVG9wYCBpc24ndCB0ZWNobmljYWxseSBpbiB0aGUgcHVibGljIEFQSS5cbiAgICAgIGNvbnN0IHtzY3JvbGxFbGVtZW50fSA9IGVkaXRvckluZm87XG4gICAgICBjb25zdCB1cGRhdGVTY3JvbGxQb3NpdGlvbiA9ICgpID0+IHRoaXMuX3Njcm9sbFBvc2l0aW9uQ2hhbmdlZChpKTtcbiAgICAgIC8vICRGbG93Rml4TWUgQXRvbSBBUEkgYmFja3dvcmQgY29tcGF0YWJpbGl0eS5cbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKHNjcm9sbEVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AodXBkYXRlU2Nyb2xsUG9zaXRpb24pKTtcbiAgICAgIC8vICRGbG93Rml4TWUgQXRvbSBBUEkgYmFja3dvcmQgY29tcGF0YWJpbGl0eS5cbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKHNjcm9sbEVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KHVwZGF0ZVNjcm9sbFBvc2l0aW9uKSk7XG4gICAgfSk7XG4gIH1cblxuICBfc2Nyb2xsUG9zaXRpb25DaGFuZ2VkKGNoYW5nZVNjcm9sbEluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0aGlzSW5mbyAgPSB0aGlzLl9zeW5jSW5mb1tjaGFuZ2VTY3JvbGxJbmRleF07XG4gICAgaWYgKHRoaXNJbmZvLnNjcm9sbGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBvdGhlckluZm8gPSB0aGlzLl9zeW5jSW5mb1sxIC0gY2hhbmdlU2Nyb2xsSW5kZXhdO1xuICAgIGNvbnN0IHtzY3JvbGxFbGVtZW50OiBvdGhlckVsZW1lbnR9ID0gb3RoZXJJbmZvO1xuICAgIGlmIChvdGhlckVsZW1lbnQuY29tcG9uZW50ID09IG51bGwpIHtcbiAgICAgIC8vIFRoZSBvdGhlciBlZGl0b3IgaXNuJ3QgeWV0IGF0dGFjaGVkLFxuICAgICAgLy8gd2hpbGUgYm90aCBlZGl0b3JzIHdlcmUgYWxyZWFkeSBpbiBzeW5jIHdoZW4gYXR0YWNoZWQuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtzY3JvbGxFbGVtZW50OiB0aGlzRWxlbWVudH0gPSB0aGlzSW5mbztcbiAgICBvdGhlckluZm8uc2Nyb2xsaW5nID0gdHJ1ZTtcbiAgICAvLyAkRmxvd0ZpeE1lIEF0b20gQVBJIGJhY2t3b3JkIGNvbXBhdGFiaWxpdHkuXG4gICAgb3RoZXJFbGVtZW50LnNldFNjcm9sbFRvcCh0aGlzRWxlbWVudC5nZXRTY3JvbGxUb3AoKSk7XG4gICAgLy8gJEZsb3dGaXhNZSBBdG9tIEFQSSBiYWNrd29yZCBjb21wYXRhYmlsaXR5LlxuICAgIG90aGVyRWxlbWVudC5zZXRTY3JvbGxMZWZ0KHRoaXNFbGVtZW50LmdldFNjcm9sbExlZnQoKSk7XG4gICAgb3RoZXJJbmZvLnNjcm9sbGluZyA9IGZhbHNlO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==