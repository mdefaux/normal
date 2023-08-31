# NORMALY ERRORS

## NORMALY-0001 Unknown field in entity
Wrong or mispelled field name in a specified entity.

@example
    
    NORMALY-0001 Unknown field 'kam' value '2', in entity 'Progetto'. Did you mean kam1, kam2?

## NORMALY-0002 Value for column not found in table.
In an update statement was used for an ObjectLookup type column a string value that does not match any entry in the looked table.

@example

    NORMALY-0002 Value: '24X5XNBD' for column 'codice_sla' not found in table 'CodiceSla'.

@solution
A. Checks the available values in the target looked table.
B. try to insert the value in the target looked table first.
C. if new value should be inserted automatically, use the InsertStatement or UpdateStatement method `autoInsertNewObjectLookupValues()`

@example

    Project.insert( { codice_sla: '24X5XNBD' } )
        .autoInsertNewObjectLookupValues()
        .exec();


@todo

    Project.insert( { codice_sla: autoInsert( '24X5XNBD' ) } )
        .exec();

## NORMALY-0003 Table missing label definition.
Lack of label name within a specific entity.

@example

    NORMALY-0003 Table 'Componente' missing label definition.'

@solution
Check in the Def file of the entity that is called by the objectlink if there is the model.label of the called field.

@example
in AssetInventoryTecnicoDef.js

  model
    .objectLink(Componente)
    .source("id_componente")
    .label("PART NUMBER")
    .readonly(false)
    .mandatory(true)
    .save(true);


@todo
in ComponenteDef.js

 model.string("part_number").label("PART NUMBER");
  model.label("part_number");  <----- ADD THIS 



## NORMALY-0004 Table 'Componente' wrong label definition, column with name 'part_numbero'  dosen't exist.
Wrong or mispelled label name in a specified entity.

@example

 NORMALY-0004 Table 'Componente' wrong label definition, column with name 'part_numbero'  dosen't exist.

@solution
Checks in the entity's Def file whether the model.label of the field in the objectlink is spelled correctly with respect to the previso field name in the entity called in the objectlink

@example
in ComponenteDef
  model.string("part_number").label("PART NUMBER");
  model.label("part_numbero");

@todo

   model.string("part_number").label("PART NUMBER");
  model.label("part_number");  <---- FIX THE NAME
