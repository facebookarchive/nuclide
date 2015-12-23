'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-var, prefer-const*/

var rule = require('../fb-license-header');
var RuleTester = require('eslint').RuleTester;

var SHEBANG = '#!/usr/bin/env node --harmony';
var USE_BABEL = '\'use babel\';';
var USE_STRICT = '\'use strict\';';
var FLOW = '/* @flow */';
var NO_FLOW = '/* @noflow */';

var LINE = '';

var LICENSE =
  '/*\n' +
  ' * Copyright (c) 2015-present, Facebook, Inc.\n' +
  ' * All rights reserved.\n' +
  ' *\n' +
  ' * This source code is licensed under the license found in the LICENSE file in\n' +
  ' * the root directory of this source tree.\n' +
  ' */';

var CODE = 'module.exports = {};';

var LINE_AFTER_FLOW_PRAGMA_ERROR = 'Expected one line break after the flow pragma';
var LICENSE_ERROR = 'Expected a license header';
var LINE_AFTER_LICENSE_ERROR = 'Expected a line break after the license header';

var ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

ruleTester.run('fb-license-header', rule, {
  valid: [
    {code: [SHEBANG, USE_BABEL, FLOW, LINE, LICENSE].join('\n')},
    {code: [SHEBANG, USE_BABEL, NO_FLOW, LINE, LICENSE].join('\n')},
    {code: [SHEBANG, USE_BABEL, FLOW, LINE, LICENSE, LINE, CODE].join('\n')},
    {code: [SHEBANG, USE_BABEL, NO_FLOW, LINE, LICENSE, LINE, CODE].join('\n')},

    {code: [SHEBANG, USE_STRICT, FLOW, LINE, LICENSE].join('\n')},
    {code: [SHEBANG, USE_STRICT, NO_FLOW, LINE, LICENSE].join('\n')},
    {code: [SHEBANG, USE_STRICT, FLOW, LINE, LICENSE, LINE, CODE].join('\n')},
    {code: [SHEBANG, USE_STRICT, NO_FLOW, LINE, LICENSE, LINE, CODE].join('\n')},

    {code: [SHEBANG, FLOW, LINE, LICENSE].join('\n')},
    {code: [SHEBANG, NO_FLOW, LINE, LICENSE].join('\n')},
    {code: [SHEBANG, FLOW, LINE, LICENSE, LINE, CODE].join('\n')},
    {code: [SHEBANG, NO_FLOW, LINE, LICENSE, LINE, CODE].join('\n')},

    {code: [SHEBANG, LICENSE].join('\n')},
    {code: [SHEBANG, LICENSE, LINE, CODE].join('\n')},

    {code: [USE_BABEL, FLOW, LINE, LICENSE].join('\n')},
    {code: [USE_BABEL, NO_FLOW, LINE, LICENSE].join('\n')},
    {code: [USE_BABEL, FLOW, LINE, LICENSE, LINE, CODE].join('\n')},
    {code: [USE_BABEL, NO_FLOW, LINE, LICENSE, LINE, CODE].join('\n')},

    {code: [USE_STRICT, FLOW, LINE, LICENSE].join('\n')},
    {code: [USE_STRICT, NO_FLOW, LINE, LICENSE].join('\n')},
    {code: [USE_STRICT, FLOW, LINE, LICENSE, LINE, CODE].join('\n')},
    {code: [USE_STRICT, NO_FLOW, LINE, LICENSE, LINE, CODE].join('\n')},

    {code: [USE_BABEL, LICENSE].join('\n')},
    {code: [USE_BABEL, LICENSE, LINE, CODE].join('\n')},
    {code: [USE_STRICT, LICENSE].join('\n')},
    {code: [USE_STRICT, LICENSE, LINE, CODE].join('\n')},

    {code: [FLOW, LINE, LICENSE].join('\n')},
    {code: [NO_FLOW, LINE, LICENSE].join('\n')},
    {code: [FLOW, LINE, LICENSE, LINE, CODE].join('\n')},
    {code: [NO_FLOW, LINE, LICENSE, LINE, CODE].join('\n')},

    {code: [LICENSE].join('\n')},
    {code: [LICENSE, LINE, CODE].join('\n')},
  ],
  invalid: [
    {
      code: [SHEBANG].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [FLOW].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [NO_FLOW].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [FLOW, LINE].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [NO_FLOW, LINE].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [USE_BABEL, FLOW].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [USE_STRICT, FLOW].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [USE_STRICT, FLOW, LICENSE].join('\n'),
      errors: [LINE_AFTER_FLOW_PRAGMA_ERROR],
    },
    {
      code: [USE_STRICT, FLOW, CODE].join('\n'),
      errors: [LICENSE_ERROR, LINE_AFTER_FLOW_PRAGMA_ERROR],
    },
    {
      code: [LICENSE, CODE].join('\n'),
      errors: [LINE_AFTER_LICENSE_ERROR],
    },
    {
      code: [CODE, LICENSE].join('\n'),
      errors: [LICENSE_ERROR],
    },
  ],
});
