"use strict";

var _fs = _interopRequireDefault(require("fs"));

function t() {
  const data = _interopRequireWildcard(require("@babel/types"));

  t = function () {
    return data;
  };

  return data;
}

function _generator() {
  const data = _interopRequireDefault(require("@babel/generator"));

  _generator = function () {
    return data;
  };

  return data;
}

function _proxyGenerator() {
  const data = _interopRequireDefault(require("../lib/proxy-generator"));

  _proxyGenerator = function () {
    return data;
  };

  return data;
}

function _serviceParser() {
  const data = require("../lib/service-parser");

  _serviceParser = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _builtinTypes() {
  const data = require("../lib/builtin-types");

  _builtinTypes = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
 * @emails oncall+nuclide
 */
const {
  generateProxy,
  __test__
} = (0, _proxyGenerator().default)(t(), _generator().default);
describe('Proxy generator test suite.', () => {
  for (const file of _fs.default.readdirSync(_nuclideUri().default.join(__dirname, '../__mocks__/fixtures'))) {
    if (file.endsWith('.def')) {
      it(`Successfully generates proxy for ${file}`, () => {
        const fixturePath = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures', file);

        const definitions = (0, _serviceParser().parseServiceDefinition)(file, _fs.default.readFileSync(fixturePath, 'utf8'), []);
        const code = generateProxy(_nuclideUri().default.basename(file, '.def'), false, definitions);

        const expected = _fs.default.readFileSync(_nuclideUri().default.join(__dirname, '../__mocks__/fixtures', file).replace('.def', '.proxy'), 'utf8');

        expect(code.trim()).toBe(expected.trim());
      });
    }
  }
});
const ArrayOfArrayOfNuclideUri = {
  location: _builtinTypes().builtinLocation,
  kind: 'array',
  type: {
    location: _builtinTypes().builtinLocation,
    kind: 'array',
    type: {
      location: _builtinTypes().builtinLocation,
      kind: 'named',
      name: _nuclideUri().default.NUCLIDE_URI_TYPE_NAME
    }
  }
};
describe('generateTransformStatement helper function', () => {
  it('Generates a marshal statement.', () => {
    const code = (0, _generator().default)(__test__.generateTransformStatement(t().identifier('value'), ArrayOfArrayOfNuclideUri, true)).code;
    expect(code).toBe(marshalText);
  });
  it('Generates an unmarshal statement.', () => {
    const code = (0, _generator().default)(__test__.generateTransformStatement(t().identifier('value'), ArrayOfArrayOfNuclideUri, false)).code;
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
    expect((0, _generator().default)(__test__.objectToLiteral(1)).code).toBe('1');
  });
  it('works on strings', () => {
    expect((0, _generator().default)(__test__.objectToLiteral('1')).code).toBe('"1"');
  });
  it('works on booleans', () => {
    expect((0, _generator().default)(__test__.objectToLiteral(false)).code).toBe('false');
  });
  it('works on Maps', () => {
    expect((0, _generator().default)(__test__.objectToLiteral(new Map())).code).toBe('new Map()');
  });
  it('works on objects with simple keys', () => {
    expect((0, _generator().default)(__test__.objectToLiteral({
      a: 1
    })).code).toBe('{\n  a: 1\n}');
  });
  it('works on objects with complex keys', () => {
    expect((0, _generator().default)(__test__.objectToLiteral({
      '.': 1
    })).code).toBe('{\n  ".": 1\n}');
  });
  it('works on null', () => {
    expect((0, _generator().default)(__test__.objectToLiteral(null)).code).toBe('null');
  });
  it('works on undefined', () => {
    expect((0, _generator().default)(__test__.objectToLiteral()).code).toBe('undefined');
    expect((0, _generator().default)(__test__.objectToLiteral(undefined)).code).toBe('undefined');
  });
  it('works on arrays', () => {
    expect((0, _generator().default)(__test__.objectToLiteral([])).code).toBe('[]');
  });
  it('throws on unknown type function', () => {
    expect(() => {
      (0, _generator().default)(__test__.objectToLiteral(() => {})).code;
    }).toThrow(new Error('Cannot convert unknown type function to literal.'));
  });
  it('throws on unknown type nested function', () => {
    expect(() => {
      (0, _generator().default)(__test__.objectToLiteral({
        fn: () => {}
      })).code;
    }).toThrow(new Error('Cannot convert unknown type function to literal.'));
  });
  it('throws on unknown type class', () => {
    expect(() => {
      (0, _generator().default)(__test__.objectToLiteral(class X {})).code; // Native classes also pass typeof === 'function'
    }).toThrow(new Error('Cannot convert unknown type function to literal.'));
  });
});