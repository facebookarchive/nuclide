// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-any max-func-body-length
const chai_1 = require("chai");
const typemoq = require("typemoq");
const languageServerSurveyBanner_1 = require("../../../client/languageServices/languageServerSurveyBanner");
suite('Language Server Survey Banner', () => {
    let config;
    let appShell;
    let browser;
    const message = 'Can you please take 2 minutes to tell us how the Experimental Debugger is working for you?';
    const yes = 'Yes, take survey now';
    const no = 'No, thanks';
    setup(() => {
        config = typemoq.Mock.ofType();
        appShell = typemoq.Mock.ofType();
        browser = typemoq.Mock.ofType();
    });
    test('Is debugger enabled upon creation?', () => {
        const enabledValue = true;
        const attemptCounter = 0;
        const completionsCount = 0;
        const testBanner = preparePopup(attemptCounter, completionsCount, enabledValue, 0, 100, appShell.object, browser.object);
        chai_1.expect(testBanner.enabled).to.be.equal(true, 'Sampling 100/100 should always enable the banner.');
    });
    test('Do not show banner when it is disabled', () => {
        appShell.setup(a => a.showInformationMessage(typemoq.It.isValue(message), typemoq.It.isValue(yes), typemoq.It.isValue(no)))
            .verifiable(typemoq.Times.never());
        const enabledValue = true;
        const attemptCounter = 0;
        const completionsCount = 0;
        const testBanner = preparePopup(attemptCounter, completionsCount, enabledValue, 0, 0, appShell.object, browser.object);
        testBanner.showBanner().ignoreErrors();
    });
    test('shouldShowBanner must return false when Banner is implicitly disabled by sampling', () => {
        const enabledValue = true;
        const attemptCounter = 0;
        const completionsCount = 0;
        const testBanner = preparePopup(attemptCounter, completionsCount, enabledValue, 0, 0, appShell.object, browser.object);
        chai_1.expect(testBanner.enabled).to.be.equal(false, 'We implicitly disabled the banner, it should never show.');
    });
});
function preparePopup(attemptCounter, completionsCount, enabledValue, minCompletionCount, maxCompletionCount, appShell, browser) {
    const myfactory = typemoq.Mock.ofType();
    const enabledValState = typemoq.Mock.ofType();
    const attemptCountState = typemoq.Mock.ofType();
    const completionCountState = typemoq.Mock.ofType();
    enabledValState.setup(a => a.updateValue(typemoq.It.isValue(true))).returns(() => {
        enabledValue = true;
        return Promise.resolve();
    });
    enabledValState.setup(a => a.updateValue(typemoq.It.isValue(false))).returns(() => {
        enabledValue = false;
        return Promise.resolve();
    });
    attemptCountState.setup(a => a.updateValue(typemoq.It.isAnyNumber())).returns(() => {
        attemptCounter += 1;
        return Promise.resolve();
    });
    completionCountState.setup(a => a.updateValue(typemoq.It.isAnyNumber())).returns(() => {
        completionsCount += 1;
        return Promise.resolve();
    });
    enabledValState.setup(a => a.value).returns(() => enabledValue);
    attemptCountState.setup(a => a.value).returns(() => attemptCounter);
    completionCountState.setup(a => a.value).returns(() => completionsCount);
    myfactory.setup(a => a.createGlobalPersistentState(typemoq.It.isValue(languageServerSurveyBanner_1.LSSurveyStateKeys.ShowBanner), typemoq.It.isValue(true))).returns(() => {
        return enabledValState.object;
    });
    myfactory.setup(a => a.createGlobalPersistentState(typemoq.It.isValue(languageServerSurveyBanner_1.LSSurveyStateKeys.ShowBanner), typemoq.It.isValue(false))).returns(() => {
        return enabledValState.object;
    });
    myfactory.setup(a => a.createGlobalPersistentState(typemoq.It.isValue(languageServerSurveyBanner_1.LSSurveyStateKeys.ShowAttemptCounter), typemoq.It.isAnyNumber())).returns(() => {
        return attemptCountState.object;
    });
    myfactory.setup(a => a.createGlobalPersistentState(typemoq.It.isValue(languageServerSurveyBanner_1.LSSurveyStateKeys.ShowAfterCompletionCount), typemoq.It.isAnyNumber())).returns(() => {
        return completionCountState.object;
    });
    return new languageServerSurveyBanner_1.LanguageServerSurveyBanner(appShell, myfactory.object, browser, minCompletionCount, maxCompletionCount);
}
//# sourceMappingURL=languageServerSurvey.unit.test.js.map