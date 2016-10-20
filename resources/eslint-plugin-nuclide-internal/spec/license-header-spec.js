'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* NON-TRANSPILED FILE */
/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

const rule = require('../license-header');
const RuleTester = require('eslint').RuleTester;

const SHEBANG = '#!/usr/bin/env node';
const USE_BABEL = '\'use babel\';';
const USE_STRICT = '\'use strict\';';
const FLOW = '/* @flow */';
const NO_FLOW = '/* @noflow */';

const LINE = '';

const LICENSE = `\
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */`;

const LICENSE_WITH_FLOW = `\
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */`;

const CODE = 'module.exports = {};';

const LINE_AFTER_FLOW_PRAGMA_ERROR = 'Expected one line break after the flow pragma';
const LICENSE_ERROR = 'Expected a license header';
const LINE_AFTER_LICENSE_ERROR = 'Expected a line break after the license header';

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

ruleTester.run('license-header', rule, {
  valid: [
    {code: [LICENSE_WITH_FLOW].join('\n')},
    {code: [LICENSE_WITH_FLOW, LINE].join('\n')},
    {code: [LICENSE_WITH_FLOW, LINE, CODE].join('\n')},

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
      code: [SHEBANG, LICENSE_WITH_FLOW].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [USE_BABEL, LICENSE_WITH_FLOW].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [USE_STRICT, LICENSE_WITH_FLOW].join('\n'),
      errors: [LICENSE_ERROR],
    },
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
