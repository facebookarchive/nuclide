/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @noflow
 * @emails oncall+nuclide
 */
'use strict';

/* eslint
  comma-dangle: [1, always-multiline],
  prefer-object-spread/prefer-object-spread: 0,
  nuclide-internal/no-commonjs: 0,
  */

const rule = require('../use-nuclide-ui-components');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

ruleTester.run('use-nuclide-ui-components', rule, {
  valid: [
    {code: 'var good = <Button className="foo" />;'},
  ],
  invalid: [
    {
      code: 'var bad = <button className="foo" />;',
      errors: [{
        message: 'Prefer using `<Button />` from nuclide-commons-ui over home-built `<button />`s',
        type: 'JSXIdentifier',
      }],
    },
  ],
});
