/**Test for many-to-many relationship between users and projects
 * 
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const { expect } = require("chai");
const User = require("../models/User");
const ProjectUser = require("../models/ProjectUser");
require("../models/index");

describe('Many-to-Many Relationship Tests', () => {

    // let User, Project, ProjectUser;
    // beforeAll( async () => {
    //     const store = require( '../../models/store' );
    //     User = require( '../../models/User' );
    //     Project = require( '../../models/Project' );
    //     ProjectUser = require( '../../models/ProjectUser' );
    //     await store.connect( knex );
    // } );

    // afterAll( async () => {
    //     const store = require( '../../models/store' );
    //     await store.disconnect();
    // } );

    it( 'if metadata is correct', async () => {
        expect( ProjectUser.Project ); //.toBe( 'ProjectUser' );
        expect( ProjectUser.User ); //.toBe( 'project_user' );
    } );

    it( 'Fetch Users for a Project', async () => {
        
        const userQuery = User.select().withRelated( User.projects );
        expect( userQuery instanceof Object ).to.be.true;


        const users = await userQuery.exec();

        expect( users.length ).to.eql( 3 );
        const userNames = users.map( u => u.name ).sort();
        expect( userNames ).to.eql( [ 'Aaron Arancioni', 'Bill Bianchi', 'Chen Ciani' ] );

        expect( users[0].projects instanceof Array ).to.be.true;
        expect( users[0].projects.length ).to.be.greaterThan( 0 );
    });
});