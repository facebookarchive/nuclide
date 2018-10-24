/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

const gulp = require('gulp');
const path = require('path');
const ts = require('gulp-typescript');
const log = require('gulp-util').log;
const typescript = require('typescript');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');
const runSequence = require('run-sequence');
const nls = require('vscode-nls-dev');
const cp = require('child_process');
const del = require('del');
const fs = require('fs');
const vsce = require('vsce');
const es = require('event-stream');
const minimist = require('minimist');

const transifexApiHostname = 'www.transifex.com'
const transifexApiName = 'api';
const transifexApiToken = process.env.TRANSIFEX_API_TOKEN;
const transifexProjectName = 'vscode-extensions';
const transifexExtensionName = 'vscode-node-debug2';

const defaultLanguages = [
	{ id: 'zh-tw', folderName: 'cht', transifexId: 'zh-hant' },
	{ id: 'zh-cn', folderName: 'chs', transifexId: 'zh-hans' },
	{ id: 'ja', folderName: 'jpn' },
	{ id: 'ko', folderName: 'kor' },
	{ id: 'de', folderName: 'deu' },
	{ id: 'fr', folderName: 'fra' },
	{ id: 'es', folderName: 'esn' },
	{ id: 'ru', folderName: 'rus' },
    { id: 'it', folderName: 'ita' },

    // These language-pack languages are included for VS but excluded from the vscode package
    { id: 'cs', folderName: 'csy' },
    { id: 'tr', folderName: 'trk' },
    { id: 'pt-br', folderName: 'ptb', transifexId: 'pt_BR' },
    { id: 'pl', folderName: 'plk' }
];

const watchedSources = [
	'src/**/*',
    'test/**/*'
];

const scripts = [
    'src/terminateProcess.sh'
];

const lintSources = [
    'src'
].map(function(tsFolder) { return tsFolder + '/**/*.ts'; });

const tsProject = ts.createProject('tsconfig.json', { typescript });
function doBuild(buildNls, failOnError) {
    let gotError = false;
    const tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .once('error', () => {
            gotError = true;
        });

    return tsResult.js
        .pipe(buildNls ? nls.rewriteLocalizeCalls() : es.through())
        .pipe(buildNls ? nls.createAdditionalLanguageFiles(defaultLanguages, 'i18n', 'out') : es.through())
		.pipe(buildNls ? nls.bundleMetaDataFiles('ms-vscode.node-debug2', 'out') : es.through())
		.pipe(buildNls ? nls.bundleLanguageFiles() : es.through())
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '..' })) // .. to compensate for TS returning paths from 'out'
        .pipe(gulp.dest('out'))
        .once('error', () => {
            gotError = true;
        })
        .once('finish', () => {
            if (failOnError && gotError) {
                process.exit(1);
            }
        });
}

gulp.task('build', () => {
    return runSequence('clean', '_build');
});

gulp.task('_build', ['copy-scripts'], () => {
    return doBuild(true, true);
});

gulp.task('_dev-build', ['copy-scripts'], () => {
    return doBuild(false, false);
});

gulp.task('copy-scripts', () => {
    return gulp.src(scripts, { base: '.' })
        .pipe(gulp.dest('out'));
});

gulp.task('watch', ['clean'], cb => {
    log('Watching build sources...');
    return runSequence('_dev-build', () => gulp.watch(watchedSources, ['_dev-build']));
});

gulp.task('default', ['build']);

gulp.task('tslint', function() {
      return gulp.src(lintSources, { base: '.' })
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

gulp.task('clean', function() {
	return del(['out/**', 'package.nls.*.json', 'vscode-node-debug2-*.vsix']);
});

function verifyNotALinkedModule(modulePath) {
    return new Promise((resolve, reject) => {
        fs.lstat(modulePath, (err, stat) => {
            if (stat.isSymbolicLink()) {
                reject(new Error('Symbolic link found: ' + modulePath));
            } else {
                resolve();
            }
        });
    });
}

function verifyNoLinkedModules() {
    return new Promise((resolve, reject) => {
        fs.readdir('./node_modules', (err, files) => {
            Promise.all(files.map(file => {
                const modulePath = path.join('.', 'node_modules', file);
                return verifyNotALinkedModule(modulePath);
            })).then(resolve, reject);
        });
    });
}

gulp.task('verify-no-linked-modules', cb => verifyNoLinkedModules().then(() => cb, cb));

gulp.task('vsce-publish', function () {
    return vsce.publish();
});
gulp.task('vsce-package', function () {
    const cliOptions = minimist(process.argv.slice(2));
    const packageOptions = {
        packagePath: cliOptions.packagePath
    };

    return vsce.createVSIX(packageOptions);
});

gulp.task('publish', function(callback) {
	runSequence('build', 'add-i18n', 'vsce-publish', callback);
});

gulp.task('package', function(callback) {
	runSequence('build', 'add-i18n', 'vsce-package', callback);
});

gulp.task('add-i18n', function () {
	return gulp.src(['package.nls.json'])
		.pipe(nls.createAdditionalLanguageFiles(defaultLanguages, 'i18n'))
		.pipe(gulp.dest('.'));
});

gulp.task('transifex-push', ['build'], function () {
	return gulp.src(['package.nls.json', 'out/nls.metadata.header.json','out/nls.metadata.json'])
		.pipe(nls.createXlfFiles(transifexProjectName, transifexExtensionName))
		.pipe(nls.pushXlfFiles(transifexApiHostname, transifexApiName, transifexApiToken));
});

gulp.task('transifex-push-test', ['build'], function() {
	return gulp.src(['package.nls.json', 'out/nls.metadata.header.json','out/nls.metadata.json'])
		.pipe(nls.createXlfFiles(transifexProjectName, transifexExtensionName))
		.pipe(gulp.dest(path.join('..', `${transifexExtensionName}-push-test`)));
});

gulp.task('transifex-pull', function () {
	return es.merge(defaultLanguages.map(function(language) {
		return nls.pullXlfFiles(transifexApiHostname, transifexApiName, transifexApiToken, language, [{ name: transifexExtensionName, project: transifexProjectName }]).
			pipe(gulp.dest(`../${transifexExtensionName}-localization/${language.folderName}`));
	}));
});

gulp.task('i18n-import', function() {
	return es.merge(defaultLanguages.map(function(language) {
		return gulp.src(`../${transifexExtensionName}-localization/${language.folderName}/**/*.xlf`)
			.pipe(nls.prepareJsonFiles())
			.pipe(gulp.dest(path.join('./i18n', language.folderName)));
	}));
});
