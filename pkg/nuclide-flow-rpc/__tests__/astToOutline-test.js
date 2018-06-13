'use strict';

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _astToOutline;

function _load_astToOutline() {
  return _astToOutline = require('../lib/astToOutline');
}

var _classAstOld;

function _load_classAstOld() {
  return _classAstOld = _interopRequireDefault(require('../__mocks__/fixtures/class-ast-old.json'));
}

var _classAstV;

function _load_classAstV() {
  return _classAstV = _interopRequireDefault(require('../__mocks__/fixtures/class-ast-v0.34.json'));
}

var _jasmineAstOld;

function _load_jasmineAstOld() {
  return _jasmineAstOld = _interopRequireDefault(require('../__mocks__/fixtures/jasmine-ast-old.json'));
}

var _jasmineAstV;

function _load_jasmineAstV() {
  return _jasmineAstV = _interopRequireDefault(require('../__mocks__/fixtures/jasmine-ast-v0.34.json'));
}

var _toplevelAstOld;

function _load_toplevelAstOld() {
  return _toplevelAstOld = _interopRequireDefault(require('../__mocks__/fixtures/toplevel-ast-old.json'));
}

var _toplevelAstV;

function _load_toplevelAstV() {
  return _toplevelAstV = _interopRequireDefault(require('../__mocks__/fixtures/toplevel-ast-v0.34.json'));
}

var _exportsAstOld;

function _load_exportsAstOld() {
  return _exportsAstOld = _interopRequireDefault(require('../__mocks__/fixtures/exports-ast-old.json'));
}

var _exportsAstV;

function _load_exportsAstV() {
  return _exportsAstV = _interopRequireDefault(require('../__mocks__/fixtures/exports-ast-v0.34.json'));
}

var _exportsClassAst;

function _load_exportsClassAst() {
  return _exportsClassAst = _interopRequireDefault(require('../__mocks__/fixtures/exports-class-ast.json'));
}

var _exportDefaultArrowFuncV;

function _load_exportDefaultArrowFuncV() {
  return _exportDefaultArrowFuncV = _interopRequireDefault(require('../__mocks__/fixtures/export-default-arrow-func-v0.34.json'));
}

var _exportDefaultAnonymousFuncV;

function _load_exportDefaultAnonymousFuncV() {
  return _exportDefaultAnonymousFuncV = _interopRequireDefault(require('../__mocks__/fixtures/export-default-anonymous-func-v0.34.json'));
}

var _typesAstOld;

function _load_typesAstOld() {
  return _typesAstOld = _interopRequireDefault(require('../__mocks__/fixtures/types-ast-old.json'));
}

var _typesAstV;

function _load_typesAstV() {
  return _typesAstV = _interopRequireDefault(require('../__mocks__/fixtures/types-ast-v0.34.json'));
}

var _declareAst;

function _load_declareAst() {
  return _declareAst = _interopRequireDefault(require('../__mocks__/fixtures/declare-ast.json'));
}

var _interfacesAst;

function _load_interfacesAst() {
  return _interfacesAst = _interopRequireDefault(require('../__mocks__/fixtures/interfaces-ast.json'));
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

describe('astToOutline', () => {
  it('should provide a class outline', () => {
    // Old version
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_classAstOld || _load_classAstOld()).default).outlineTrees).toMatchSnapshot();
    // Newer, introduced AssignmentPattern for default function args (v0.33), made a bunch of other
    // changes (v0.34)
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_classAstV || _load_classAstV()).default).outlineTrees).toMatchSnapshot();
  });

  it('should provide an outline for miscellaneous top-level statements', () => {
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_toplevelAstOld || _load_toplevelAstOld()).default).outlineTrees).toMatchSnapshot();
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_toplevelAstV || _load_toplevelAstV()).default).outlineTrees).toMatchSnapshot();
  });

  it('should provide an outline for Jasmine specs', () => {
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_jasmineAstOld || _load_jasmineAstOld()).default).outlineTrees).toMatchSnapshot();
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_jasmineAstV || _load_jasmineAstV()).default).outlineTrees).toMatchSnapshot();
  });

  it('should provide an outline for module.exports', () => {
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_exportsAstOld || _load_exportsAstOld()).default).outlineTrees).toMatchSnapshot();
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_exportsAstV || _load_exportsAstV()).default).outlineTrees).toMatchSnapshot();
  });

  it('should provide an outline for module.exports class expression assignments', () => {
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_exportsClassAst || _load_exportsClassAst()).default).outlineTrees).toMatchSnapshot();
  });

  it('should provide an outline for type declarations', () => {
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_typesAstOld || _load_typesAstOld()).default).outlineTrees).toMatchSnapshot();
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_typesAstV || _load_typesAstV()).default).outlineTrees).toMatchSnapshot();
  });

  it('should provide an outline for export default () => {}', () => {
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_exportDefaultArrowFuncV || _load_exportDefaultArrowFuncV()).default).outlineTrees).toMatchSnapshot();
  });

  it('should provide an outline for export default function() {}', () => {
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_exportDefaultAnonymousFuncV || _load_exportDefaultAnonymousFuncV()).default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline for declare class, declare module and declare function', () => {
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_declareAst || _load_declareAst()).default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline with interface declarations', () => {
    expect((0, (_astToOutline || _load_astToOutline()).astToOutline)((_interfacesAst || _load_interfacesAst()).default).outlineTrees).toMatchSnapshot();
  });
});