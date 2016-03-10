

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var jscs = require('jscodeshift');

/**
 * This module helps support a hack to easily introduce new lines into the AST.
 */
var NewLine = Object.defineProperties({
  literal: '$$newline$$',
  replace: function replace(input) {
    /**
     * This regex functions by matching:
     *
     *   - contiguous new lines
     *   - non new line characters
     *   - the string "$$newline$$" and surrounding characters
     *   - non new line characters
     *   - contiguous new lines
     *
     * This way it only removes extra new lines around the explicit new lines
     * we have added in the file. It does not remove arbitrary extra new lines.
     */
    return input.replace(/(\n*[^\n]*\$\$newline\$\$[^\n]*\n*){1,}/g, '\n\n');
  }
}, {
  statement: {
    get: function get() {
      return jscs.expressionStatement(jscs.literal(NewLine.literal));
    },
    configurable: true,
    enumerable: true
  }
});

module.exports = NewLine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5ld0xpbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVdBLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7Ozs7QUFLcEMsSUFBTSxPQUFPLDJCQUFHO0FBQ2QsU0FBTyxFQUFFLGFBQWE7QUFDdEIsU0FBTyxFQUFBLGlCQUFDLEtBQWEsRUFBVTs7Ozs7Ozs7Ozs7OztBQWE3QixXQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsMENBQTBDLEVBQUUsTUFBTSxDQUFDLENBQUM7R0FDMUU7Q0FJRjtBQUhLLFdBQVM7U0FBQSxlQUFHO0FBQ2QsYUFBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUNoRTs7OztFQUNGLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMiLCJmaWxlIjoiTmV3TGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGpzY3MgPSByZXF1aXJlKCdqc2NvZGVzaGlmdCcpO1xuXG4vKipcbiAqIFRoaXMgbW9kdWxlIGhlbHBzIHN1cHBvcnQgYSBoYWNrIHRvIGVhc2lseSBpbnRyb2R1Y2UgbmV3IGxpbmVzIGludG8gdGhlIEFTVC5cbiAqL1xuY29uc3QgTmV3TGluZSA9IHtcbiAgbGl0ZXJhbDogJyQkbmV3bGluZSQkJyxcbiAgcmVwbGFjZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvKipcbiAgICAgKiBUaGlzIHJlZ2V4IGZ1bmN0aW9ucyBieSBtYXRjaGluZzpcbiAgICAgKlxuICAgICAqICAgLSBjb250aWd1b3VzIG5ldyBsaW5lc1xuICAgICAqICAgLSBub24gbmV3IGxpbmUgY2hhcmFjdGVyc1xuICAgICAqICAgLSB0aGUgc3RyaW5nIFwiJCRuZXdsaW5lJCRcIiBhbmQgc3Vycm91bmRpbmcgY2hhcmFjdGVyc1xuICAgICAqICAgLSBub24gbmV3IGxpbmUgY2hhcmFjdGVyc1xuICAgICAqICAgLSBjb250aWd1b3VzIG5ldyBsaW5lc1xuICAgICAqXG4gICAgICogVGhpcyB3YXkgaXQgb25seSByZW1vdmVzIGV4dHJhIG5ldyBsaW5lcyBhcm91bmQgdGhlIGV4cGxpY2l0IG5ldyBsaW5lc1xuICAgICAqIHdlIGhhdmUgYWRkZWQgaW4gdGhlIGZpbGUuIEl0IGRvZXMgbm90IHJlbW92ZSBhcmJpdHJhcnkgZXh0cmEgbmV3IGxpbmVzLlxuICAgICAqL1xuICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKC8oXFxuKlteXFxuXSpcXCRcXCRuZXdsaW5lXFwkXFwkW15cXG5dKlxcbiopezEsfS9nLCAnXFxuXFxuJyk7XG4gIH0sXG4gIGdldCBzdGF0ZW1lbnQoKSB7XG4gICAgcmV0dXJuIGpzY3MuZXhwcmVzc2lvblN0YXRlbWVudChqc2NzLmxpdGVyYWwoTmV3TGluZS5saXRlcmFsKSk7XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5ld0xpbmU7XG4iXX0=