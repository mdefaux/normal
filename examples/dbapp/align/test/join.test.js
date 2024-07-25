/** Test for case study of join between an 
 * external source and internal destination
  * The source is a json data
  * 
  * 
  * @usage
  *  VSCode run and debug: Debug Mocha Test
  * 
  * or
  * 
  *  cd examples/dbapp
  *  mocha align/test/align.test.js  
  *  
  * With coverage:
  *  npx nyc --reporter=text mocha align/test/join.test.js 
  */
const {assert,expect} = require("chai");
require("../../test/_test-setup");

const { CompareHelper } = require("../../../../src/orm/CompareHelper");

const SiteExt = require("../data/SiteExt");
const Customer = require('../../models/Customer');

describe("Join test", function () {

    it("join with local Customer", async function () {

        let query =  SiteExt.select()
            .join(Customer, SiteExt.customer_id.equals(Customer.name));

        expect(query.joins).to.be.a('array');
        expect(query.joins[0].right).to.be.equal(Customer);
        expect(query.joins[0].condition.field.name).to.be.equal("customer_id");
        assert(query.joins[0].condition.value.field.name);
        expect(query.joins[0].condition.value.sourceEntity.metaData.name).to.be.equal('Customer');

        // execute query
        let out = await query.exec();
        assert(out);
        expect(out).to.be.a('array');
        expect(out.length).to.be.equal(7);

        // there are no records without a match
        expect(out.some( (r)=> ! r.customer_id )).to.be.equal(false);
        
        // record with a match with customer 2
        expect(out[0]).to.be.a('object');
        expect(out[0].customer_id).to.be.a('object');
        expect(out[0].customer_id.id).to.be.equal(2);
        expect(out[0].customer_id.name).to.be.equal("Plajo");

    });

    it("left outer join with local Customer", async function () {

        let query =  SiteExt.select()
            .leftJoin(Customer, SiteExt.customer_id.equals(Customer.name));

        expect(query.joins).to.be.a('array');
        expect(query.joins[0].right).to.be.equal(Customer);
        expect(query.joins[0].condition.field.name).to.be.equal("customer_id");
        assert(query.joins[0].condition.value.field.name);
        expect(query.joins[0].condition.value.sourceEntity.metaData.name).to.be.equal('Customer');

        // execute query
        let out = await query.exec();
        assert(out);
        expect(out).to.be.a('array');

        // checks record without a match with customer
        expect(out[0]).to.be.a('object');
        expect(out[0]).to.be.a('object');
        // expect(out[0].customer_id).to.be.equal("Glizzard");
        // expect(out[0].Customer).to.be.equal(undefined);
        expect(out[0].customer_id).to.be.equal(undefined);
        expect(out[0].address).to.be.equal("via Tristram 66, Calvatone Italy");
        // record with a match with customer 2
        expect(out[1]).to.be.a('object');
        expect(out[1].customer_id).to.be.a('object');
        expect(out[1].customer_id.id).to.be.equal(2);
        expect(out[1].customer_id.name).to.be.equal("Plajo");

    });

});
