// Test for status code 200
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

// Test for a valid JSON response
pm.test('Response is valid JSON', function () {
    pm.response.to.be.json;
});

// Test for the presence of the 'fact' property
pm.test('Response contains \'fact\' property', function () {
    pm.expect(pm.response.json()).to.have.property('fact');
});

// Test for the presence of the 'length' property
pm.test('Response contains \'length\' property', function () {
    pm.expect(pm.response.json()).to.have.property('length');
});

// Test the length property's value
pm.test('Length property matches fact length', function () {
    const response = pm.response.json();
    pm.expect(response.length).to.equal(response.fact.length);
});
