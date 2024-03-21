// META: title=validation tests for WebNN API sigmoid operation
// META: global=window,dedicatedworker
// META: script=../resources/utils_validation.js
// META: timeout=long

validateUnaryOperation('sigmoid', floatingPointTypes, /*isActivation=*/ true);
