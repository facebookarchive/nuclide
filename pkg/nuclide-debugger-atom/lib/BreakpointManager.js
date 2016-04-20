var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var BreakpointDisplayController = require('./BreakpointDisplayController');

var BreakpointManager = (function () {
  function BreakpointManager(store) {
    _classCallCheck(this, BreakpointManager);

    this._breakpointStore = store;
    this._displayControllers = new Map();
    this._disposables = new CompositeDisposable(atom.workspace.observeTextEditors(this._handleTextEditor.bind(this)));
  }

  _createClass(BreakpointManager, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      this._displayControllers.forEach(function (controller) {
        return controller.dispose();
      });
      this._displayControllers.clear();
    }

    /**
     * Used for testing.
     */
  }, {
    key: 'getDisplayControllers',
    value: function getDisplayControllers() {
      return this._displayControllers;
    }

    /**
     * Delegate callback from BreakpointDisplayController.
     */
  }, {
    key: 'handleTextEditorDestroyed',
    value: function handleTextEditorDestroyed(controller) {
      controller.dispose();
      this._displayControllers['delete'](controller.getEditor());
    }
  }, {
    key: '_handleTextEditor',
    value: function _handleTextEditor(editor) {
      if (!this._displayControllers.has(editor)) {
        // TODO[jeffreytan]: flow does not seem to accept delegate typing,
        // need to ask flow team if this is a known issue.
        // $FlowFixMe
        var controller = new BreakpointDisplayController(this, this._breakpointStore, editor);
        this._displayControllers.set(editor, controller);
      }
    }
  }]);

  return BreakpointManager;
})();

module.exports = BreakpointManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJyZWFrcG9pbnRNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQWE4QixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF0QyxtQkFBbUIsWUFBbkIsbUJBQW1COztBQUMxQixJQUFNLDJCQUEyQixHQUFHLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDOztJQUV2RSxpQkFBaUI7QUFLVixXQUxQLGlCQUFpQixDQUtULEtBQXNCLEVBQUU7MEJBTGhDLGlCQUFpQjs7QUFNbkIsUUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztBQUM5QixRQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNyQyxRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksbUJBQW1CLENBQ3pDLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUNyRSxDQUFDO0dBQ0g7O2VBWEcsaUJBQWlCOztXQWFkLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM1QixVQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVTtlQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDckUsVUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2xDOzs7Ozs7O1dBS29CLGlDQUFzRDtBQUN6RSxhQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztLQUNqQzs7Ozs7OztXQUt3QixtQ0FBQyxVQUF1QyxFQUFFO0FBQ2pFLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsVUFBSSxDQUFDLG1CQUFtQixVQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7S0FDekQ7OztXQUVnQiwyQkFBQyxNQUF1QixFQUFFO0FBQ3pDLFVBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFOzs7O0FBSXpDLFlBQU0sVUFBVSxHQUFHLElBQUksMkJBQTJCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4RixZQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztPQUNsRDtLQUNGOzs7U0ExQ0csaUJBQWlCOzs7QUE2Q3ZCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiQnJlYWtwb2ludE1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBCcmVha3BvaW50U3RvcmUgZnJvbSAnLi9CcmVha3BvaW50U3RvcmUnO1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBCcmVha3BvaW50RGlzcGxheUNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL0JyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlcicpO1xuXG5jbGFzcyBCcmVha3BvaW50TWFuYWdlciB7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZTtcbiAgX2Rpc3BsYXlDb250cm9sbGVyczogTWFwPGF0b20kVGV4dEVkaXRvciwgQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyPjtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JlOiBCcmVha3BvaW50U3RvcmUpIHtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBzdG9yZTtcbiAgICB0aGlzLl9kaXNwbGF5Q29udHJvbGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyh0aGlzLl9oYW5kbGVUZXh0RWRpdG9yLmJpbmQodGhpcykpLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9kaXNwbGF5Q29udHJvbGxlcnMuZm9yRWFjaChjb250cm9sbGVyID0+IGNvbnRyb2xsZXIuZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwbGF5Q29udHJvbGxlcnMuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGZvciB0ZXN0aW5nLlxuICAgKi9cbiAgZ2V0RGlzcGxheUNvbnRyb2xsZXJzKCk6IE1hcDxhdG9tJFRleHRFZGl0b3IsIEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlcj4ge1xuICAgIHJldHVybiB0aGlzLl9kaXNwbGF5Q29udHJvbGxlcnM7XG4gIH1cblxuICAvKipcbiAgICogRGVsZWdhdGUgY2FsbGJhY2sgZnJvbSBCcmVha3BvaW50RGlzcGxheUNvbnRyb2xsZXIuXG4gICAqL1xuICBoYW5kbGVUZXh0RWRpdG9yRGVzdHJveWVkKGNvbnRyb2xsZXI6IEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlcikge1xuICAgIGNvbnRyb2xsZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2Rpc3BsYXlDb250cm9sbGVycy5kZWxldGUoY29udHJvbGxlci5nZXRFZGl0b3IoKSk7XG4gIH1cblxuICBfaGFuZGxlVGV4dEVkaXRvcihlZGl0b3I6IGF0b20kVGV4dEVkaXRvcikge1xuICAgIGlmICghdGhpcy5fZGlzcGxheUNvbnRyb2xsZXJzLmhhcyhlZGl0b3IpKSB7XG4gICAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiBmbG93IGRvZXMgbm90IHNlZW0gdG8gYWNjZXB0IGRlbGVnYXRlIHR5cGluZyxcbiAgICAgIC8vIG5lZWQgdG8gYXNrIGZsb3cgdGVhbSBpZiB0aGlzIGlzIGEga25vd24gaXNzdWUuXG4gICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlcih0aGlzLCB0aGlzLl9icmVha3BvaW50U3RvcmUsIGVkaXRvcik7XG4gICAgICB0aGlzLl9kaXNwbGF5Q29udHJvbGxlcnMuc2V0KGVkaXRvciwgY29udHJvbGxlcik7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnJlYWtwb2ludE1hbmFnZXI7XG4iXX0=