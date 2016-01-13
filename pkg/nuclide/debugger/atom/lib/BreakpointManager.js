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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJyZWFrcG9pbnRNYW5hZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztlQVc4QixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF0QyxtQkFBbUIsWUFBbkIsbUJBQW1COztBQUMxQixJQUFNLDJCQUEyQixHQUFHLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDOztBQUVoRixJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7O0lBRy9DLGlCQUFpQjtBQUtWLFdBTFAsaUJBQWlCLENBS1QsS0FBc0IsRUFBRTswQkFMaEMsaUJBQWlCOztBQU1uQixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0FBQzlCLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxtQkFBbUIsQ0FDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ3JFLENBQUM7R0FDSDs7ZUFYRyxpQkFBaUI7O1dBYWQsbUJBQVM7QUFDZCxVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzVCLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVO2VBQUksVUFBVSxDQUFDLE9BQU8sRUFBRTtPQUFBLENBQUMsQ0FBQztBQUNyRSxVQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDbEM7Ozs7Ozs7V0FLb0IsaUNBQXNEO0FBQ3pFLGFBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO0tBQ2pDOzs7Ozs7O1dBS3dCLG1DQUFDLFVBQXVDLEVBQUU7QUFDakUsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixVQUFJLENBQUMsbUJBQW1CLFVBQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztLQUN6RDs7O1dBRWdCLDJCQUFDLE1BQXVCLEVBQUU7QUFDekMsVUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Ozs7QUFJekMsWUFBTSxVQUFVLEdBQUcsSUFBSSwyQkFBMkIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3hGLFlBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO09BQ2xEO0tBQ0Y7OztTQTFDRyxpQkFBaUI7OztBQTZDdkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJCcmVha3BvaW50TWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlciA9IHJlcXVpcmUoJy4vQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyLmpzJyk7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuY29uc3QgQnJlYWtwb2ludFN0b3JlID0gcmVxdWlyZSgnLi9CcmVha3BvaW50U3RvcmUnKTtcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cblxuY2xhc3MgQnJlYWtwb2ludE1hbmFnZXIge1xuICBfYnJlYWtwb2ludFN0b3JlOiBCcmVha3BvaW50U3RvcmU7XG4gIF9kaXNwbGF5Q29udHJvbGxlcnM6IE1hcDxhdG9tJFRleHRFZGl0b3IsIEJyZWFrcG9pbnREaXNwbGF5Q29udHJvbGxlcj47XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihzdG9yZTogQnJlYWtwb2ludFN0b3JlKSB7XG4gICAgdGhpcy5fYnJlYWtwb2ludFN0b3JlID0gc3RvcmU7XG4gICAgdGhpcy5fZGlzcGxheUNvbnRyb2xsZXJzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnModGhpcy5faGFuZGxlVGV4dEVkaXRvci5iaW5kKHRoaXMpKSxcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fZGlzcGxheUNvbnRyb2xsZXJzLmZvckVhY2goY29udHJvbGxlciA9PiBjb250cm9sbGVyLmRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fZGlzcGxheUNvbnRyb2xsZXJzLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogVXNlZCBmb3IgdGVzdGluZy5cbiAgICovXG4gIGdldERpc3BsYXlDb250cm9sbGVycygpOiBNYXA8YXRvbSRUZXh0RWRpdG9yLCBCcmVha3BvaW50RGlzcGxheUNvbnRyb2xsZXI+IHtcbiAgICByZXR1cm4gdGhpcy5fZGlzcGxheUNvbnRyb2xsZXJzO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGVnYXRlIGNhbGxiYWNrIGZyb20gQnJlYWtwb2ludERpc3BsYXlDb250cm9sbGVyLlxuICAgKi9cbiAgaGFuZGxlVGV4dEVkaXRvckRlc3Ryb3llZChjb250cm9sbGVyOiBCcmVha3BvaW50RGlzcGxheUNvbnRyb2xsZXIpIHtcbiAgICBjb250cm9sbGVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9kaXNwbGF5Q29udHJvbGxlcnMuZGVsZXRlKGNvbnRyb2xsZXIuZ2V0RWRpdG9yKCkpO1xuICB9XG5cbiAgX2hhbmRsZVRleHRFZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpIHtcbiAgICBpZiAoIXRoaXMuX2Rpc3BsYXlDb250cm9sbGVycy5oYXMoZWRpdG9yKSkge1xuICAgICAgLy8gVE9ET1tqZWZmcmV5dGFuXTogZmxvdyBkb2VzIG5vdCBzZWVtIHRvIGFjY2VwdCBkZWxlZ2F0ZSB0eXBpbmcsXG4gICAgICAvLyBuZWVkIHRvIGFzayBmbG93IHRlYW0gaWYgdGhpcyBpcyBhIGtub3duIGlzc3VlLlxuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBCcmVha3BvaW50RGlzcGxheUNvbnRyb2xsZXIodGhpcywgdGhpcy5fYnJlYWtwb2ludFN0b3JlLCBlZGl0b3IpO1xuICAgICAgdGhpcy5fZGlzcGxheUNvbnRyb2xsZXJzLnNldChlZGl0b3IsIGNvbnRyb2xsZXIpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJyZWFrcG9pbnRNYW5hZ2VyO1xuIl19