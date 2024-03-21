// META: title=validation tests for WebNN API hardSwish operation
// META: global=window,dedicatedworker
// META: script=../resources/utils_validation.js
// META: timeout=long

validateUnaryOperation('hardSwish', floatingPointTypes, /*isActivation=*/ true);
