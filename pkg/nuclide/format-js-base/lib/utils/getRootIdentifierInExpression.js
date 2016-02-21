

var jscs = require('jscodeshift');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var match = jscs.match;

/**
 * This traverses a node to find the first identifier in nested expressions.
 */
function getRootIdentifierInExpression(_x) {
  var _again = true;

  _function: while (_again) {
    var node = _x;
    _again = false;

    if (!node) {
      return null;
    }
    if (match(node, { type: 'ExpressionStatement' })) {
      _x = node.expression;
      _again = true;
      continue _function;
    }
    if (match(node, { type: 'CallExpression' })) {
      _x = node.callee;
      _again = true;
      continue _function;
    }
    if (match(node, { type: 'MemberExpression' })) {
      _x = node.object;
      _again = true;
      continue _function;
    }
    if (match(node, { type: 'Identifier' })) {
      return node;
    }
    return null;
  }
}

module.exports = getRootIdentifierInExpression;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldFJvb3RJZGVudGlmaWVySW5FeHByZXNzaW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBYUEsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0lBRTdCLEtBQUssR0FBSSxJQUFJLENBQWIsS0FBSzs7Ozs7QUFLWixTQUFTLDZCQUE2Qjs7OzRCQUFxQjtRQUFwQixJQUFXOzs7QUFDaEQsUUFBSSxDQUFDLElBQUksRUFBRTtBQUNULGFBQU8sSUFBSSxDQUFDO0tBQ2I7QUFDRCxRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUMsQ0FBQyxFQUFFO1dBQ1QsSUFBSSxDQUFDLFVBQVU7OztLQUNyRDtBQUNELFFBQUksS0FBSyxDQUFDLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBQyxDQUFDLEVBQUU7V0FDSixJQUFJLENBQUMsTUFBTTs7O0tBQ2pEO0FBQ0QsUUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFDLENBQUMsRUFBRTtXQUNOLElBQUksQ0FBQyxNQUFNOzs7S0FDakQ7QUFDRCxRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFDLENBQUMsRUFBRTtBQUNyQyxhQUFPLElBQUksQ0FBQztLQUNiO0FBQ0QsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUFBOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsNkJBQTZCLENBQUMiLCJmaWxlIjoiZ2V0Um9vdElkZW50aWZpZXJJbkV4cHJlc3Npb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Tm9kZX0gZnJvbSAnLi4vdHlwZXMvYXN0JztcblxuY29uc3QganNjcyA9IHJlcXVpcmUoJ2pzY29kZXNoaWZ0Jyk7XG5cbmNvbnN0IHttYXRjaH0gPSBqc2NzO1xuXG4vKipcbiAqIFRoaXMgdHJhdmVyc2VzIGEgbm9kZSB0byBmaW5kIHRoZSBmaXJzdCBpZGVudGlmaWVyIGluIG5lc3RlZCBleHByZXNzaW9ucy5cbiAqL1xuZnVuY3Rpb24gZ2V0Um9vdElkZW50aWZpZXJJbkV4cHJlc3Npb24obm9kZTogP05vZGUpOiA/Tm9kZSB7XG4gIGlmICghbm9kZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChtYXRjaChub2RlLCB7dHlwZTogJ0V4cHJlc3Npb25TdGF0ZW1lbnQnfSkpIHtcbiAgICByZXR1cm4gZ2V0Um9vdElkZW50aWZpZXJJbkV4cHJlc3Npb24obm9kZS5leHByZXNzaW9uKTtcbiAgfVxuICBpZiAobWF0Y2gobm9kZSwge3R5cGU6ICdDYWxsRXhwcmVzc2lvbid9KSkge1xuICAgIHJldHVybiBnZXRSb290SWRlbnRpZmllckluRXhwcmVzc2lvbihub2RlLmNhbGxlZSk7XG4gIH1cbiAgaWYgKG1hdGNoKG5vZGUsIHt0eXBlOiAnTWVtYmVyRXhwcmVzc2lvbid9KSkge1xuICAgIHJldHVybiBnZXRSb290SWRlbnRpZmllckluRXhwcmVzc2lvbihub2RlLm9iamVjdCk7XG4gIH1cbiAgaWYgKG1hdGNoKG5vZGUsIHt0eXBlOiAnSWRlbnRpZmllcid9KSkge1xuICAgIHJldHVybiBub2RlO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJvb3RJZGVudGlmaWVySW5FeHByZXNzaW9uO1xuIl19