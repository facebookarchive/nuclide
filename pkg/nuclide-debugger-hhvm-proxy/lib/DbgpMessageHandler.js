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
  return require('../../nuclide-commons').singleton.get(GLOBAL_HHVM_DEBUGGER_KEY, function () {
    return new DbgpMessageHandler();
  });
}
//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQztPQUNqRjtBQUNELHlCQUFPLEdBQUcsQ0FBQywwQ0FBMEMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDckYsK0JBQVUsV0FBVyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQy9CLGFBQU8sV0FBVyxDQUFDO0tBQ3BCOzs7OztXQUdzQixtQ0FBUztBQUM5QixVQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO0tBQ3JDOzs7U0F6SVUsa0JBQWtCOzs7OztBQTRJeEIsU0FBUyw2QkFBNkIsR0FBdUI7QUFDbEUsU0FBTyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUNuRCx3QkFBd0IsRUFBRSxZQUFNO0FBQzlCLFdBQU8sSUFBSSxrQkFBa0IsRUFBRSxDQUFDO0dBQ2pDLENBQUMsQ0FBQztDQUNOIiwiZmlsZSI6IkRiZ3BNZXNzYWdlSGFuZGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IEdMT0JBTF9ISFZNX0RFQlVHR0VSX0tFWSA9ICdfZ2xvYmFsX2hodm1fZGVidWdnZXJfa2V5JztcblxudHlwZSBEYmdwTWVzc2FnZSA9IHtcbiAgbGVuZ3RoOiBudW1iZXI7XG4gIGNvbnRlbnQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCBjbGFzcyBEYmdwTWVzc2FnZUhhbmRsZXIge1xuICBfcHJldkluY29tcGxldGVkTWVzc2FnZTogP0RiZ3BNZXNzYWdlO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICAvKipcbiAgICogQSBzaW5nbGUgZGJncCBtZXNzYWdlIGlzIG9mIHRoZSBmb3JtYXQgYmVsb3c6XG4gICAqIENvbXBsZXRlZCBtZXNzYWdlOiAgIGxlbmd0aCA8TlVMTD4geG1sLWJsb2IgPE5VTEw+XG4gICAqIEluY29tcGxldGVkIG1lc3NhZ2U6IGxlbmd0aCA8TlVMTD4geG1sLWJsb2ItcGFydDFcbiAgICogT25jZSBhbiBpbmNvbXBsZXRlZCBtZXNzYWdlIGlzIHJlY2VpdmVkIHRoZSBuZXh0IHNlcnZlciBtZXNzYWdlXG4gICAqIHdpbGwgYmUgaW4gZm9sbG93aW5nIGZvcm1hdDpcbiAgICogeG1sLWJsb2ItcGFydDJcbiAgICpcbiAgICogQSBzaW5nbGUgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyIG1heSBjb250YWluXG4gICAqIG11bHRpcGxlIERiZ3BNZXNzYWdlcy5cbiAgICpcbiAgICogVGhyb3dzIGlmIHRoZSBtZXNzYWdlIGlzIG1hbGZvcm1hdHRlZC5cbiAgICovXG4gIHBhcnNlTWVzc2FnZXMoZGF0YTogc3RyaW5nKTogQXJyYXk8T2JqZWN0PiB7XG4gICAgY29uc3QgY29tcG9uZW50cyA9IGRhdGEuc3BsaXQoJ1xceDAwJyk7XG4gICAgLyoqXG4gICAgICogY29tcG9uZW50cy5sZW5ndGggY2FuIGJlIDEsIDIgb3IgbW9yZSB0aGFuIDM6XG4gICAgICogMTogVGhlIHdob2xlIGRhdGEgYmxvY2sgaXMgcGFydCBvZiBhIGZ1bGwgbWVzc2FnZSh4bWwtcGFydFgpLlxuICAgICAqIDI6IGxlbmd0aDxOVUxMPnhtbC1wYXJ0MS5cbiAgICAgKiA+PTM6IE90aGVyIHNjZW5hcmlvcy5cbiAgICAgKi9cbiAgICBsb2dnZXIubG9nKGBUb3RhbCBjb21wb25lbnRzOiAke2NvbXBvbmVudHMubGVuZ3RofWApO1xuXG4gICAgLy8gTWVyZ2UgaGVhZCBjb21wb25lbnQgd2l0aCBwcmV2SW5jb21wbGV0ZWRNZXNzYWdlIGlmIG5lZWRlZC5cbiAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgbGV0IHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UgPSB0aGlzLl9wcmV2SW5jb21wbGV0ZWRNZXNzYWdlO1xuICAgIGlmIChwcmV2SW5jb21wbGV0ZWRNZXNzYWdlKSB7XG4gICAgICBjb25zdCBmaXJzdE1lc3NhZ2VDb250ZW50ID0gY29tcG9uZW50cy5zaGlmdCgpO1xuICAgICAgcHJldkluY29tcGxldGVkTWVzc2FnZS5jb250ZW50ICs9IGZpcnN0TWVzc2FnZUNvbnRlbnQ7XG5cbiAgICAgIGlmICh0aGlzLl9pc0NvbXBsZXRlZE1lc3NhZ2UocHJldkluY29tcGxldGVkTWVzc2FnZSkpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuX3BhcnNlWG1sKHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UpKTtcbiAgICAgICAgcHJldkluY29tcGxldGVkTWVzc2FnZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHRoYXQgd2UgY2FuJ3QgZ2V0IGFub3RoZXIgbWVzc2FnZSB3aXRob3V0IGNvbXBsZXRpbmcgcHJldmlvdXMgb25lLlxuICAgIGlmIChwcmV2SW5jb21wbGV0ZWRNZXNzYWdlICYmIGNvbXBvbmVudHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICBsb2dnZXIubG9nRXJyb3JBbmRUaHJvdyhcbiAgICAgICAgYEVycm9yOiBnb3QgZXh0cmEgbWVzc2FnZXMgd2l0aG91dCBjb21wbGV0aW5nIHByZXZpb3VzIG1lc3NhZ2UuIGAgK1xuICAgICAgICBgUHJldmlvdXMgbWVzc2FnZSB3YXM6ICR7cHJldkluY29tcGxldGVkTWVzc2FnZX0uIGAgK1xuICAgICAgICBgUmVtYWluaW5nIGNvbXBvbmVudHM6ICR7SlNPTi5zdHJpbmdpZnkoY29tcG9uZW50cyl9YCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgaXNJbmNvbXBsZXRlUmVzcG9uc2UgPSAoY29tcG9uZW50cy5sZW5ndGggJSAyID09PSAwKTtcblxuICAgIC8vIFZlcmlmeSBlbXB0eSB0YWlsIGNvbXBvbmVudCBmb3IgY29tcGxldGVkIHJlc3BvbnNlLlxuICAgIGlmICghaXNJbmNvbXBsZXRlUmVzcG9uc2UpIHtcbiAgICAgIGNvbnN0IGxhc3RDb21wb25lbnQgPSBjb21wb25lbnRzLnBvcCgpO1xuICAgICAgaWYgKGxhc3RDb21wb25lbnQubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIGxvZ2dlci5sb2dFcnJvckFuZFRocm93KGBUaGUgY29tcGxldGUgcmVzcG9uc2Ugc2hvdWxkIHRlcm1pbmF0ZSB3aXRoYCArXG4gICAgICAgICAgYCB6ZXJvIGNoYXJhY3RlciB3aGlsZSBnb3Q6ICR7bGFzdENvbXBvbmVudH0gYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyB0d28gdGFpbCBjb21wb25lbnRzIGludG8gcHJldkluY29tcGxldGVkTWVzc2FnZSBmb3IgaW5jb21wbGV0ZWQgcmVzcG9uc2UuXG4gICAgaWYgKGlzSW5jb21wbGV0ZVJlc3BvbnNlICYmIGNvbXBvbmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgaW52YXJpYW50KGNvbXBvbmVudHMubGVuZ3RoID49IDIpO1xuICAgICAgLy8gY29udGVudCBjb21lcyBhZnRlciBsZW5ndGguXG4gICAgICBjb25zdCBjb250ZW50ID0gY29tcG9uZW50cy5wb3AoKTtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IE51bWJlcihjb21wb25lbnRzLnBvcCgpKTtcbiAgICAgIGNvbnN0IGxhc3RNZXNzYWdlID0ge2xlbmd0aCwgY29udGVudH07XG4gICAgICBpZiAoIXRoaXMuX2lzSW5jb21wbGV0ZWRNZXNzYWdlKGxhc3RNZXNzYWdlKSkge1xuICAgICAgICBsb2dnZXIubG9nRXJyb3JBbmRUaHJvdyhgVGhlIGxhc3QgbWVzc2FnZSBzaG91bGQgYmUgYSBmcmFnbWVudCBvZiBhIGZ1bGwgbWVzc2FnZTogYCArXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkobGFzdE1lc3NhZ2UpKTtcbiAgICAgIH1cbiAgICAgIHByZXZJbmNvbXBsZXRlZE1lc3NhZ2UgPSBsYXN0TWVzc2FnZTtcbiAgICB9XG5cbiAgICAvLyBUaGUgcmVtYWluaW5nIG1pZGRsZSBjb21wb25lbnRzIHNob3VsZCBhbGwgYmUgY29tcGxldGVkIG1lc3NhZ2VzLlxuICAgIGludmFyaWFudChjb21wb25lbnRzLmxlbmd0aCAlIDIgPT09IDApO1xuICAgIHdoaWxlIChjb21wb25lbnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0ge1xuICAgICAgICBsZW5ndGg6IE51bWJlcihjb21wb25lbnRzLnNoaWZ0KCkpLFxuICAgICAgICBjb250ZW50OiBjb21wb25lbnRzLnNoaWZ0KCksXG4gICAgICB9O1xuICAgICAgaWYgKCF0aGlzLl9pc0NvbXBsZXRlZE1lc3NhZ2UobWVzc2FnZSkpIHtcbiAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yQW5kVGhyb3coXG4gICAgICAgICAgYEdvdCBtZXNzYWdlIGxlbmd0aCgke21lc3NhZ2UuY29udGVudC5sZW5ndGh9KSBgICtcbiAgICAgICAgICBgbm90IGVxdWFsIHRvIGV4cGVjdGVkKCR7bWVzc2FnZS5sZW5ndGh9KS4gYCArXG4gICAgICAgICAgYE1lc3NhZ2Ugd2FzOiAke0pTT04uc3RyaW5naWZ5KG1lc3NhZ2UpfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5fcGFyc2VYbWwobWVzc2FnZSkpO1xuICAgIH1cbiAgICB0aGlzLl9wcmV2SW5jb21wbGV0ZWRNZXNzYWdlID0gcHJldkluY29tcGxldGVkTWVzc2FnZTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIF9pc0NvbXBsZXRlZE1lc3NhZ2UobWVzc2FnZTogRGJncE1lc3NhZ2UpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbWVzc2FnZS5sZW5ndGggPT09IG1lc3NhZ2UuY29udGVudC5sZW5ndGg7XG4gIH1cblxuICBfaXNJbmNvbXBsZXRlZE1lc3NhZ2UobWVzc2FnZTogRGJncE1lc3NhZ2UpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbWVzc2FnZS5sZW5ndGggPiBtZXNzYWdlLmNvbnRlbnQubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgeG1sIHRvIEpTLiBVc2VzIHRoZSB4bWwyanMgcGFja2FnZS5cbiAgICogeG1sMmpzIGhhcyBhIHJhdGhlciAuLi4gdW5pcXVlIC4uLiBjYWxsYmFjayBiYXNlZCBBUEkgZm9yIGFcbiAgICogc3luY2hyb25vdXMgb3BlcmF0aW9uLiBUaGlzIGZ1bmN0aW9ucyBwdXJwb3NlIGlzIHRvIGdpdmUgYSByZWFzb25hYmxlIEFQSS5cbiAgICpcbiAgICogRm9ybWF0IG9mIHRoZSByZXN1bHQ6XG4gICAqIENoaWxkcmVuIGJlY29tZSBmaWVsZHMuXG4gICAqIE11bHRpcGxlIGNoaWxkcmVuIG9mIHRoZSBzYW1lIG5hbWUgYmVjb21lIGFycmF5cy5cbiAgICogQXR0cmlidXRlcyBiZWNvbWUgY2hpbGRyZW4gb2YgdGhlICckJyBtZW1iZXJcbiAgICogQm9keSBiZWNvbWVzIGVpdGhlciBhIHN0cmluZyAoaWYgbm8gYXR0cmlidXRlcyBvciBjaGlsZHJlbilcbiAgICogb3IgdGhlICdfJyBtZW1iZXIuXG4gICAqIENEQVRBIGJlY29tZXMgYW4gYXJyYXkgY29udGFpbmluZyBhIHN0cmluZywgb3IganVzdCBhIHN0cmluZy5cbiAgICpcbiAgICogVGhyb3dzIGlmIHRoZSBpbnB1dCBpcyBub3QgdmFsaWQgeG1sLlxuICAgKi9cbiAgX3BhcnNlWG1sKG1lc3NhZ2U6IERiZ3BNZXNzYWdlKTogT2JqZWN0IHtcbiAgICBjb25zdCB4bWwgPSBtZXNzYWdlLmNvbnRlbnQ7XG4gICAgbGV0IGVycm9yVmFsdWU7XG4gICAgbGV0IHJlc3VsdFZhbHVlO1xuICAgIHJlcXVpcmUoJ3htbDJqcycpLnBhcnNlU3RyaW5nKHhtbCwgKGVycm9yLCByZXN1bHQpID0+IHtcbiAgICAgIGVycm9yVmFsdWUgPSBlcnJvcjtcbiAgICAgIHJlc3VsdFZhbHVlID0gcmVzdWx0O1xuICAgIH0pO1xuICAgIGlmIChlcnJvclZhbHVlICE9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yICcgKyBKU09OLnN0cmluZ2lmeShlcnJvclZhbHVlKSArICcgcGFyc2luZyB4bWw6ICcgKyB4bWwpO1xuICAgIH1cbiAgICBsb2dnZXIubG9nKCdUcmFuc2xhdGluZyBzZXJ2ZXIgbWVzc2FnZSByZXN1bHQganNvbjogJyArIEpTT04uc3RyaW5naWZ5KHJlc3VsdFZhbHVlKSk7XG4gICAgaW52YXJpYW50KHJlc3VsdFZhbHVlICE9IG51bGwpO1xuICAgIHJldHVybiByZXN1bHRWYWx1ZTtcbiAgfVxuXG4gIC8vIEZvciB0ZXN0aW5nIHB1cnBvc2UuXG4gIGNsZWFySW5jb21wbGV0ZWRNZXNzYWdlKCk6IHZvaWQge1xuICAgIHRoaXMuX3ByZXZJbmNvbXBsZXRlZE1lc3NhZ2UgPSBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREYmdwTWVzc2FnZUhhbmRsZXJJbnN0YW5jZSgpOiBEYmdwTWVzc2FnZUhhbmRsZXIge1xuICByZXR1cm4gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJykuc2luZ2xldG9uLmdldChcbiAgICBHTE9CQUxfSEhWTV9ERUJVR0dFUl9LRVksICgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGJncE1lc3NhZ2VIYW5kbGVyKCk7XG4gICAgfSk7XG59XG4iXX0=