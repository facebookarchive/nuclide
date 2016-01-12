var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var BreakpointDisplayController = require('./BreakpointDisplayController.js');
/* eslint-disable no-unused-vars */
var BreakpointStore = require('./BreakpointStore');
/* eslint-enable no-unused-vars */

var BreakpointManager = (function () {
  function BreakpointManager(store) {
    _classCallCheck(this, BreakpointManager);

    this._breakpointStore = store;
    this._displayControllers = new Map();
    this._disposables = new CompositeDisposable();

    this._disposables.add(atom.workspace.observeTextEditors(this._handleTextEditor.bind(this)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJyZWFrcG9pbnRNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQVc4QixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF0QyxtQkFBbUIsWUFBbkIsbUJBQW1COztBQUMxQixJQUFNLDJCQUEyQixHQUFHLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDOztBQUVoRixJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7O0lBRy9DLGlCQUFpQjtBQUtWLFdBTFAsaUJBQWlCLENBS1QsS0FBc0IsRUFBRTswQkFMaEMsaUJBQWlCOztBQU1uQixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0FBQzlCLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDOztBQUU5QyxRQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQzdGOztlQVhHLGlCQUFpQjs7V0FhZCxtQkFBUztBQUNkLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsVUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVU7ZUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ3JFLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNsQzs7Ozs7OztXQUtvQixpQ0FBc0Q7QUFDekUsYUFBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7S0FDakM7Ozs7Ozs7V0FLd0IsbUNBQUMsVUFBdUMsRUFBRTtBQUNqRSxnQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxtQkFBbUIsVUFBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0tBQ3pEOzs7V0FFZ0IsMkJBQUMsTUFBdUIsRUFBRTtBQUN6QyxVQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTs7OztBQUl6QyxZQUFNLFVBQVUsR0FBRyxJQUFJLDJCQUEyQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDeEYsWUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7T0FDbEQ7S0FDRjs7O1NBMUNHLGlCQUFpQjs7O0FBNkN2QixNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkJyZWFrcG9pbnRNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyID0gcmVxdWlyZSgnLi9CcmVha3BvaW50RGlzcGxheUNvbnRyb2xsZXIuanMnKTtcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5jb25zdCBCcmVha3BvaW50U3RvcmUgPSByZXF1aXJlKCcuL0JyZWFrcG9pbnRTdG9yZScpO1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG5jbGFzcyBCcmVha3BvaW50TWFuYWdlciB7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZTtcbiAgX2Rpc3BsYXlDb250cm9sbGVyczogTWFwPGF0b20kVGV4dEVkaXRvciwgQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyPjtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JlOiBCcmVha3BvaW50U3RvcmUpIHtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBzdG9yZTtcbiAgICB0aGlzLl9kaXNwbGF5Q29udHJvbGxlcnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyh0aGlzLl9oYW5kbGVUZXh0RWRpdG9yLmJpbmQodGhpcykpKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2Rpc3BsYXlDb250cm9sbGVycy5mb3JFYWNoKGNvbnRyb2xsZXIgPT4gY29udHJvbGxlci5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2Rpc3BsYXlDb250cm9sbGVycy5jbGVhcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgZm9yIHRlc3RpbmcuXG4gICAqL1xuICBnZXREaXNwbGF5Q29udHJvbGxlcnMoKTogTWFwPGF0b20kVGV4dEVkaXRvciwgQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc3BsYXlDb250cm9sbGVycztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxlZ2F0ZSBjYWxsYmFjayBmcm9tIEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlci5cbiAgICovXG4gIGhhbmRsZVRleHRFZGl0b3JEZXN0cm95ZWQoY29udHJvbGxlcjogQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyKSB7XG4gICAgY29udHJvbGxlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5fZGlzcGxheUNvbnRyb2xsZXJzLmRlbGV0ZShjb250cm9sbGVyLmdldEVkaXRvcigpKTtcbiAgfVxuXG4gIF9oYW5kbGVUZXh0RWRpdG9yKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKSB7XG4gICAgaWYgKCF0aGlzLl9kaXNwbGF5Q29udHJvbGxlcnMuaGFzKGVkaXRvcikpIHtcbiAgICAgIC8vIFRPRE9bamVmZnJleXRhbl06IGZsb3cgZG9lcyBub3Qgc2VlbSB0byBhY2NlcHQgZGVsZWdhdGUgdHlwaW5nLFxuICAgICAgLy8gbmVlZCB0byBhc2sgZmxvdyB0ZWFtIGlmIHRoaXMgaXMgYSBrbm93biBpc3N1ZS5cbiAgICAgIC8vICRGbG93Rml4TWVcbiAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyKHRoaXMsIHRoaXMuX2JyZWFrcG9pbnRTdG9yZSwgZWRpdG9yKTtcbiAgICAgIHRoaXMuX2Rpc3BsYXlDb250cm9sbGVycy5zZXQoZWRpdG9yLCBjb250cm9sbGVyKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCcmVha3BvaW50TWFuYWdlcjtcbiJdfQ==