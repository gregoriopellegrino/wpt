// META: title=validation tests for WebNN API resample2d operation
// META: global=window,dedicatedworker
// META: script=../resources/utils_validation.js

'use strict';

// Tests for resample2d(input, options)
const tests = [
  {
    name: '[resample2d] Test building resample2d with default options',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    output: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
  },
  {
    name: '[resample2d] Test building resample2d with scales=[2.0, 2.0]',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {scales: [2.0, 2.0]},
    output: {dataType: 'float32', dimensions: [1, 1, 4, 8]},
  },
  {
    name: '[resample2d] Test building resample2d with scales=[0.5, 0.5]',
    input: {dataType: 'float32', dimensions: [1, 1, 5, 5]},
    options: {scales: [0.5, 0.5]},
    output: {dataType: 'float32', dimensions: [1, 1, 2, 2]},
  },
  {
    name:
        '[resample2d] Test building resample2d with sizes=[3, 6] ignored scales',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {scales: [2.0, 2.0], sizes: [3, 6]},
    output: {dataType: 'float32', dimensions: [1, 1, 3, 6]},
  },
  {
    name:
        '[resample2d] Test building resample2d with scales=[1.0, 2.0] and axes=[0, 1]',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {scales: [1.0, 2.0], axes: [0, 1]},
    output: {dataType: 'float32', dimensions: [1, 2, 2, 4]},
  },
  {
    name:
        '[resample2d] Test building resample2d with scales=[2.0, 2.0] and axes=[1, 2]',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {scales: [2.0, 2.0], axes: [1, 2]},
    output: {dataType: 'float32', dimensions: [1, 2, 4, 4]},
  },
  {
    name: '[resample2d] Throw if the rank of input is not 4',
    input: {dataType: 'float32', dimensions: [2, 4]},
  },
  {
    name: '[resample2d] Throw if the length of scales is not 2',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {scales: [1.0, 1.0, 2.0, 2.0]},
  },
  {
    name: '[resample2d] Throw if any scale value is not greater than 0',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {scales: [1.0, -2.0]},
  },
  {
    name: '[resample2d] Throw if the length of sizes is not 2',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {sizes: [1, 1, 4, 6]},
  },
  {
    name: '[resample2d] Throw if the size value is grater than 2**32 - 1',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {sizes: [2 ** 32, 2 ** 32]},
  },
  {
    name:
        '[resample2d] Throw if the product of scaleHeight and spatial dimension\'s size is too large',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    // scales: [scaleHeight, scaleWidth]
    // The maximum dimension size is 2 ** 32 - 1, now (2 ** 32 - 1) * 2 > 2 **
    // 32 - 1.
    options: {scales: [2 ** 32 - 1, 1]},
  },
  {
    name:
        '[resample2d] Throw if the product of scaleHeight and spatial dimension\'s size is too small',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    // scales: [scaleHeight, scaleWidth], 0.02 * 2 < 1
    options: {scales: [0.02, 0.8]},
  },
  {
    name:
        '[resample2d] Throw if the the product of scaleWidth and spatial dimension\'s size is too large',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 2]},
    // scales: [scaleHeight, scaleWidth]
    // The maximum dimension size is 2 ** 32 - 1, now (2 ** 32 - 1) * 2 > 2 **
    // 32 - 1.
    options: {scales: [1, 2 ** 32 - 1]},
  },
  {
    name: '[resample2d] Throw if the scaleWidth is too small',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    // scales: [scaleHeight, scaleWidth], 0.1 * 4 < 1
    options: {scales: [0.7, 0.1]},
  },
  {
    name: '[resample2d] Throw if the length of axes is not 2',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {axes: [0, 1, 2]},
  },
  {
    name:
        '[resample2d] Throw if any axis value is grater than or equal to the input rank',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {axes: [3, 4]},
  },
  {
    // The valid values in the axes sequence are [0, 1], [1, 2] or [2, 3]
    name: '[resample2d] Throw if the values of axes are inconsecutive',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {axes: [0, 2]},
  },
  {
    name: '[resample2d] Throw if the values of axes are same',
    input: {dataType: 'float32', dimensions: [1, 1, 2, 4]},
    options: {axes: [0, 0]},
  },
];

tests.forEach(
    test => promise_test(async t => {
      const input = builder.input(
          'input',
          {dataType: test.input.dataType, dimensions: test.input.dimensions});
      const options = test.options ?? {};
      if (test.output) {
        const output = builder.resample2d(input, options);
        assert_equals(output.dataType(), test.output.dataType);
        assert_array_equals(output.shape(), test.output.dimensions);
      } else {
        assert_throws_js(TypeError, () => builder.resample2d(input, options));
      }
    }, test.name));
