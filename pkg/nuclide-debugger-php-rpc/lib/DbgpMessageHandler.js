'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DbgpMessageHandler = undefined;

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _xml2js;

function _load_xml2js() {
  return _xml2js = _interopRequireDefault(require('xml2js'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class DbgpMessageHandler {

  constructor() {}

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
  parseMessages(data) {
    const components = data.split('\x00');
    /**
     * components.length can be 1, 2 or more than 3:
     * 1: The whole data block is part of a full message(xml-partX).
     * 2: length<NULL>xml-part1.
     * >=3: Other scenarios.
     */
    (_utils || _load_utils()).default.debug(`Total components: ${components.length}`);

    // Merge head component with prevIncompletedMessage if needed.
    const results = [];
    let prevIncompletedMessage = this._prevIncompletedMessage;
    if (prevIncompletedMessage) {
      const firstMessageContent = components.shift();
      prevIncompletedMessage.content += firstMessageContent;

      if (this._isCompletedMessage(prevIncompletedMessage)) {
        results.push(this._parseXml(prevIncompletedMessage));
        prevIncompletedMessage = null;
      }
    }

    // Verify that we can't get another message without completing previous one.
    if (prevIncompletedMessage && components.length !== 0) {
      const message = 'Error: got extra messages without completing previous message. ' + `Previous message was: ${JSON.stringify(prevIncompletedMessage)}. ` + `Remaining components: ${JSON.stringify(components)}`;
      (_utils || _load_utils()).default.error(message);
      throw new Error(message);
    }

    const isIncompleteResponse = components.length % 2 === 0;

    // Verify empty tail component for completed response.
    if (!isIncompleteResponse) {
      const lastComponent = components.pop();
      if (lastComponent.length !== 0) {
        const message = 'The complete response should terminate with' + ` zero character while got: ${lastComponent} `;
        (_utils || _load_utils()).default.error(message);
        throw new Error(message);
      }
    }

    // Process two tail components into prevIncompletedMessage for incompleted response.
    if (isIncompleteResponse && components.length > 0) {
      if (!(components.length >= 2)) {
        throw new Error('Invariant violation: "components.length >= 2"');
      }
      // content comes after length.


      const content = components.pop();
      const length = Number(components.pop());
      const lastMessage = { length, content };
      if (!this._isIncompletedMessage(lastMessage)) {
        const message = 'The last message should be a fragment of a full message: ' + JSON.stringify(lastMessage);
        (_utils || _load_utils()).default.error(message);
        throw new Error(message);
      }
      prevIncompletedMessage = lastMessage;
    }

    // The remaining middle components should all be completed messages.

    if (!(components.length % 2 === 0)) {
      throw new Error('Invariant violation: "components.length % 2 === 0"');
    }

    while (components.length >= 2) {
      const message = {
        length: Number(components.shift()),
        content: components.shift()
      };
      if (!this._isCompletedMessage(message)) {
        const errorMessage = `Got message length(${message.content.length}) ` + `not equal to expected(${message.length}). ` + `Message was: ${JSON.stringify(message)}`;
        (_utils || _load_utils()).default.error(errorMessage);
        throw new Error(errorMessage);
      }
      results.push(this._parseXml(message));
    }
    this._prevIncompletedMessage = prevIncompletedMessage;
    return results;
  }

  _isCompletedMessage(message) {
    return message.length === message.content.length;
  }

  _isIncompletedMessage(message) {
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
  _parseXml(message) {
    const xml = message.content;
    let errorValue;
    let resultValue;
    (_xml2js || _load_xml2js()).default.parseString(xml, (error, result) => {
      errorValue = error;
      resultValue = result;
    });
    if (errorValue !== null) {
      throw new Error('Error ' + JSON.stringify(errorValue) + ' parsing xml: ' + xml);
    }
    (_utils || _load_utils()).default.debug('Translating server message result json: ' + JSON.stringify(resultValue));

    if (!(resultValue != null)) {
      throw new Error('Invariant violation: "resultValue != null"');
    }

    return resultValue;
  }

  // For testing purpose.
  clearIncompletedMessage() {
    this._prevIncompletedMessage = null;
  }
}
exports.DbgpMessageHandler = DbgpMessageHandler;