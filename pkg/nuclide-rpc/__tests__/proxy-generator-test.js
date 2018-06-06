'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _types;

function _load_types() {
  return _types = _interopRequireWildcard(require('@babel/types'));
}

var _generator;

function _load_generator() {
  return _generator = _interopRequireDefault(require('@babel/generator'));
}

var _proxyGenerator;

function _load_proxyGenerator() {
  return _proxyGenerator = _interopRequireDefault(require('../lib/proxy-generator'));
}

var _serviceParser;

function _load_serviceParser() {
  return _serviceParser = require('../lib/service-parser');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _vm = _interopRequireDefault(require('vm'));

var _builtinTypes;

function _load_builtinTypes() {
  return _builtinTypes = require('../lib/builtin-types');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { generateProxy, __test__ } = (0, (_proxyGenerator || _load_proxyGenerator()).default)(_types || _load_types(), (_generator || _load_generator()).default); /**
                                                                                                                                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                   * All rights reserved.
                                                                                                                                                                   *
                                                                                                                                                                   * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                   * the root directory of this source tree.
                                                                                                                                                                   *
                                                                                                                                                                   * 
                                                                                                                                                                   * @format
                                                                                                                                                                   */

describe('Proxy generator test suite.', () => {
  for (const file of _fs.default.readdirSync((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures'))) {
    if (file.endsWith('.def')) {
      it(`Successfully generates proxy for ${file}`, () => {
        const fixturePath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures', file);
        const definitions = (0, (_serviceParser || _load_serviceParser()).parseServiceDefinition)(file, _fs.default.readFileSync(fixturePath, 'utf8'), []);

        const code = generateProxy((_nuclideUri || _load_nuclideUri()).default.basename(file, '.def'), false, definitions);
        const expected = _fs.default.readFileSync((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures', file).replace('.def', '.proxy'), 'utf8');
        expect(code.trim()).toBe(expected.trim());
      });
    }
  }
});

const ArrayOfArrayOfNuclideUri = {
  location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
  kind: 'array',
  type: {
    location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
    kind: 'array',
    type: {
      location: (_builtinTypes || _load_builtinTypes()).builtinLocation,
      kind: 'named',
      name: (_nuclideUri || _load_nuclideUri()).default.NUCLIDE_URI_TYPE_NAME
    }
  }
};

describe('generateTransformStatement helper function', () => {
  it('Generates a marshal statement.', () => {
    const code = (0, (_generator || _load_generator()).default)(__test__.generateTransformStatement((_types || _load_types()).identifier('value'), ArrayOfArrayOfNuclideUri, true)).code;
    expect(code).toBe(marshalText);
  });

  it('Generates an unmarshal statement.', () => {
    const code = (0, (_generator || _load_generator()).default)(__test__.generateTransformStatement((_types || _load_types()).identifier('value'), ArrayOfArrayOfNuclideUri, false)).code;
    expect(code).toBe(unmarshalText);
  });
});

const marshalText = `_client.marshal(value, {
  location: {
    type: "builtin"
  },
  kind: "array",
  type: {
    location: {
      type: "builtin"
    },
    kind: "array",
    type: {
      location: {
        type: "builtin"
      },
      kind: "named",
      name: "NuclideUri"
    }
  }
})`;

const unmarshalText = `_client.unmarshal(value, {
  location: {
    type: "builtin"
  },
  kind: "array",
  type: {
    location: {
      type: "builtin"
    },
    kind: "array",
    type: {
      location: {
        type: "builtin"
      },
      kind: "named",
      name: "NuclideUri"
    }
  }
})`;

describe('objectToLiteral helper function', () => {
  it('works on numbers', () => {
    expect((0, (_generator || _load_generator()).default)(__test__.objectToLiteral(1)).code).toBe('1');
  });

  it('works on strings', () => {
    expect((0, (_generator || _load_generator()).default)(__test__.objectToLiteral('1')).code).toBe('"1"');
  });

  it('works on booleans', () => {
    expect((0, (_generator || _load_generator()).default)(__test__.objectToLiteral(false)).code).toBe('false');
  });

  it('works on Maps', () => {
    expect((0, (_generator || _load_generator()).default)(__test__.objectToLiteral(new Map())).code).toBe('new Map()');
  });

  it('works on objects with simple keys', () => {
    expect((0, (_generator || _load_generator()).default)(__test__.objectToLiteral({ a: 1 })).code).toBe('{\n  a: 1\n}');
  });

  it('works on objects with complex keys', () => {
    expect((0, (_generator || _load_generator()).default)(__test__.objectToLiteral({ '.': 1 })).code).toBe('{\n  ".": 1\n}');
  });

  it('works on null', () => {
    expect((0, (_generator || _load_generator()).default)(__test__.objectToLiteral(null)).code).toBe('null');
  });

  it('works on undefined', () => {
    expect((0, (_generator || _load_generator()).default)(__test__.objectToLiteral()).code).toBe('undefined');
    expect((0, (_generator || _load_generator()).default)(__test__.objectToLiteral(undefined)).code).toBe('undefined');
  });

  it('works on arrays', () => {
    expect((0, (_generator || _load_generator()).default)(__test__.objectToLiteral([])).code).toBe('[]');
  });

  it('throws on unknown type function', () => {
    expect(() => {
      (0, (_generator || _load_generator()).default)(__test__.objectToLiteral(() => {})).code;
    }).toThrow(new Error('Cannot convert unknown type function to literal.'));
  });

  it('throws on unknown type nested function', () => {
    expect(() => {
      (0, (_generator || _load_generator()).default)(__test__.objectToLiteral({ fn: () => {} })).code;
    }).toThrow(new Error('Cannot convert unknown type function to literal.'));
  });

  it('throws on unknown type class', () => {
    expect(() => {
      (0, (_generator || _load_generator()).default)(__test__.objectToLiteral(class X {})).code;
      // Native classes also pass typeof === 'function'
    }).toThrow(new Error('Cannot convert unknown type function to literal.'));
  });
});