// META: title=validation tests for WebNN API relu operation
// META: global=window,dedicatedworker
// META: script=../resources/utils_validation.js
// META: timeout=long

validateUnaryOperation('relu', allWebNNOperandDataTypes, /*isActivation=*/ true);
