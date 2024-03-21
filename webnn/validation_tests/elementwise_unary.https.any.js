// META: title=validation tests for WebNN API element-wise unary operations
// META: global=window,dedicatedworker
// META: script=../resources/utils_validation.js
// META: timeout=long

'use strict';

const operations = [
  {
    name: 'abs',
    supportedDataTypes: [...floatingPointTypes, ...signedIntegerTypes]
  },
  {name: 'ceil', supportedDataTypes: floatingPointTypes},
  {name: 'exp', supportedDataTypes: floatingPointTypes},
  {name: 'floor', supportedDataTypes: floatingPointTypes},
  {name: 'log', supportedDataTypes: floatingPointTypes},
  {
    name: 'neg',
    supportedDataTypes: [...floatingPointTypes, ...signedIntegerTypes]
  },
  {name: 'sin', supportedDataTypes: floatingPointTypes},
  {name: 'tan', supportedDataTypes: floatingPointTypes},
  {name: 'erf', supportedDataTypes: floatingPointTypes},
  {name: 'identity', supportedDataTypes: allWebNNOperandDataTypes},
  {name: 'logicalNot', supportedDataTypes: ['uint8']},
  {name: 'reciprocal', supportedDataTypes: floatingPointTypes},
  {name: 'sqrt', supportedDataTypes: floatingPointTypes}
];

operations.forEach(operation => {
  validateUnaryOperation(operation.name, operation.supportedDataTypes);
});
