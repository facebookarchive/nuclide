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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

/* eslint-disable no-console */

exports['default'] = _asyncToGenerator(function* (args) {
  var argv = yield new Promise(function (resolve, reject) {
    resolve(_yargs2['default'].usage('Usage: atom-script ' + __dirname + '/markdown.js -o <output file> <input file>').help('h').alias('h', 'help').option('out', {
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
  var outputFile = argv.out == null ? markdownFile + '.html' : resolvePath(argv.out);

  var textEditor = yield atom.workspace.open(markdownFile);
  yield atom.packages.activatePackage('markdown-preview');

  // Use markdown-preview to generate the HTML.
  var markdownPreviewPackage = atom.packages.getActivePackage('markdown-preview');
  (0, _assert2['default'])(markdownPreviewPackage);
  // Apparently copyHtml() is exposed as an export of markdown-preview.
  markdownPreviewPackage.mainModule.copyHtml();
  // Note it should be possible to get the HTML via MarkdownPreviewView.getHTML(),
  // but that was causing this script to lock up, for some reason.
  var htmlBody = atom.clipboard.read();

  // Attempt to try to load themes so that getMarkdownPreviewCSS() loads the right CSS.
  yield atom.themes.activateThemes();

  // We create a MarkdownPreviewView to call its getMarkdownPreviewCSS() method.
  // $FlowIssue: Need to dynamically load a path.
  var MarkdownPreviewView = require(_path2['default'].join(markdownPreviewPackage.path, 'lib/markdown-preview-view.js'));
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
  var html = '\n<!DOCTYPE html>\n<html>\n  <head>\n      <meta charset="utf-8" />\n      <title>' + title + '</title>\n      <style>' + styles + '</style>\n  </head>\n  <body class="markdown-preview" data-use-github-style>' + htmlBody + '</body>\n</html>\n';

  // Currently, we are still having problems with console.log(),
  // so we rely exclusively on the --out flag to decide where to write output.
  _fs2['default'].writeFileSync(outputFile, html);
  return 0;
});

// TODO(mbolin): Consider using fs-plus to ensure this handles ~ in fileName correctly.
function resolvePath(fileName) {
  if (!_path2['default'].isAbsolute(fileName)) {
    var pwd = process.env['PWD'];
    (0, _assert2['default'])(pwd);
    return _path2['default'].join(pwd, fileName);
  } else {
    return fileName;
  }
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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TyxrQkFBSyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQ2pDLE1BQU07QUFDTCxXQUFPLFFBQVEsQ0FBQztHQUNqQjtDQUNGIiwiZmlsZSI6Im1hcmtkb3duLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0V4aXRDb2RlfSBmcm9tICcuLic7XG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB5YXJncyBmcm9tICd5YXJncyc7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gcnVuQ29tbWFuZChhcmdzOiBBcnJheTxzdHJpbmc+KTogUHJvbWlzZTxFeGl0Q29kZT4ge1xuICBjb25zdCBhcmd2ID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHJlc29sdmUoeWFyZ3NcbiAgICAgIC51c2FnZShgVXNhZ2U6IGF0b20tc2NyaXB0ICR7X19kaXJuYW1lfS9tYXJrZG93bi5qcyAtbyA8b3V0cHV0IGZpbGU+IDxpbnB1dCBmaWxlPmApXG4gICAgICAuaGVscCgnaCcpXG4gICAgICAuYWxpYXMoJ2gnLCAnaGVscCcpXG4gICAgICAub3B0aW9uKCdvdXQnLCB7XG4gICAgICAgIGFsaWFzOiAnbycsXG4gICAgICAgIGRlbWFuZDogZmFsc2UsXG4gICAgICAgIGRlc2NyaWJlOiAnTXVzdCBzcGVjaWZ5IGEgcGF0aCB0byBhbiBvdXRwdXQgZmlsZS4nLFxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIH0pXG4gICAgICAuZGVtYW5kKDEsICdNdXN0IHNwZWNpZnkgYSBwYXRoIHRvIGEgTWFya2Rvd24gZmlsZS4nKVxuICAgICAgLmV4aXRQcm9jZXNzKGZhbHNlKVxuICAgICAgLmZhaWwocmVqZWN0KSAvLyBUaGlzIHdpbGwgYnViYmxlIHVwIGFuZCBjYXVzZSBydW5Db21tYW5kKCkgdG8gcmVqZWN0LlxuICAgICAgLnBhcnNlKGFyZ3MpKTtcbiAgfSk7XG5cbiAgLy8gV2hlbiB0aGlzIGhhcHBlbnMsIHRoZSBoZWxwIHRleHQgaGFzIGFscmVhZHkgYmVlbiBwcmludGVkIHRvIHN0ZG91dC5cbiAgaWYgKGFyZ3YuaGVscCkge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgY29uc3QgbWFya2Rvd25GaWxlID0gcmVzb2x2ZVBhdGgoYXJndi5fWzBdKTtcbiAgY29uc3Qgb3V0cHV0RmlsZSA9IGFyZ3Yub3V0ID09IG51bGwgPyBgJHttYXJrZG93bkZpbGV9Lmh0bWxgIDogcmVzb2x2ZVBhdGgoYXJndi5vdXQpO1xuXG4gIGNvbnN0IHRleHRFZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKG1hcmtkb3duRmlsZSk7XG4gIGF3YWl0IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3Jyk7XG5cbiAgLy8gVXNlIG1hcmtkb3duLXByZXZpZXcgdG8gZ2VuZXJhdGUgdGhlIEhUTUwuXG4gIGNvbnN0IG1hcmtkb3duUHJldmlld1BhY2thZ2UgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ21hcmtkb3duLXByZXZpZXcnKTtcbiAgaW52YXJpYW50KG1hcmtkb3duUHJldmlld1BhY2thZ2UpO1xuICAvLyBBcHBhcmVudGx5IGNvcHlIdG1sKCkgaXMgZXhwb3NlZCBhcyBhbiBleHBvcnQgb2YgbWFya2Rvd24tcHJldmlldy5cbiAgbWFya2Rvd25QcmV2aWV3UGFja2FnZS5tYWluTW9kdWxlLmNvcHlIdG1sKCk7XG4gIC8vIE5vdGUgaXQgc2hvdWxkIGJlIHBvc3NpYmxlIHRvIGdldCB0aGUgSFRNTCB2aWEgTWFya2Rvd25QcmV2aWV3Vmlldy5nZXRIVE1MKCksXG4gIC8vIGJ1dCB0aGF0IHdhcyBjYXVzaW5nIHRoaXMgc2NyaXB0IHRvIGxvY2sgdXAsIGZvciBzb21lIHJlYXNvbi5cbiAgY29uc3QgaHRtbEJvZHkgPSBhdG9tLmNsaXBib2FyZC5yZWFkKCk7XG5cbiAgLy8gQXR0ZW1wdCB0byB0cnkgdG8gbG9hZCB0aGVtZXMgc28gdGhhdCBnZXRNYXJrZG93blByZXZpZXdDU1MoKSBsb2FkcyB0aGUgcmlnaHQgQ1NTLlxuICBhd2FpdCBhdG9tLnRoZW1lcy5hY3RpdmF0ZVRoZW1lcygpO1xuXG4gIC8vIFdlIGNyZWF0ZSBhIE1hcmtkb3duUHJldmlld1ZpZXcgdG8gY2FsbCBpdHMgZ2V0TWFya2Rvd25QcmV2aWV3Q1NTKCkgbWV0aG9kLlxuICAvLyAkRmxvd0lzc3VlOiBOZWVkIHRvIGR5bmFtaWNhbGx5IGxvYWQgYSBwYXRoLlxuICBjb25zdCBNYXJrZG93blByZXZpZXdWaWV3ID0gcmVxdWlyZShcbiAgICBwYXRoLmpvaW4obWFya2Rvd25QcmV2aWV3UGFja2FnZS5wYXRoLCAnbGliL21hcmtkb3duLXByZXZpZXctdmlldy5qcycpLFxuICApO1xuICBjb25zdCB2aWV3ID0gbmV3IE1hcmtkb3duUHJldmlld1ZpZXcoe1xuICAgIGVkaXRvcklkOiB0ZXh0RWRpdG9yLmlkLFxuICAgIGZpbGVQYXRoOiBtYXJrZG93bkZpbGUsXG4gIH0pO1xuICBjb25zdCBzdHlsZXMgPSB2aWV3LmdldE1hcmtkb3duUHJldmlld0NTUygpO1xuXG4gIGNvbnN0IHRpdGxlID0gYCR7bWFya2Rvd25GaWxlfS5odG1sYDtcbiAgLy8gSXQgaXMgbm90IG9idmlvdXMgZnJvbSBtYXJrZG93bi1wcmV2aWV3L2xpYi9tYXJrZG93bi1wcmV2aWV3LXZpZXcuY29mZmVlI3NhdmVBc1xuICAvLyB0aGF0IHRoZSBkYXRhLXVzZS1naXRodWItc3R5bGUgYXR0cmlidXRlIGlzIGtleSB0byB0aGlzIHdvcmtpbmcuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL21hcmtkb3duLXByZXZpZXcvcHVsbC8zMzUgZHJldyBteSBhdHRlbnRpb24gdG8gaXQuXG4gIC8vXG4gIC8vIFRoYXQgc2FpZCwgYWx0aG91Z2ggdGhpcyBhdHRyaWJ1dGUgaW1wcm92ZXMgdGhpbmdzLCB0aGUgcmVzdWx0aW5nIHN0eWxlcyBzdGlsbCBkbyBub3QgbWF0Y2hcbiAgLy8gZXhhY3RseSB3aGF0IHlvdSBzZWUgaW4gQXRvbS4gSSB0aGluayB0aGlzIGlzIGR1ZSB0byB0aGUgdHJhbnNsYXRpb24gb2YgPGF0b20tdGV4dC1lZGl0b3I+XG4gIC8vIHRvIDxwcmU+IGVsZW1lbnRzLCB3aGljaCBzZWVtcyBhIGxpdHRsZSBvZmYuXG4gIGNvbnN0IGh0bWwgPSBgXG48IURPQ1RZUEUgaHRtbD5cbjxodG1sPlxuICA8aGVhZD5cbiAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICA8dGl0bGU+JHt0aXRsZX08L3RpdGxlPlxuICAgICAgPHN0eWxlPiR7c3R5bGVzfTwvc3R5bGU+XG4gIDwvaGVhZD5cbiAgPGJvZHkgY2xhc3M9XCJtYXJrZG93bi1wcmV2aWV3XCIgZGF0YS11c2UtZ2l0aHViLXN0eWxlPiR7aHRtbEJvZHl9PC9ib2R5PlxuPC9odG1sPlxuYDtcblxuICAvLyBDdXJyZW50bHksIHdlIGFyZSBzdGlsbCBoYXZpbmcgcHJvYmxlbXMgd2l0aCBjb25zb2xlLmxvZygpLFxuICAvLyBzbyB3ZSByZWx5IGV4Y2x1c2l2ZWx5IG9uIHRoZSAtLW91dCBmbGFnIHRvIGRlY2lkZSB3aGVyZSB0byB3cml0ZSBvdXRwdXQuXG4gIGZzLndyaXRlRmlsZVN5bmMob3V0cHV0RmlsZSwgaHRtbCk7XG4gIHJldHVybiAwO1xufVxuXG4vLyBUT0RPKG1ib2xpbik6IENvbnNpZGVyIHVzaW5nIGZzLXBsdXMgdG8gZW5zdXJlIHRoaXMgaGFuZGxlcyB+IGluIGZpbGVOYW1lIGNvcnJlY3RseS5cbmZ1bmN0aW9uIHJlc29sdmVQYXRoKGZpbGVOYW1lKTogc3RyaW5nIHtcbiAgaWYgKCFwYXRoLmlzQWJzb2x1dGUoZmlsZU5hbWUpKSB7XG4gICAgY29uc3QgcHdkID0gcHJvY2Vzcy5lbnZbJ1BXRCddO1xuICAgIGludmFyaWFudChwd2QpO1xuICAgIHJldHVybiBwYXRoLmpvaW4ocHdkLCBmaWxlTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZpbGVOYW1lO1xuICB9XG59XG4iXX0=