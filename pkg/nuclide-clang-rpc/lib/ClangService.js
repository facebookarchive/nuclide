Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var getClangService = _asyncToGenerator(function* (src, contents, defaultFlags, blocking) {
  var server = yield serverManager.getClangServer(src, contents, defaultFlags);
  if (server == null) {
    return null;
  }
  if (server.getStatus() !== (_ClangServer2 || _ClangServer()).default.Status.READY) {
    if (blocking) {
      yield server.waitForReady();
    } else {
      return null;
    }
  }
  return server.getService();
}

/**
 * Compiles the specified source file (automatically determining the correct compilation flags).
 * It currently returns an Observable just to circumvent the 60s service timeout for Promises.
 * TODO(9519963): Stream back more detailed compile status message.
 */
);

exports.compile = compile;

var getCompletions = _asyncToGenerator(function* (src, contents, line, column, tokenStartColumn, prefix, defaultFlags) {
  var service = yield getClangService(src, contents, defaultFlags);
  if (service != null) {
    return service.get_completions(contents, line, column, tokenStartColumn, prefix);
  }
});

exports.getCompletions = getCompletions;

var getDeclaration = _asyncToGenerator(function* (src, contents, line, column, defaultFlags) {
  var service = yield getClangService(src, contents, defaultFlags);
  if (service != null) {
    return service.get_declaration(contents, line, column);
  }
}

// Fetches information for a declaration and all its parents.
// The first element in info will be for the declaration itself,
// the second will be for its direct semantic parent (if it exists), etc.
);

exports.getDeclaration = getDeclaration;

var getDeclarationInfo = _asyncToGenerator(function* (src, contents, line, column, defaultFlags) {
  var service = yield getClangService(src, contents, defaultFlags);
  if (service != null) {
    return service.get_declaration_info(contents, line, column);
  }
});

exports.getDeclarationInfo = getDeclarationInfo;

var getOutline = _asyncToGenerator(function* (src, contents, defaultFlags) {
  var service = yield getClangService(src, contents, defaultFlags, true);
  if (service != null) {
    return service.get_outline(contents);
  }
});

exports.getOutline = getOutline;

var formatCode = _asyncToGenerator(function* (src, contents, cursor, offset, length) {
  var args = ['-style=file', '-assume-filename=' + src, '-cursor=' + cursor];
  if (offset != null) {
    args.push('-offset=' + offset);
  }
  if (length != null) {
    args.push('-length=' + length);
  }

  var _ref = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).checkOutput)('clang-format', args, { stdin: contents });

  var stdout = _ref.stdout;

  // The first line is a JSON blob indicating the new cursor position.
  var newLine = stdout.indexOf('\n');
  return {
    newCursor: JSON.parse(stdout.substring(0, newLine)).Cursor,
    formatted: stdout.substring(newLine + 1)
  };
}

/**
 * Kill the Clang server for a particular source file,
 * as well as all the cached compilation flags.
 * If no file is provided, all servers are reset.
 */
);

exports.formatCode = formatCode;
exports.reset = reset;
exports.dispose = dispose;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _ClangServer2;

function _ClangServer() {
  return _ClangServer2 = _interopRequireDefault(require('./ClangServer'));
}

var _ClangServerManager2;

function _ClangServerManager() {
  return _ClangServerManager2 = _interopRequireDefault(require('./ClangServerManager'));
}

var serverManager = new (_ClangServerManager2 || _ClangServerManager()).default();

// Maps clang's cursor types to the actual declaration types: for a full list see
// https://github.com/llvm-mirror/clang/blob/master/include/clang/Basic/DeclNodes.td
//
// Keep in sync with the clang Python binding (../fb/lib/python/clang/cindex.py)
// The order of the keys matches the ordering in cindex.py.
var ClangCursorToDeclarationTypes = Object.freeze({
  UNEXPOSED_DECL: '',
  STRUCT_DECL: 'Record',
  UNION_DECL: 'Record',
  CLASS_DECL: 'CXXRecord',
  ENUM_DECL: 'Enum',
  FIELD_DECL: 'Field',
  ENUM_CONSTANT_DECL: 'EnumConstant',
  FUNCTION_DECL: 'Function',
  VAR_DECL: 'Var',
  PARM_DECL: 'ParmVar',
  OBJC_INTERFACE_DECL: 'ObjCInterface',
  OBJC_CATEGORY_DECL: 'ObjCCategory',
  OBJC_PROTOCOL_DECL: 'ObjCProtocol',
  OBJC_PROPERTY_DECL: 'ObjCProperty',
  OBJC_IVAR_DECL: 'ObjCIVar',
  OBJC_INSTANCE_METHOD_DECL: 'ObjCMethod',
  OBJC_CLASS_METHOD_DECL: 'ObjCMethod',
  OBJC_IMPLEMENTATION_DECL: 'ObjCImplementation',
  OBJC_CATEGORY_IMPL_DECL: 'ObjCCategoryImpl',
  TYPEDEF_DECL: 'Typedef',
  CXX_METHOD: 'CXXMethod',
  NAMESPACE: 'Namespace',
  LINKAGE_SPEC: 'LinkageSpec',
  CONSTRUCTOR: 'CXXConstructor',
  DESTRUCTOR: 'CXXDestructor',
  CONVERSION_FUNCTION: 'CXXConversion',
  TEMPLATE_TYPE_PARAMETER: 'TemplateTypeParm',
  TEMPLATE_NON_TYPE_PARAMETER: 'NonTypeTemplateParm',
  TEMPLATE_TEMPLATE_PARAMETER: 'TemplateTemplateParm',
  FUNCTION_TEMPLATE: 'FunctionTemplate',
  CLASS_TEMPLATE: 'ClassTemplate',
  CLASS_TEMPLATE_PARTIAL_SPECIALIZATION: 'ClassTemplatePartialSpecialization',
  NAMESPACE_ALIAS: 'NamespaceAlias',
  USING_DIRECTIVE: 'UsingDirective',
  USING_DECLARATION: 'Using',
  TYPE_ALIAS_DECL: 'TypeAlias',
  OBJC_SYNTHESIZE_DECL: 'ObjCSynthesize',
  OBJC_DYNAMIC_DECL: 'ObjCDynamic',
  CXX_ACCESS_SPEC_DECL: 'AccessSpec',
  OVERLOAD_CANDIDATE: 'Function',
  MACRO_DEFINITION: 'Macro'
});

exports.ClangCursorToDeclarationTypes = ClangCursorToDeclarationTypes;
var ClangCursorTypes = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).keyMirror)(ClangCursorToDeclarationTypes);

exports.ClangCursorTypes = ClangCursorTypes;

function compile(src, contents, defaultFlags) {
  var doCompile = _asyncToGenerator(function* () {
    // Note: restarts the server if the flags changed.
    var server = yield serverManager.getClangServer(src, contents, defaultFlags, true);
    if (server != null) {
      return server.compile(contents).then(function (result) {
        return _extends({}, result, {
          accurateFlags: !server.usesDefaultFlags()
        });
      });
    }
  });
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(doCompile());
}

function reset(src) {
  serverManager.reset(src);
}

function dispose() {
  serverManager.dispose();
}