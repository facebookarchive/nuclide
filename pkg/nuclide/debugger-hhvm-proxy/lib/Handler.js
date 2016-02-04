var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _ClientCallback = require('./ClientCallback');

var Handler = (function () {
  function Handler(domain, clientCallback) {
    _classCallCheck(this, Handler);

    this._domain = domain;
    this._clientCallback = clientCallback;
  }

  _createClass(Handler, [{
    key: 'getDomain',
    value: function getDomain() {
      return this._domain;
    }
  }, {
    key: 'handleMethod',
    value: function handleMethod(id, method, params) {
      throw new Error('absrtact');
    }
  }, {
    key: 'unknownMethod',
    value: function unknownMethod(id, method, params) {
      var message = 'Unknown chrome dev tools method: ' + this.getDomain() + '.' + method;
      _utils2['default'].log(message);
      this.replyWithError(id, message);
    }
  }, {
    key: 'replyWithError',
    value: function replyWithError(id, error) {
      this._clientCallback.replyWithError(id, error);
    }
  }, {
    key: 'replyToCommand',
    value: function replyToCommand(id, result, error) {
      this._clientCallback.replyToCommand(id, result, error);
    }
  }, {
    key: 'sendMethod',
    value: function sendMethod(method, params) {
      this._clientCallback.sendMethod(method, params);
    }
  }, {
    key: 'sendUserMessage',
    value: function sendUserMessage(type, message) {
      this._clientCallback.sendUserMessage(type, message);
    }
  }]);

  return Handler;
})();

module.exports = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbmRsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7cUJBV21CLFNBQVM7Ozs7OEJBQ0Msa0JBQWtCOztJQUd6QyxPQUFPO0FBSUEsV0FKUCxPQUFPLENBS1QsTUFBYyxFQUNkLGNBQThCLEVBQzlCOzBCQVBFLE9BQU87O0FBUVQsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7R0FDdkM7O2VBVkcsT0FBTzs7V0FZRixxQkFBVztBQUNsQixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDckI7OztXQUVXLHNCQUFDLEVBQVUsRUFBRSxNQUFjLEVBQUUsTUFBYyxFQUFXO0FBQ2hFLFlBQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDN0I7OztXQUVZLHVCQUFDLEVBQVUsRUFBRSxNQUFjLEVBQUUsTUFBZSxFQUFRO0FBQy9ELFVBQU0sT0FBTyxHQUFHLG1DQUFtQyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO0FBQ3RGLHlCQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwQixVQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNsQzs7O1dBRWEsd0JBQUMsRUFBVSxFQUFFLEtBQWEsRUFBUTtBQUM5QyxVQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDaEQ7OztXQUVhLHdCQUFDLEVBQVUsRUFBRSxNQUFjLEVBQUUsS0FBYyxFQUFRO0FBQy9ELFVBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDeEQ7OztXQUVTLG9CQUFDLE1BQWMsRUFBRSxNQUFlLEVBQVE7QUFDaEQsVUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ2pEOzs7V0FFYyx5QkFBQyxJQUFxQixFQUFFLE9BQWUsRUFBUTtBQUM1RCxVQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDckQ7OztTQXhDRyxPQUFPOzs7QUEyQ2IsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMiLCJmaWxlIjoiSGFuZGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge0NsaWVudENhbGxiYWNrfSBmcm9tICcuL0NsaWVudENhbGxiYWNrJztcbmltcG9ydCB0eXBlIHtVc2VyTWVzc2FnZVR5cGV9IGZyb20gJy4vQ2xpZW50Q2FsbGJhY2snO1xuXG5jbGFzcyBIYW5kbGVyIHtcbiAgX2RvbWFpbjogc3RyaW5nO1xuICBfY2xpZW50Q2FsbGJhY2s6IENsaWVudENhbGxiYWNrO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRvbWFpbjogc3RyaW5nLFxuICAgIGNsaWVudENhbGxiYWNrOiBDbGllbnRDYWxsYmFja1xuICApIHtcbiAgICB0aGlzLl9kb21haW4gPSBkb21haW47XG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2sgPSBjbGllbnRDYWxsYmFjaztcbiAgfVxuXG4gIGdldERvbWFpbigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9kb21haW47XG4gIH1cblxuICBoYW5kbGVNZXRob2QoaWQ6IG51bWJlciwgbWV0aG9kOiBzdHJpbmcsIHBhcmFtczogT2JqZWN0KTogUHJvbWlzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhYnNydGFjdCcpO1xuICB9XG5cbiAgdW5rbm93bk1ldGhvZChpZDogbnVtYmVyLCBtZXRob2Q6IHN0cmluZywgcGFyYW1zOiA/T2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3QgbWVzc2FnZSA9ICdVbmtub3duIGNocm9tZSBkZXYgdG9vbHMgbWV0aG9kOiAnICsgdGhpcy5nZXREb21haW4oKSArICcuJyArIG1ldGhvZDtcbiAgICBsb2dnZXIubG9nKG1lc3NhZ2UpO1xuICAgIHRoaXMucmVwbHlXaXRoRXJyb3IoaWQsIG1lc3NhZ2UpO1xuICB9XG5cbiAgcmVwbHlXaXRoRXJyb3IoaWQ6IG51bWJlciwgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnJlcGx5V2l0aEVycm9yKGlkLCBlcnJvcik7XG4gIH1cblxuICByZXBseVRvQ29tbWFuZChpZDogbnVtYmVyLCByZXN1bHQ6IE9iamVjdCwgZXJyb3I6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5yZXBseVRvQ29tbWFuZChpZCwgcmVzdWx0LCBlcnJvcik7XG4gIH1cblxuICBzZW5kTWV0aG9kKG1ldGhvZDogc3RyaW5nLCBwYXJhbXM6ID9PYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kTWV0aG9kKG1ldGhvZCwgcGFyYW1zKTtcbiAgfVxuXG4gIHNlbmRVc2VyTWVzc2FnZSh0eXBlOiBVc2VyTWVzc2FnZVR5cGUsIG1lc3NhZ2U6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyTWVzc2FnZSh0eXBlLCBtZXNzYWdlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZXI7XG4iXX0=