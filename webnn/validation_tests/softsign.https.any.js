// META: title=validation tests for WebNN API softsign operation
// META: global=window,dedicatedworker
// META: script=../resources/utils_validation.js
// META: timeout=long

validateUnaryOperation('softsign', floatingPointTypes, /*isActivation=*/ true);
