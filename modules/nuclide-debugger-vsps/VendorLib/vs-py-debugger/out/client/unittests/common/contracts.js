"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANCELLATION_REASON = 'cancelled_user_request';
var TestStatus;
(function (TestStatus) {
    TestStatus[TestStatus["Unknown"] = 0] = "Unknown";
    TestStatus[TestStatus["Discovering"] = 1] = "Discovering";
    TestStatus[TestStatus["Idle"] = 2] = "Idle";
    TestStatus[TestStatus["Running"] = 3] = "Running";
    TestStatus[TestStatus["Fail"] = 4] = "Fail";
    TestStatus[TestStatus["Error"] = 5] = "Error";
    TestStatus[TestStatus["Skipped"] = 6] = "Skipped";
    TestStatus[TestStatus["Pass"] = 7] = "Pass";
})(TestStatus = exports.TestStatus || (exports.TestStatus = {}));
//# sourceMappingURL=contracts.js.map