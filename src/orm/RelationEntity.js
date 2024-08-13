
class RelationEntity {

    constructor( refEntity ) {
        this._metaData = {
            refEntity: refEntity
        }
    }

    parse( rawObject, parserData ) {

        return this._metaData.refEntity.parse( rawObject, parserData );
    }

}

exports.RelationEntity = RelationEntity;
