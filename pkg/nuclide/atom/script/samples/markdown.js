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
//# sourceMappingURL=data:application/json;base64,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TyxrQkFBSyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQ2pDLE1BQU07QUFDTCxXQUFPLFFBQVEsQ0FBQztHQUNqQjtDQUNGIiwiZmlsZSI6Im1hcmtkb3duLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0V4aXRDb2RlfSBmcm9tICcuLi9saWIvdGVzdC1ydW5uZXInO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHJ1bkNvbW1hbmQoYXJnczogQXJyYXk8c3RyaW5nPik6IFByb21pc2U8RXhpdENvZGU+IHtcbiAgY29uc3QgYXJndiA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICByZXNvbHZlKHlhcmdzXG4gICAgICAudXNhZ2UoYFVzYWdlOiBhdG9tLXNjcmlwdCAke19fZGlybmFtZX0vbWFya2Rvd24uanMgLW8gPG91dHB1dCBmaWxlPiA8aW5wdXQgZmlsZT5gKVxuICAgICAgLmhlbHAoJ2gnKVxuICAgICAgLmFsaWFzKCdoJywgJ2hlbHAnKVxuICAgICAgLm9wdGlvbignb3V0Jywge1xuICAgICAgICBhbGlhczogJ28nLFxuICAgICAgICBkZW1hbmQ6IGZhbHNlLFxuICAgICAgICBkZXNjcmliZTogJ011c3Qgc3BlY2lmeSBhIHBhdGggdG8gYW4gb3V0cHV0IGZpbGUuJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB9KVxuICAgICAgLmRlbWFuZCgxLCAnTXVzdCBzcGVjaWZ5IGEgcGF0aCB0byBhIE1hcmtkb3duIGZpbGUuJylcbiAgICAgIC5leGl0UHJvY2VzcyhmYWxzZSlcbiAgICAgIC5mYWlsKHJlamVjdCkgLy8gVGhpcyB3aWxsIGJ1YmJsZSB1cCBhbmQgY2F1c2UgcnVuQ29tbWFuZCgpIHRvIHJlamVjdC5cbiAgICAgIC5wYXJzZShhcmdzKSk7XG4gIH0pO1xuXG4gIC8vIFdoZW4gdGhpcyBoYXBwZW5zLCB0aGUgaGVscCB0ZXh0IGhhcyBhbHJlYWR5IGJlZW4gcHJpbnRlZCB0byBzdGRvdXQuXG4gIGlmIChhcmd2LmhlbHApIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IG1hcmtkb3duRmlsZSA9IHJlc29sdmVQYXRoKGFyZ3YuX1swXSk7XG4gIGNvbnN0IG91dHB1dEZpbGUgPSBhcmd2Lm91dCA9PSBudWxsID8gYCR7bWFya2Rvd25GaWxlfS5odG1sYCA6IHJlc29sdmVQYXRoKGFyZ3Yub3V0KTtcblxuICBjb25zdCB0ZXh0RWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihtYXJrZG93bkZpbGUpO1xuICBhd2FpdCBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldycpO1xuXG4gIC8vIFVzZSBtYXJrZG93bi1wcmV2aWV3IHRvIGdlbmVyYXRlIHRoZSBIVE1MLlxuICBjb25zdCBtYXJrZG93blByZXZpZXdQYWNrYWdlID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3Jyk7XG4gIGludmFyaWFudChtYXJrZG93blByZXZpZXdQYWNrYWdlKTtcbiAgLy8gQXBwYXJlbnRseSBjb3B5SHRtbCgpIGlzIGV4cG9zZWQgYXMgYW4gZXhwb3J0IG9mIG1hcmtkb3duLXByZXZpZXcuXG4gIG1hcmtkb3duUHJldmlld1BhY2thZ2UubWFpbk1vZHVsZS5jb3B5SHRtbCgpO1xuICAvLyBOb3RlIGl0IHNob3VsZCBiZSBwb3NzaWJsZSB0byBnZXQgdGhlIEhUTUwgdmlhIE1hcmtkb3duUHJldmlld1ZpZXcuZ2V0SFRNTCgpLFxuICAvLyBidXQgdGhhdCB3YXMgY2F1c2luZyB0aGlzIHNjcmlwdCB0byBsb2NrIHVwLCBmb3Igc29tZSByZWFzb24uXG4gIGNvbnN0IGh0bWxCb2R5ID0gYXRvbS5jbGlwYm9hcmQucmVhZCgpO1xuXG4gIC8vIEF0dGVtcHQgdG8gdHJ5IHRvIGxvYWQgdGhlbWVzIHNvIHRoYXQgZ2V0TWFya2Rvd25QcmV2aWV3Q1NTKCkgbG9hZHMgdGhlIHJpZ2h0IENTUy5cbiAgYXdhaXQgYXRvbS50aGVtZXMuYWN0aXZhdGVUaGVtZXMoKTtcblxuICAvLyBXZSBjcmVhdGUgYSBNYXJrZG93blByZXZpZXdWaWV3IHRvIGNhbGwgaXRzIGdldE1hcmtkb3duUHJldmlld0NTUygpIG1ldGhvZC5cbiAgLy8gJEZsb3dJc3N1ZTogTmVlZCB0byBkeW5hbWljYWxseSBsb2FkIGEgcGF0aC5cbiAgY29uc3QgTWFya2Rvd25QcmV2aWV3VmlldyA9IHJlcXVpcmUoXG4gICAgcGF0aC5qb2luKG1hcmtkb3duUHJldmlld1BhY2thZ2UucGF0aCwgJ2xpYi9tYXJrZG93bi1wcmV2aWV3LXZpZXcuanMnKSxcbiAgKTtcbiAgY29uc3QgdmlldyA9IG5ldyBNYXJrZG93blByZXZpZXdWaWV3KHtcbiAgICBlZGl0b3JJZDogdGV4dEVkaXRvci5pZCxcbiAgICBmaWxlUGF0aDogbWFya2Rvd25GaWxlLFxuICB9KTtcbiAgY29uc3Qgc3R5bGVzID0gdmlldy5nZXRNYXJrZG93blByZXZpZXdDU1MoKTtcblxuICBjb25zdCB0aXRsZSA9IGAke21hcmtkb3duRmlsZX0uaHRtbGA7XG4gIC8vIEl0IGlzIG5vdCBvYnZpb3VzIGZyb20gbWFya2Rvd24tcHJldmlldy9saWIvbWFya2Rvd24tcHJldmlldy12aWV3LmNvZmZlZSNzYXZlQXNcbiAgLy8gdGhhdCB0aGUgZGF0YS11c2UtZ2l0aHViLXN0eWxlIGF0dHJpYnV0ZSBpcyBrZXkgdG8gdGhpcyB3b3JraW5nLlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9tYXJrZG93bi1wcmV2aWV3L3B1bGwvMzM1IGRyZXcgbXkgYXR0ZW50aW9uIHRvIGl0LlxuICAvL1xuICAvLyBUaGF0IHNhaWQsIGFsdGhvdWdoIHRoaXMgYXR0cmlidXRlIGltcHJvdmVzIHRoaW5ncywgdGhlIHJlc3VsdGluZyBzdHlsZXMgc3RpbGwgZG8gbm90IG1hdGNoXG4gIC8vIGV4YWN0bHkgd2hhdCB5b3Ugc2VlIGluIEF0b20uIEkgdGhpbmsgdGhpcyBpcyBkdWUgdG8gdGhlIHRyYW5zbGF0aW9uIG9mIDxhdG9tLXRleHQtZWRpdG9yPlxuICAvLyB0byA8cHJlPiBlbGVtZW50cywgd2hpY2ggc2VlbXMgYSBsaXR0bGUgb2ZmLlxuICBjb25zdCBodG1sID0gYFxuPCFET0NUWVBFIGh0bWw+XG48aHRtbD5cbiAgPGhlYWQ+XG4gICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIiAvPlxuICAgICAgPHRpdGxlPiR7dGl0bGV9PC90aXRsZT5cbiAgICAgIDxzdHlsZT4ke3N0eWxlc308L3N0eWxlPlxuICA8L2hlYWQ+XG4gIDxib2R5IGNsYXNzPVwibWFya2Rvd24tcHJldmlld1wiIGRhdGEtdXNlLWdpdGh1Yi1zdHlsZT4ke2h0bWxCb2R5fTwvYm9keT5cbjwvaHRtbD5cbmA7XG5cbiAgLy8gQ3VycmVudGx5LCB3ZSBhcmUgc3RpbGwgaGF2aW5nIHByb2JsZW1zIHdpdGggY29uc29sZS5sb2coKSxcbiAgLy8gc28gd2UgcmVseSBleGNsdXNpdmVseSBvbiB0aGUgLS1vdXQgZmxhZyB0byBkZWNpZGUgd2hlcmUgdG8gd3JpdGUgb3V0cHV0LlxuICBmcy53cml0ZUZpbGVTeW5jKG91dHB1dEZpbGUsIGh0bWwpO1xuICByZXR1cm4gMDtcbn1cblxuLy8gVE9ETyhtYm9saW4pOiBDb25zaWRlciB1c2luZyBmcy1wbHVzIHRvIGVuc3VyZSB0aGlzIGhhbmRsZXMgfiBpbiBmaWxlTmFtZSBjb3JyZWN0bHkuXG5mdW5jdGlvbiByZXNvbHZlUGF0aChmaWxlTmFtZSk6IHN0cmluZyB7XG4gIGlmICghcGF0aC5pc0Fic29sdXRlKGZpbGVOYW1lKSkge1xuICAgIGNvbnN0IHB3ZCA9IHByb2Nlc3MuZW52WydQV0QnXTtcbiAgICBpbnZhcmlhbnQocHdkKTtcbiAgICByZXR1cm4gcGF0aC5qb2luKHB3ZCwgZmlsZU5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmaWxlTmFtZTtcbiAgfVxufVxuIl19