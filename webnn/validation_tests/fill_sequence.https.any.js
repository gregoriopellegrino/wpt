// META: title=validation tests for WebNN API gru operation
// META: global=window,dedicatedworker
// META: script=../resources/utils_validation.js
// META: timeout=long

'use strict';

const tests = [
    {
        name: '[constant] Test building a constant MLOperand of the float32 data type',
        desc: { dataType: 'float32', dimensions: [3] },
        start: 0.1,
        step: 0.1,
        output: { dataType: 'float32', dimensions: [3] }
    },
    {
        name: '[constant] Test building a constant MLOperand of the float16 data type',
        desc: { dataType: 'float16', dimensions: [3] },
        start: 0.1,
        step: -0.2,
        output: { dataType: 'float16', dimensions: [3] }
    },
    {
        name: '[constant] Test building a constant MLOperand of the int8 data type',
        desc: { dataType: 'int8', dimensions: [3] },
        start: 3,
        step: -2,
        output: { dataType: 'int8', dimensions: [3] }
    },
    {
        name: '[constant] Test building a constant MLOperand with output_shape = {}',
        desc: { dataType: 'float32', dimensions: [] },
        start: 0.1,
        step: 0.2,
        output: { dataType: 'float32', dimensions: [] }
    },
    {
        name: '[constant] TypeError is expected if the values of start or step are not within the range of int8',
        desc: { dataType: 'int8', dimensions: [5] },
        start: 200,
        step: 2
    },
    {
        name: '[constant] TypeError is expected if the values of start or step are not within the range of float16',
        desc: { dataType: 'float16', dimensions: [5] },
        start: 65535,
        step: 2.2
    },
    {
        name: '[constant] TypeError is expected if the endpoint value is not within the range of int8',
        desc: { dataType: 'int8', dimensions: [5] },
        start: 126,
        step: 2
    },
    {
        name: '[constant] TypeError is expected if the endpoint value is not within the range of float16',
        desc: { dataType: 'float16', dimensions: [5] },
        start: 65533,
        step: 2.8
    }
]

tests.forEach(
    test => promise_test(async t => {
        if (test.output) {
            const output = builder.constant(
                test.desc, test.start, test.step);
            assert_equals(output.dataType(), test.output.dataType);
            assert_array_equals(output.shape(), test.output.dimensions);
        } else {
            assert_throws_js(
                TypeError, () => builder.constant(
                    test.desc, test.start, test.step));
        }
    }, test.name));