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

