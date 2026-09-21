const assert = require('assert');
const Customer = require('../skel/Customer');
const customerData = require('../skel/Customer.data.json');

describe('Customer CRUD operations', function () {
    beforeEach(function () {
        Customer.storage.setData(customerData.map(record => ({ ...record })));
    });

    it('selects a customer', async function () {
        const customer = await Customer.select('*')
            .where(Customer.id.equals(1))
            .first();

        assert.strictEqual(customer.id, 1);
        assert.strictEqual(customer.name, 'Wordpedia');
    });

    it('inserts a customer', async function () {
        const inserted = await Customer.insert({
            name: 'Test Customer',
            address: '1 Test Street',
            reference: 'Test Contact',
            telephone: 123456
        });

        assert.strictEqual(inserted.name, 'Test Customer');
        assert.strictEqual(
            inserted.id,
            Math.max(...customerData.map(customer => customer.id)) + 1
        );
    });

    it('updates a customer', async function () {
        const updated = await Customer.update(1, { address: '99 Updated Avenue' });

        assert.strictEqual(updated.id, 1);
        assert.strictEqual(updated.address, '99 Updated Avenue');
    });

    it('deletes a customer', async function () {
        await Customer.delete(1);

        const deleted = await Customer.select('*')
            .where(Customer.id.equals(1))
            .first();

        assert.strictEqual(deleted, undefined);
    });
});