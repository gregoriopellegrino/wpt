// META: title=validation tests for WebNN API tanh operation
// META: global=window,dedicatedworker
// META: script=../resources/utils_validation.js
// META: timeout=long

validateUnaryOperation('tanh', floatingPointTypes, /*isActivation=*/ true);
