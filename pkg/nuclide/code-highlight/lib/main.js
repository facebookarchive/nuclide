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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.consumeProvider = consumeProvider;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Activation = (function () {
  function Activation() {
    _classCallCheck(this, Activation);
  }

  _createClass(Activation, [{
    key: 'activate',
    value: function activate() {
      var HighlightManager = require('./CodeHighlightManager');
      // $FlowIssue -- https://github.com/facebook/flow/issues/996
      this._codeHighlightManager = new HighlightManager();
    }
  }, {
    key: 'consumeProvider',
    value: function consumeProvider(provider) {
      this._codeHighlightManager.addProvider(provider);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._codeHighlightManager.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (!activation) {
    activation = new Activation(state);
    activation.activate();
  }
}

function consumeProvider(provider) {
  if (activation != null) {
    activation.consumeProvider(provider);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFjTSxVQUFVO1dBQVYsVUFBVTswQkFBVixVQUFVOzs7ZUFBVixVQUFVOztXQUdOLG9CQUFHO0FBQ1QsVUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQzs7QUFFM0QsVUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztLQUNyRDs7O1dBRWMseUJBQUMsUUFBK0IsRUFBRTtBQUMvQyxVQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2xEOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0Qzs7O1NBZkcsVUFBVTs7O0FBa0JoQixJQUFJLFVBQXVCLEdBQUcsSUFBSSxDQUFDOztBQUU1QixTQUFTLFFBQVEsQ0FBQyxLQUFjLEVBQUU7QUFDdkMsTUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLGNBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuQyxjQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7R0FDdkI7Q0FDRjs7QUFFTSxTQUFTLGVBQWUsQ0FBQyxRQUErQixFQUFFO0FBQy9ELE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ3RDO0NBQ0Y7O0FBRU0sU0FBUyxVQUFVLEdBQUc7QUFDM0IsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0YiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDb2RlSGlnaGxpZ2h0UHJvdmlkZXJ9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgQ29kZUhpZ2hsaWdodE1hbmFnZXIgZnJvbSAnLi9Db2RlSGlnaGxpZ2h0TWFuYWdlcic7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfY29kZUhpZ2hsaWdodE1hbmFnZXI6IENvZGVIaWdobGlnaHRNYW5hZ2VyO1xuXG4gIGFjdGl2YXRlKCkge1xuICAgIGNvbnN0IEhpZ2hsaWdodE1hbmFnZXIgPSByZXF1aXJlKCcuL0NvZGVIaWdobGlnaHRNYW5hZ2VyJyk7XG4gICAgLy8gJEZsb3dJc3N1ZSAtLSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvOTk2XG4gICAgdGhpcy5fY29kZUhpZ2hsaWdodE1hbmFnZXIgPSBuZXcgSGlnaGxpZ2h0TWFuYWdlcigpO1xuICB9XG5cbiAgY29uc3VtZVByb3ZpZGVyKHByb3ZpZGVyOiBDb2RlSGlnaGxpZ2h0UHJvdmlkZXIpIHtcbiAgICB0aGlzLl9jb2RlSGlnaGxpZ2h0TWFuYWdlci5hZGRQcm92aWRlcihwcm92aWRlcik7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2NvZGVIaWdobGlnaHRNYW5hZ2VyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgICBhY3RpdmF0aW9uLmFjdGl2YXRlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVQcm92aWRlcihwcm92aWRlcjogQ29kZUhpZ2hsaWdodFByb3ZpZGVyKSB7XG4gIGlmIChhY3RpdmF0aW9uICE9IG51bGwpIHtcbiAgICBhY3RpdmF0aW9uLmNvbnN1bWVQcm92aWRlcihwcm92aWRlcik7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKSB7XG4gIGlmIChhY3RpdmF0aW9uICE9IG51bGwpIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuIl19