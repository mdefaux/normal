// var defs = require("./defIndex");
var knex = require('../db/knex');
var utils = require("../routes/common/index");
const { EntityBE } = require("./orm/EntityBE");
const { FieldConditionDef } = require("./orm/FieldConditionDef");
const { KdbStoreHost } = require("./orm/kdbhost/KdbHost");
const { PrimaryKeyField, ObjectLink, RelatedObjects, PartsOf, Model, Field } = require("./orm/Model");

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

    constructor( model, factory )
    {
        this.factory = factory;
        this.model = model;
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
            this.model.fields[ fieldName ] = new PrimaryKeyField( fieldName );
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
        this.model.fields[ fieldName ] = new Field( fieldName );

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

        this.model.fields[ fieldName ] = new ObjectLink( entityName, this.factory, this.model.fields );

        // returns the field definitor
        return new FieldDef( this.model.fields[ fieldName ] );
    }

    many( entityName )
    {
        return this.model.fields[ entityName ] = new RelatedObjects( entityName, this.factory, this.model.fields );
        // TODO: return new RelationDef( this.model.fields[ entityName ] )
    }

    parts( entityName )
    {
        return this.model.fields[ entityName ] = new PartsOf( entityName, this.factory, this.model.fields );
        // TODO: return new RelationDef( this.model.fields[ entityName ] )
    }

}

// class EntityBE
// {

//     constructor( name )
//     {
//         this.name = name;
//         this.model = new ModelDef( name );
//         this.host = false;
//     }

//     query()
//     {

//     }

// }

class EntityProxy extends EntityBE
{

    constructor( name )
    {
        super( name );
        this.host = {};
    }

}

const defs = {
    entities: {},

    mainHost: new KdbStoreHost( knex ),

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
            new ModelDef( this.entities[ name ].model, this.entities ) );

        this.setupEntity(name);

        return this.entities[ name ];
    },

    entity( name, callback, clazz ){
        if( this.entities[ name ] )
        {
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

        callback( new ModelDef( this.entities[ name ].model, this.entities ) );

        this.setupEntity(name);

        return this.entities[ name ];
    }
}

module.exports = defs;

