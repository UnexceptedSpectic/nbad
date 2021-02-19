const subtract = require('../src/subtract');

test('properly subtracts one number from another', () => {
    expect(
        subtract(1, 2)
    ).toBe(-1)
});
