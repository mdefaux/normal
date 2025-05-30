// var defs = require("./defIndex");
// var knex = require('../db/knex');
// var utils = require("../routes/common/index");
const { EntityBE } = require("./orm/EntityBE");
const { FieldConditionDef } = require("./orm/FieldConditionDef");
// const { KdbStoreHost } = require("./orm/kdbhost/KdbHost");
const { /*PrimaryKeyField, ObjectLink, RelatedObjects, PartsOf,*/ Model /*, StringField */ } = require("./orm/Model");
const fields = require( "./orm/Field" );
const {Action} = require( "./orm/Action" );

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

    externSource(sourceName) {
        this.targetField.externSource = sourceName;
        return this;
    }

    rename(name) {
        this.targetField.tableModel.fields[ name ] = this.targetField;
        delete this.targetField.tableModel.fields[ this.targetField.name ];
        this.targetField.name = name;
        return this;
    }

    renameAsSource() {
        return this.rename( this.targetField.sourceField );
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

    calc(expression) {
        this.targetField.calc = expression;
        return this;
    }
}

class ModelDef {

    constructor ( entity, factory ) {
        this.factory = factory;
        this.entity = entity;
        this.model = entity.metaData.model;
      //  this.id(  new fields.PrimaryKeyField( "id" ) );   
        this.model.fields.id  = new fields.PrimaryKeyField( "id" );  // sets default id column
        this.model.idField = "id";
        // this.fields = {};
    }

    source( sourceName )
    {
        this.model.dbTableName = sourceName;
    }

    onInsert(callback) {
        this.model.onInsert = callback;
    }

    onUpdate(callback) {
        this.model.onUpdate = callback;
    }

    /**Binds the entity to a specific host
     * 
     * @param {StoreHost} storeHost 
     */
    host( storeHost ) {
        // TODO: remove reference to host, keeps reference in metadata
        this.entity.host = storeHost;
        this.entity.metaData.host = storeHost;
    }

    useClass( clazz )
    {

    }

    id( fieldName )
    {
        if( this.model.idField === fieldName )
            return;

        if ( Array.isArray( fieldName ) ) {
            this.model.idField = fieldName;
            return fieldName.map( (f) => this.model.fields[ f] );
        }

        if( this.model.idField && this.model.idField === 'id') {
            delete this.model.fields[ "id" ];
        }
     /*    else {
            this.model.fields[ fieldName ] = new fields.PrimaryKeyField( fieldName );
        } */
        if(!this.model.fields[fieldName]) {
            throw new Error(`'${fieldName}' not found in model fields.`);
        }

        this.model.idField = fieldName;
        return this.model.fields[ fieldName ];
    }

    label( fieldName ) {

        // if ( !this.model.fields[ fieldName ] ) {
        //     this.string( fieldName );
        // }

        this.model.labelField = fieldName;

        // return new FieldDef( this.model.fields[ fieldName ] );
    }

    calc(expression) {
        this.calc = expression;
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

    timestamp( fieldName )
    {
        let field = this.date( fieldName );
        field.targetField.timeEnabled = true;

        return field;
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
                entityName = entity.metaData.name;

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
        this.model.fields[ fieldName ].name = fieldName;
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

    action( actionName, callback ) {

        if ( !actionName ) {
            throw new Error( `Specifiy an action name.` );
        }
        if ( !callback ) {
            throw new Error( `Specifiy a callback.` );
        }
        if ( !(typeof callback === 'function') ) {
            throw new Error( `Specifiy a callback for action '${actionName}' in entity '${this.entity.name}' ` );
        }
        if ( this.entity.actionDictionary && this.entity.actionDictionary[ actionName ] ) {
            throw new Error( `Action '${actionName}' already defined in entity '${this.entity.name}' ` );
        }

        let newAction = new Action( actionName, this.entity, callback );

        this.entity.actionDictionary = {
            ... this.entity.actionDictionary || {},

            [actionName]: newAction
        }

        this.entity[ actionName ] = function( data ) {

            return newAction.execute( data );
        }

    }

    relation( relationName, factoryCallback ) {

        // TODO: use Relation class
        let newRelation = {};
        // {
        //     queryFactory: newRelation
        // }

        // let relationDefinitor = {
        //     select: ( selectCallback ) => { 
        //         newRelation.select = selectCallback
        //     }
        // };

        // factoryCallback( relationDefinitor );

        this.entity.metaData.relations = {
            ...this.entity.metaData.relations,
            [ relationName ]: factoryCallback
            // [ relationName ]: newRelation
        }
    }

    select( createSelectCallback ) {
        this.entity.metaData.createSelectCallback = createSelectCallback;
    }

    paged( isPaged = true ) {
        this.entity.metaData.model.paged = isPaged;
    }

    rowLevelSecurity(rls) {
        this.entity.rowLevelSecurity = rls;
    }

    patchPermission(f) {
        this.entity.patchPermission = f;
    }

    canInsert( callback ) {
        if ( typeof callback !== 'function' ) {
            throw new Error( `canInsert parameter should be a function.` );
        }
        this.entity.metaData.canInsert = callback;
    }

    canUpdate( callback ) {
        if ( typeof callback !== 'function' ) {
            throw new Error( `canUpdate parameter should be a function.` );
        }
        this.entity.metaData.canUpdate = callback;
    }

    canDelete( callback ) {
        if ( typeof callback !== 'function' ) {
            throw new Error( `canDelete parameter should be a function.` );
        }
        this.entity.metaData.canDelete = callback;
    }

    canChange( callback ) {
        if ( typeof callback !== 'function' ) {
            throw new Error( `canChange parameter should be a function.` );
        }
        this.entity.metaData.canChange = callback;
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
const { Session } = require("./orm/Session");

const defs = {
    entities: {},

    mainHost: undefined, // new KdbStoreHost( knex ),

    hosts: {},

    /**Setups main Store with a specific host
     * 
     * @param {*} storeHost 
     */
    setupMainHost( storeHost ) {
        this.mainHost = storeHost;
    },

    setup( storeHost ) {
        this.setupMainHost( storeHost );
        return this;
    },

    createHost( storeHost, id ) {
        return this.hosts[ id ||  storeHost.id?.() || 'anonymous-host' ] = storeHost;
    },

    data( name, jsonData ) {
        if(!this.data[name]) this.data[ name ] = new DataStorage();
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
        // console.log( `Setting up class ${name}.` );
        if( this.entities[ name ] ) {
            // return;
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
    },

    today() {
        return (new Date()).getDate();
    },
     
    getEntity(entityName, sessionData) {
        if(!entityName || !this.entities[entityName] ) return null;

        if ( sessionData ) {
            const session = new Session( this, sessionData );
            return session.getEntity( entityName );
        }

        return this.entities[entityName];
    }
}

module.exports = defs;

