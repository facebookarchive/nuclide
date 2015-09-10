'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Point, Range} = require('atom');

var GRAMMARS = [
  'source.objc',
  'source.objcpp',
];

/**
 * This closes square brackets for Objective-C message calls.
 * Clients must call `disable()` once they're done with an instance.
 */
class ObjectiveCBracketBalancer {
  _editingSubscriptionsMap: Map<TextEditor, atom$Disposable>;
  _languageListener: ?atom$Disposable;

  enable(): void {
    // The feature is already enabled.
    if (this._languageListener) {
      return;
    }

    this._editingSubscriptionsMap = new Map();
    var {observeLanguageTextEditors} = require('nuclide-atom-helpers');
    this._languageListener = observeLanguageTextEditors(
        GRAMMARS,
        textEditor => this._enableInTextEditor(textEditor),
        textEditor => this._disableInTextEditor(textEditor));
  }

  disable(): void {
    // The feature is already disabled.
    if (!this._languageListener) {
      return;
    }
    this._languageListener.dispose();
    this._languageListener = null;

    this._editingSubscriptionsMap.forEach(subscription => subscription.dispose());
    this._editingSubscriptionsMap.clear();
  }

  _enableInTextEditor(textEditor: TextEditor): void {
    var insertTextSubscription = textEditor.onDidInsertText((event) => {
      var {range, text} = event;
      if (text === ']') {
        var buffer = textEditor.getBuffer();
        var leftBracketInsertPosition = ObjectiveCBracketBalancer
          .getOpenBracketInsertPosition(buffer, range.start);
        if (leftBracketInsertPosition) {
          buffer.insert(leftBracketInsertPosition, '[');
        }
      }
    });
    this._editingSubscriptionsMap.set(textEditor, insertTextSubscription);
  }

  _disableInTextEditor(textEditor: TextEditor): void {
    var subscription = this._editingSubscriptionsMap.get(textEditor);
    if (subscription) {
      subscription.dispose();
      this._editingSubscriptionsMap.delete(textEditor);
    }
  }

  static getOpenBracketInsertPosition(
    buffer: atom$TextBuffer,
    closeBracketPosition: Point,
  ): ?Point {
    var closeBracketText = buffer.getTextInRange(Range.fromObject(
        [closeBracketPosition, closeBracketPosition.translate([0, 1])]));
    if (closeBracketText !== ']') {
      throw new Error('The close bracket position must contain a close bracket');
    }

    var startingLine = buffer.lineForRow(closeBracketPosition.row);
    var singleQuoteCount = 0;
    var doubleQuoteCount = 0;
    var characterCount = {
      '[': 0,
      ']': 0,
    };

    // Iterate through the line, determining if we have balanced brackets.
    // We do not count brackets we encounter inside string/char literals.
    for (var i = 0; i < startingLine.length; i++) {
      if (startingLine[i] === '\'') {
        singleQuoteCount++;
      } else if (startingLine[i] === '\"') {
        doubleQuoteCount++;
      } else {
        if (singleQuoteCount % 2 === 0 && doubleQuoteCount % 2 === 0) {
          // We are not inside a char nor string literal. Count the brackets.
          characterCount[startingLine[i]] = characterCount[startingLine[i]] + 1;
        }
      }
    }

    var stringLiteralMatch = /@".*"\s.*]/.exec(startingLine);
    if (stringLiteralMatch) {
      return Point.fromObject([closeBracketPosition.row, stringLiteralMatch.index]);
    } else if (characterCount['['] < characterCount[']']) {
      // Check if we're at the bottom of a multi-line method.
      var multiLineMethodRegex = /^[\s\w\[]*:.*[^;{];?$/;
      var currentRow = closeBracketPosition.row;
      var currentRowPlusOne = null;
      var match = multiLineMethodRegex.exec(buffer.lineForRow(currentRow));

      while (match !== null) {
        currentRowPlusOne = currentRow;
        match = multiLineMethodRegex.exec(buffer.lineForRow(--currentRow));
      }

      if (currentRowPlusOne !== null && currentRowPlusOne !== closeBracketPosition.row) {
        var targetLine = buffer.lineForRow(currentRowPlusOne);
        var targetMatch = /\S/.exec(targetLine);

        if (targetLine[targetMatch.index] === '[') {
          return null;
        } else {
          return Point.fromObject([currentRowPlusOne, targetMatch.index]);
        }
      } else {
        // We need a bracket on this line - at this point it's either
        // At the beginning, or after an `=`.
        var initMatch = /.*(=\s?)\S/.exec(startingLine);
        var startOfLineMatch = /\S/.exec(startingLine);
        var column = 0;

        if (initMatch && initMatch[1]) {
          var equalsMatchPosition = startingLine.lastIndexOf(initMatch[1]);
          column = equalsMatchPosition += initMatch[1].length;
        } else if (startOfLineMatch && startOfLineMatch.index) {
          column = startOfLineMatch.index;
        } else {
          column = 0;
        }

        return Point.fromObject([closeBracketPosition.row, column]);
      }
    } else {
      return null;
    }
  }
}

module.exports = ObjectiveCBracketBalancer;
