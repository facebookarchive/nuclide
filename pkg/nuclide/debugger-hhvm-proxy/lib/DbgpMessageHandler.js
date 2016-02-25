Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.getDbgpMessageHandlerInstance = getDbgpMessageHandlerInstance;

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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var GLOBAL_HHVM_DEBUGGER_KEY = '_global_hhvm_debugger_key';

var DbgpMessageHandler = (function () {
  function DbgpMessageHandler() {
    _classCallCheck(this, DbgpMessageHandler);
  }

  /**
   * A single dbgp message is of the format below:
   * Completed message:   length <NULL> xml-blob <NULL>
   * Incompleted message: length <NULL> xml-blob-part1
   * Once an incompleted message is received the next server message
   * will be in following format:
   * xml-blob-part2
   *
   * A single response from the server may contain
   * multiple DbgpMessages.
   *
   * Throws if the message is malformatted.
   */

  _createClass(DbgpMessageHandler, [{
    key: 'parseMessages',
    value: function parseMessages(data) {
      var components = data.split('\x00');
      /**
       * components.length can be 1, 2 or more than 3:
       * 1: The whole data block is part of a full message(xml-partX).
       * 2: length<NULL>xml-part1.
       * >=3: Other scenarios.
       */
      _utils2['default'].log('Total components: ' + components.length);

      // Merge head component with prevIncompletedMessage if needed.
      var results = [];
      var prevIncompletedMessage = this._prevIncompletedMessage;
      if (prevIncompletedMessage) {
        var firstMessageContent = components.shift();
        prevIncompletedMessage.content += firstMessageContent;

        if (this._isCompletedMessage(prevIncompletedMessage)) {
          results.push(this._parseXml(prevIncompletedMessage));
          prevIncompletedMessage = null;
        }
      }

      // Verify that we can't get another message without completing previous one.
      if (prevIncompletedMessage && components.length !== 0) {
        _utils2['default'].logErrorAndThrow('Error: got extra messages without completing previous message. ' + ('Previous message was: ' + prevIncompletedMessage + '. ') + ('Remaining components: ' + JSON.stringify(components)));
      }

      var isIncompleteResponse = components.length % 2 === 0;

      // Verify empty tail component for completed response.
      if (!isIncompleteResponse) {
        var lastComponent = components.pop();
        if (lastComponent.length !== 0) {
          _utils2['default'].logErrorAndThrow('The complete response should terminate with' + (' zero character while got: ' + lastComponent + ' '));
        }
      }

      // Process two tail components into prevIncompletedMessage for incompleted response.
      if (isIncompleteResponse && components.length > 0) {
        (0, _assert2['default'])(components.length >= 2);
        // content comes after length.
        var _content = components.pop();
        var _length = Number(components.pop());
        var lastMessage = { length: _length, content: _content };
        if (!this._isIncompletedMessage(lastMessage)) {
          _utils2['default'].logErrorAndThrow('The last message should be a fragment of a full message: ' + JSON.stringify(lastMessage));
        }
        prevIncompletedMessage = lastMessage;
      }

      // The remaining middle components should all be completed messages.
      (0, _assert2['default'])(components.length % 2 === 0);
      while (components.length >= 2) {
        var message = {
          length: Number(components.shift()),
          content: components.shift()
        };
        if (!this._isCompletedMessage(message)) {
          _utils2['default'].logErrorAndThrow('Got message length(' + message.content.length + ') ' + ('not equal to expected(' + message.length + '). ') + ('Message was: ' + JSON.stringify(message)));
        }
        results.push(this._parseXml(message));
      }
      this._prevIncompletedMessage = prevIncompletedMessage;
      return results;
    }
  }, {
    key: '_isCompletedMessage',
    value: function _isCompletedMessage(message) {
      return message.length === message.content.length;
    }
  }, {
    key: '_isIncompletedMessage',
    value: function _isIncompletedMessage(message) {
      return message.length > message.content.length;
    }

    /**
     * Convert xml to JS. Uses the xml2js package.
     * xml2js has a rather ... unique ... callback based API for a
     * synchronous operation. This functions purpose is to give a reasonable API.
     *
     * Format of the result:
     * Children become fields.
     * Multiple children of the same name become arrays.
     * Attributes become children of the '$' member
     * Body becomes either a string (if no attributes or children)
     * or the '_' member.
     * CDATA becomes an array containing a string, or just a string.
     *
     * Throws if the input is not valid xml.
     */
  }, {
    key: '_parseXml',
    value: function _parseXml(message) {
      var xml = message.content;
      var errorValue = undefined;
      var resultValue = undefined;
      require('xml2js').parseString(xml, function (error, result) {
        errorValue = error;
        resultValue = result;
      });
      if (errorValue !== null) {
        throw new Error('Error ' + JSON.stringify(errorValue) + ' parsing xml: ' + xml);
      }
      _utils2['default'].log('Translating server message result json: ' + JSON.stringify(resultValue));
      (0, _assert2['default'])(resultValue != null);
      return resultValue;
    }

    // For testing purpose.
  }, {
    key: 'clearIncompletedMessage',
    value: function clearIncompletedMessage() {
      this._prevIncompletedMessage = null;
    }
  }]);

  return DbgpMessageHandler;
})();

