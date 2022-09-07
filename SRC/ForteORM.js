// var defs = require("./defIndex");
// var knex = require('../db/knex');
// var utils = require("../routes/common/index");
const { EntityBE } = require("./orm/EntityBE");
const { FieldConditionDef } = require("./orm/FieldConditionDef");
// const { KdbStoreHost } = require("./orm/kdbhost/KdbHost");
const { /*PrimaryKeyField, ObjectLink, RelatedObjects, PartsOf,*/ Model /*, StringField */ } = require("./orm/Model");
const fields = require( "./orm/Field" );

class FieldWrapper {
    constructor( field, tableAlias, query )
    {
        this.field = field;
        this.tableAlias = tableAlias;
        this.query = query;
    }

    in( arrayOrFunction )
    {
        if( Array.isArray( arrayOrFunction ) )
        {
            if( arrayOrFunction.length > 0 && typeof arrayOrFunction[0] === 'object' )
            {
                arrayOrFunction = arrayOrFunction.map( (o) => ( o[ this.field.name ] ) )
            }
        }

        return new FieldConditionDef( "in", this.field, arrayOrFunction );
    }
}

class FieldDef {

    constructor( targetField, model, factory )
    {
        this.factory = factory;
        this.model = model;
        this.targetField = targetField; // sets the target
    }


    label( labelValue ) {
        this.targetField.label = labelValue;
        return this;
    }

    source(sourceName) {
        this.targetField.sourceField = sourceName;
        return this;
    }

    sourceAlias(sourceName) {
        this.targetField.sourceAlias = sourceName;
        return this;
    }

    rename(name) {
        this.targetField.name = name;
        return this;
    }

    defaultColumnWidth( defaultColumnWidthValue ) {
        this.targetField.defaultColumnWidth = defaultColumnWidthValue;
        return this;
    }

    readonly( readonlyValue ) {
        this.targetField.readonly = readonlyValue;
        return this;
    }

    mandatory( value ) {
        this.targetField.mandatory = value;
        return this;
    }

    save( value ) {
        this.targetField.save = value;
        return this;
    }
}

class ModelDef {

    constructor ( entity, factory ) {
        this.factory = factory;
        this.entity = entity;
        this.model = entity.model;
        this.id( "id" );    // sets default id column
        // this.fields = {};
    }

    source( sourceName )
    {
        this.model.dbTableName = sourceName;
    }

    useClass( clazz )
    {

    }

    id( fieldName )
    {
        if( this.model.idField === fieldName )
            return;
        if( this.model.idField )
        {
            delete this.model.fields[ fieldName ];
        }
        else 
        {
            this.model.fields[ fieldName ] = new fields.PrimaryKeyField( fieldName );
        }
        this.model.idField = fieldName;
        return this.model.fields[ fieldName ];
    }

    label( fieldName )
    {
        this.model.labelField = fieldName;
    }

    string( fieldName )
    {
        this.model.fields[ fieldName ] = new fields.StringField( fieldName );

        return new FieldDef( this.model.fields[ fieldName ] );
    }

    date( fieldName )
    {
        this.model.fields[ fieldName ] = new fields.DateField( fieldName );

        return new FieldDef( this.model.fields[ fieldName ] );
    }

    number( fieldName )
    {
        this.model.fields[ fieldName ] = new fields.NumberField( fieldName );

        return new FieldDef( this.model.fields[ fieldName ] );
    }

    integer( fieldName )
    {
        this.model.fields[ fieldName ] = new fields.IntegerField( fieldName );

        return new FieldDef( this.model.fields[ fieldName ] );
    }

    boolean( fieldName )
    {
        this.model.fields[ fieldName ] = new fields.BooleanField( fieldName );

        return new FieldDef( this.model.fields[ fieldName ] );
    }

    objectLink( entity, fieldName )
    {
        let entityName;

        // paramenter entity could be a class
        if ( typeof entity === 'function' && entity.constructor )
        {
            // register the class to the store, and takes 
            // the resulting entity model
            entity = defs.entityClass( entity );
        }

        if ( typeof entity === 'object' )
        {
            // TODO: use exception instead
            // object must inherith from EntityBE
            if( entity instanceof EntityBE )
            {
                entityName = entity.name;

                if( !this.factory[entityName] )
                {
                    this.factory[entityName] = entity;
                }
            }
        }
        else if ( typeof entity === 'string' )
        {
            entityName = entity;
        }

        // if not specified, the name of the field 
        // matches the name of target entity
        fieldName = fieldName || entityName;

        this.model.fields[ fieldName ] = new fields.ObjectLink( entityName, this.factory, this.model );

        // returns the field definitor
        return new FieldDef( this.model.fields[ fieldName ] );
    }

    many( entityName )
    {
        return this.model.fields[ entityName ] = new fields.RelatedObjects( entityName, this.factory, this.model.fields );
        // TODO: return new RelationDef( this.model.fields[ entityName ] )
    }

    parts( entityName )
    {
        return this.model.fields[ entityName ] = new fields.PartsOf( entityName, this.factory, this.model.fields );
        // TODO: return new RelationDef( this.model.fields[ entityName ] )
    }

    storageData( storage ) {
        this.entity.storage = storage;
    }

}

class EntityProxy extends EntityBE
{

    constructor( name )
    {
        super( name );
        this.host = {};
    }

}

const DataStorage = require( './DataStorage' );

const defs = {
    entities: {},

    mainHost: undefined, // new KdbStoreHost( knex ),

    /**Setups main Store with a specific host
     * 
     * @param {*} storeHost 
     */
    host( storeHost ) {
        this.mainHost = storeHost;
    },

    setup( storeHost ) {
        this.host( storeHost );
        return this;
    },

    data( name, jsonData ) {
        this.data[ name ] = new DataStorage();
        this.data[ name ].setData( jsonData );

        let idField = 'id';
        if ( idField ) {
            this.data[ name ].addIndex( idField );
        }

        return this.data[ name ];
    },

    setupEntity (name) {
        this.entities[name].setup();
    
        Object.defineProperty(this, name, {
            get: function () { return entities[name]; }
        });

        return this.entities[ name ];
    },

    entityClass( clazz ) {
        if( !clazz )
        {
            throw new Error( `Class parameter is mandatory for method entityClass.` );
        }
        let name = clazz.name;
        if( this.entities[ name ] )
        {
            return;
            throw new Error( `Entity '${name}' already defined.` );
        }
        let model = new Model( name );
        this.entities[ name ] = new clazz( name, model, this.entities, this.mainHost );

        if( !this.entities[ name ] instanceof EntityBE )
        {
            throw new Error( `Specified class does not subclass Entity.` );
        }

        this.entities[ name ].definition( 
            new ModelDef( this.entities[ name ], this.entities ) );

        this.setupEntity(name);

        return this.entities[ name ];
    },

    entity( name, callback, clazz ) {
        console.log( `Setting up class ${name}.` );
        if( this.entities[ name ] ) {
            return;
            throw new Error( `Entity '${name}' already defined.` );
        }
        let model = new Model( name );
        this.entities[ name ] = clazz ? 
            new clazz( name, model, this.entities, this.mainHost ) :
            new EntityBE( name, model, this.entities, this.mainHost );

        if( !this.entities[ name ] instanceof EntityBE )
        {
            throw new Error( `Specified class does not subclass Entity.` );
        }

        callback( new ModelDef( this.entities[ name ], this.entities ) );

        this.setupEntity(name);

        return this.entities[ name ];
    }
}

module.exports = defs;

