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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _yargs2;

function _yargs() {
  return _yargs2 = _interopRequireDefault(require('yargs'));
}

/* eslint-disable no-console */

exports.default = _asyncToGenerator(function* (args) {
  var argv = yield new Promise(function (resolve, reject) {
    resolve((_yargs2 || _yargs()).default.usage('Usage: atom-script ' + __dirname + '/markdown.js -o <output file> <input file>').help('h').alias('h', 'help').option('out', {
      alias: 'o',
      demand: false,
      describe: 'Must specify a path to an output file.',
      type: 'string'
    }).demand(1, 'Must specify a path to a Markdown file.').exitProcess(false).fail(reject) // This will bubble up and cause runCommand() to reject.
    .parse(args));
  });

  // When this happens, the help text has already been printed to stdout.
  if (argv.help) {
    return 1;
  }

  var markdownFile = resolvePath(argv._[0]);

  var textEditor = yield atom.workspace.open(markdownFile);
  yield atom.packages.activatePackage('markdown-preview');

  // Use markdown-preview to generate the HTML.
  var markdownPreviewPackage = atom.packages.getActivePackage('markdown-preview');
  (0, (_assert2 || _assert()).default)(markdownPreviewPackage);
  // Apparently copyHtml() is exposed as an export of markdown-preview.
  markdownPreviewPackage.mainModule.copyHtml();
  // Note it should be possible to get the HTML via MarkdownPreviewView.getHTML(),
  // but that was causing this script to lock up, for some reason.
  var htmlBody = atom.clipboard.read();

  // Attempt to try to load themes so that getMarkdownPreviewCSS() loads the right CSS.
  yield atom.themes.activateThemes();

  // We create a MarkdownPreviewView to call its getMarkdownPreviewCSS() method.
  // $FlowIssue: Need to dynamically load a path.
  var MarkdownPreviewView = require((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(markdownPreviewPackage.path, 'lib/markdown-preview-view.js'));
  var view = new MarkdownPreviewView({
    editorId: textEditor.id,
    filePath: markdownFile
  });
  var styles = view.getMarkdownPreviewCSS();

  var title = markdownFile + '.html';
  // It is not obvious from markdown-preview/lib/markdown-preview-view.coffee#saveAs
  // that the data-use-github-style attribute is key to this working.
  // https://github.com/atom/markdown-preview/pull/335 drew my attention to it.
  //
  // That said, although this attribute improves things, the resulting styles still do not match
  // exactly what you see in Atom. I think this is due to the translation of <atom-text-editor>
  // to <pre> elements, which seems a little off.
  var html = '<!DOCTYPE html>\n<html>\n  <head>\n      <meta charset="utf-8" />\n      <title>' + title + '</title>\n      <style>' + styles + '</style>\n  </head>\n  <body class="markdown-preview" data-use-github-style>' + htmlBody + '</body>\n</html>';

  if (argv.out == null) {
    console.log(html);
  } else {
    var outputFile = resolvePath(argv.out);
    (_fs2 || _fs()).default.writeFileSync(outputFile, html);
  }

  return 0;
});

// TODO(mbolin): Consider using fs-plus to ensure this handles ~ in fileName correctly.
function resolvePath(fileName) {
  if (!(_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isAbsolute(fileName)) {
    var pwd = process.env.PWD;
    (0, (_assert2 || _assert()).default)(pwd);
    return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(pwd, fileName);
  } else {
    return fileName;
  }
}
module.exports = exports.default;