exports.DbgpMessageHandler = DbgpMessageHandler;

function getDbgpMessageHandlerInstance() {
  return require('../../commons').singleton.get(GLOBAL_HHVM_DEBUGGER_KEY, function () {
    return new DbgpMessageHandler();
  });
}
//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQztPQUNqRjtBQUNELHlCQUFPLEdBQUcsQ0FBQywwQ0FBMEMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDckYsK0JBQVUsV0FBVyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQy9CLGFBQU8sV0FBVyxDQUFDO0tBQ3BCOzs7OztXQUdzQixtQ0FBUztBQUM5QixVQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO0tBQ3JDOzs7U0F6SVUsa0JBQWtCOzs7OztBQTRJeEIsU0FBUyw2QkFBNkIsR0FBdUI7QUFDbEUsU0FBTyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FDM0Msd0JBQXdCLEVBQUUsWUFBTTtBQUM5QixXQUFPLElBQUksa0JBQWtCLEVBQUUsQ0FBQztHQUNqQyxDQUFDLENBQUM7Q0FDTiIsImZpbGUiOiJEYmdwTWVzc2FnZUhhbmRsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBHTE9CQUxfSEhWTV9ERUJVR0dFUl9LRVkgPSAnX2dsb2JhbF9oaHZtX2RlYnVnZ2VyX2tleSc7XG5cbnR5cGUgRGJncE1lc3NhZ2UgPSB7XG4gIGxlbmd0aDogbnVtYmVyO1xuICBjb250ZW50OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgY2xhc3MgRGJncE1lc3NhZ2VIYW5kbGVyIHtcbiAgX3ByZXZJbmNvbXBsZXRlZE1lc3NhZ2U6ID9EYmdwTWVzc2FnZTtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgLyoqXG4gICAqIEEgc2luZ2xlIGRiZ3AgbWVzc2FnZSBpcyBvZiB0aGUgZm9ybWF0IGJlbG93OlxuICAgKiBDb21wbGV0ZWQgbWVzc2FnZTogICBsZW5ndGggPE5VTEw+IHhtbC1ibG9iIDxOVUxMPlxuICAgKiBJbmNvbXBsZXRlZCBtZXNzYWdlOiBsZW5ndGggPE5VTEw+IHhtbC1ibG9iLXBhcnQxXG4gICAqIE9uY2UgYW4gaW5jb21wbGV0ZWQgbWVzc2FnZSBpcyByZWNlaXZlZCB0aGUgbmV4dCBzZXJ2ZXIgbWVzc2FnZVxuICAgKiB3aWxsIGJlIGluIGZvbGxvd2luZyBmb3JtYXQ6XG4gICAqIHhtbC1ibG9iLXBhcnQyXG4gICAqXG4gICAqIEEgc2luZ2xlIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlciBtYXkgY29udGFpblxuICAgKiBtdWx0aXBsZSBEYmdwTWVzc2FnZXMuXG4gICAqXG4gICAqIFRocm93cyBpZiB0aGUgbWVzc2FnZSBpcyBtYWxmb3JtYXR0ZWQuXG4gICAqL1xuICBwYXJzZU1lc3NhZ2VzKGRhdGE6IHN0cmluZyk6IEFycmF5PE9iamVjdD4ge1xuICAgIGNvbnN0IGNvbXBvbmVudHMgPSBkYXRhLnNwbGl0KCdcXHgwMCcpO1xuICAgIC8qKlxuICAgICAqIGNvbXBvbmVudHMubGVuZ3RoIGNhbiBiZSAxLCAyIG9yIG1vcmUgdGhhbiAzOlxuICAgICAqIDE6IFRoZSB3aG9sZSBkYXRhIGJsb2NrIGlzIHBhcnQgb2YgYSBmdWxsIG1lc3NhZ2UoeG1sLXBhcnRYKS5cbiAgICAgKiAyOiBsZW5ndGg8TlVMTD54bWwtcGFydDEuXG4gICAgICogPj0zOiBPdGhlciBzY2VuYXJpb3MuXG4gICAgICovXG4gICAgbG9nZ2VyLmxvZyhgVG90YWwgY29tcG9uZW50czogJHtjb21wb25lbnRzLmxlbmd0aH1gKTtcblxuICAgIC8vIE1lcmdlIGhlYWQgY29tcG9uZW50IHdpdGggcHJldkluY29tcGxldGVkTWVzc2FnZSBpZiBuZWVkZWQuXG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgIGxldCBwcmV2SW5jb21wbGV0ZWRNZXNzYWdlID0gdGhpcy5fcHJldkluY29tcGxldGVkTWVzc2FnZTtcbiAgICBpZiAocHJldkluY29tcGxldGVkTWVzc2FnZSkge1xuICAgICAgY29uc3QgZmlyc3RNZXNzYWdlQ29udGVudCA9IGNvbXBvbmVudHMuc2hpZnQoKTtcbiAgICAgIHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UuY29udGVudCArPSBmaXJzdE1lc3NhZ2VDb250ZW50O1xuXG4gICAgICBpZiAodGhpcy5faXNDb21wbGV0ZWRNZXNzYWdlKHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9wYXJzZVhtbChwcmV2SW5jb21wbGV0ZWRNZXNzYWdlKSk7XG4gICAgICAgIHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZlcmlmeSB0aGF0IHdlIGNhbid0IGdldCBhbm90aGVyIG1lc3NhZ2Ugd2l0aG91dCBjb21wbGV0aW5nIHByZXZpb3VzIG9uZS5cbiAgICBpZiAocHJldkluY29tcGxldGVkTWVzc2FnZSAmJiBjb21wb25lbnRzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgbG9nZ2VyLmxvZ0Vycm9yQW5kVGhyb3coXG4gICAgICAgIGBFcnJvcjogZ290IGV4dHJhIG1lc3NhZ2VzIHdpdGhvdXQgY29tcGxldGluZyBwcmV2aW91cyBtZXNzYWdlLiBgICtcbiAgICAgICAgYFByZXZpb3VzIG1lc3NhZ2Ugd2FzOiAke3ByZXZJbmNvbXBsZXRlZE1lc3NhZ2V9LiBgICtcbiAgICAgICAgYFJlbWFpbmluZyBjb21wb25lbnRzOiAke0pTT04uc3RyaW5naWZ5KGNvbXBvbmVudHMpfWAsXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGlzSW5jb21wbGV0ZVJlc3BvbnNlID0gKGNvbXBvbmVudHMubGVuZ3RoICUgMiA9PT0gMCk7XG5cbiAgICAvLyBWZXJpZnkgZW1wdHkgdGFpbCBjb21wb25lbnQgZm9yIGNvbXBsZXRlZCByZXNwb25zZS5cbiAgICBpZiAoIWlzSW5jb21wbGV0ZVJlc3BvbnNlKSB7XG4gICAgICBjb25zdCBsYXN0Q29tcG9uZW50ID0gY29tcG9uZW50cy5wb3AoKTtcbiAgICAgIGlmIChsYXN0Q29tcG9uZW50Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBsb2dnZXIubG9nRXJyb3JBbmRUaHJvdyhgVGhlIGNvbXBsZXRlIHJlc3BvbnNlIHNob3VsZCB0ZXJtaW5hdGUgd2l0aGAgK1xuICAgICAgICAgIGAgemVybyBjaGFyYWN0ZXIgd2hpbGUgZ290OiAke2xhc3RDb21wb25lbnR9IGApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgdHdvIHRhaWwgY29tcG9uZW50cyBpbnRvIHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UgZm9yIGluY29tcGxldGVkIHJlc3BvbnNlLlxuICAgIGlmIChpc0luY29tcGxldGVSZXNwb25zZSAmJiBjb21wb25lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGludmFyaWFudChjb21wb25lbnRzLmxlbmd0aCA+PSAyKTtcbiAgICAgIC8vIGNvbnRlbnQgY29tZXMgYWZ0ZXIgbGVuZ3RoLlxuICAgICAgY29uc3QgY29udGVudCA9IGNvbXBvbmVudHMucG9wKCk7XG4gICAgICBjb25zdCBsZW5ndGggPSBOdW1iZXIoY29tcG9uZW50cy5wb3AoKSk7XG4gICAgICBjb25zdCBsYXN0TWVzc2FnZSA9IHtsZW5ndGgsIGNvbnRlbnR9O1xuICAgICAgaWYgKCF0aGlzLl9pc0luY29tcGxldGVkTWVzc2FnZShsYXN0TWVzc2FnZSkpIHtcbiAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yQW5kVGhyb3coYFRoZSBsYXN0IG1lc3NhZ2Ugc2hvdWxkIGJlIGEgZnJhZ21lbnQgb2YgYSBmdWxsIG1lc3NhZ2U6IGAgK1xuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGxhc3RNZXNzYWdlKSk7XG4gICAgICB9XG4gICAgICBwcmV2SW5jb21wbGV0ZWRNZXNzYWdlID0gbGFzdE1lc3NhZ2U7XG4gICAgfVxuXG4gICAgLy8gVGhlIHJlbWFpbmluZyBtaWRkbGUgY29tcG9uZW50cyBzaG91bGQgYWxsIGJlIGNvbXBsZXRlZCBtZXNzYWdlcy5cbiAgICBpbnZhcmlhbnQoY29tcG9uZW50cy5sZW5ndGggJSAyID09PSAwKTtcbiAgICB3aGlsZSAoY29tcG9uZW50cy5sZW5ndGggPj0gMikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgICAgbGVuZ3RoOiBOdW1iZXIoY29tcG9uZW50cy5zaGlmdCgpKSxcbiAgICAgICAgY29udGVudDogY29tcG9uZW50cy5zaGlmdCgpLFxuICAgICAgfTtcbiAgICAgIGlmICghdGhpcy5faXNDb21wbGV0ZWRNZXNzYWdlKG1lc3NhZ2UpKSB7XG4gICAgICAgIGxvZ2dlci5sb2dFcnJvckFuZFRocm93KFxuICAgICAgICAgIGBHb3QgbWVzc2FnZSBsZW5ndGgoJHttZXNzYWdlLmNvbnRlbnQubGVuZ3RofSkgYCArXG4gICAgICAgICAgYG5vdCBlcXVhbCB0byBleHBlY3RlZCgke21lc3NhZ2UubGVuZ3RofSkuIGAgK1xuICAgICAgICAgIGBNZXNzYWdlIHdhczogJHtKU09OLnN0cmluZ2lmeShtZXNzYWdlKX1gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3BhcnNlWG1sKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgdGhpcy5fcHJldkluY29tcGxldGVkTWVzc2FnZSA9IHByZXZJbmNvbXBsZXRlZE1lc3NhZ2U7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICBfaXNDb21wbGV0ZWRNZXNzYWdlKG1lc3NhZ2U6IERiZ3BNZXNzYWdlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG1lc3NhZ2UubGVuZ3RoID09PSBtZXNzYWdlLmNvbnRlbnQubGVuZ3RoO1xuICB9XG5cbiAgX2lzSW5jb21wbGV0ZWRNZXNzYWdlKG1lc3NhZ2U6IERiZ3BNZXNzYWdlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG1lc3NhZ2UubGVuZ3RoID4gbWVzc2FnZS5jb250ZW50Lmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHhtbCB0byBKUy4gVXNlcyB0aGUgeG1sMmpzIHBhY2thZ2UuXG4gICAqIHhtbDJqcyBoYXMgYSByYXRoZXIgLi4uIHVuaXF1ZSAuLi4gY2FsbGJhY2sgYmFzZWQgQVBJIGZvciBhXG4gICAqIHN5bmNocm9ub3VzIG9wZXJhdGlvbi4gVGhpcyBmdW5jdGlvbnMgcHVycG9zZSBpcyB0byBnaXZlIGEgcmVhc29uYWJsZSBBUEkuXG4gICAqXG4gICAqIEZvcm1hdCBvZiB0aGUgcmVzdWx0OlxuICAgKiBDaGlsZHJlbiBiZWNvbWUgZmllbGRzLlxuICAgKiBNdWx0aXBsZSBjaGlsZHJlbiBvZiB0aGUgc2FtZSBuYW1lIGJlY29tZSBhcnJheXMuXG4gICAqIEF0dHJpYnV0ZXMgYmVjb21lIGNoaWxkcmVuIG9mIHRoZSAnJCcgbWVtYmVyXG4gICAqIEJvZHkgYmVjb21lcyBlaXRoZXIgYSBzdHJpbmcgKGlmIG5vIGF0dHJpYnV0ZXMgb3IgY2hpbGRyZW4pXG4gICAqIG9yIHRoZSAnXycgbWVtYmVyLlxuICAgKiBDREFUQSBiZWNvbWVzIGFuIGFycmF5IGNvbnRhaW5pbmcgYSBzdHJpbmcsIG9yIGp1c3QgYSBzdHJpbmcuXG4gICAqXG4gICAqIFRocm93cyBpZiB0aGUgaW5wdXQgaXMgbm90IHZhbGlkIHhtbC5cbiAgICovXG4gIF9wYXJzZVhtbChtZXNzYWdlOiBEYmdwTWVzc2FnZSk6IE9iamVjdCB7XG4gICAgY29uc3QgeG1sID0gbWVzc2FnZS5jb250ZW50O1xuICAgIGxldCBlcnJvclZhbHVlO1xuICAgIGxldCByZXN1bHRWYWx1ZTtcbiAgICByZXF1aXJlKCd4bWwyanMnKS5wYXJzZVN0cmluZyh4bWwsIChlcnJvciwgcmVzdWx0KSA9PiB7XG4gICAgICBlcnJvclZhbHVlID0gZXJyb3I7XG4gICAgICByZXN1bHRWYWx1ZSA9IHJlc3VsdDtcbiAgICB9KTtcbiAgICBpZiAoZXJyb3JWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciAnICsgSlNPTi5zdHJpbmdpZnkoZXJyb3JWYWx1ZSkgKyAnIHBhcnNpbmcgeG1sOiAnICsgeG1sKTtcbiAgICB9XG4gICAgbG9nZ2VyLmxvZygnVHJhbnNsYXRpbmcgc2VydmVyIG1lc3NhZ2UgcmVzdWx0IGpzb246ICcgKyBKU09OLnN0cmluZ2lmeShyZXN1bHRWYWx1ZSkpO1xuICAgIGludmFyaWFudChyZXN1bHRWYWx1ZSAhPSBudWxsKTtcbiAgICByZXR1cm4gcmVzdWx0VmFsdWU7XG4gIH1cblxuICAvLyBGb3IgdGVzdGluZyBwdXJwb3NlLlxuICBjbGVhckluY29tcGxldGVkTWVzc2FnZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9wcmV2SW5jb21wbGV0ZWRNZXNzYWdlID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGJncE1lc3NhZ2VIYW5kbGVySW5zdGFuY2UoKTogRGJncE1lc3NhZ2VIYW5kbGVyIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKS5zaW5nbGV0b24uZ2V0KFxuICAgIEdMT0JBTF9ISFZNX0RFQlVHR0VSX0tFWSwgKCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEYmdwTWVzc2FnZUhhbmRsZXIoKTtcbiAgICB9KTtcbn1cbiJdfQ==