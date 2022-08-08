# simple-schema-validator
An implementation of a (simple) schema validator written in Typescript using the factory design pattern.

## Design Choice:
###### I decided to choose a factory design pattern because I realized that all of these types of schemas shared a single property: they were schemas. Because of this, each schema type would have its own validation method. Utilizing a factory design pattern is useful here because the proper class would be instantiated based on the schema type, and later automatically validated. This design also allowed easy support for nested schemas, which I recognized could only be necessary in object or array schemas. To support nesting, I recursively instantiated the schema service until a validator was called on a primitive type, since that was the most basic type and there is no possibility of nesting. 




#### Schema Types:

String Schema

    type StringSchema = {
        type: 'string';
        enum?: string[];
    }
Number Schema

    type NumberSchema = {
        type: 'number'
    }
Boolean Schema

    type BooleanSchema = {
        type: 'boolean'
    }
Object Schema    

    type ObjectSchema = {
        type: 'object';
        properties: Record<
            string, 
            StringSchema | NumberSchema | BooleanSchema | ObjectSchema | ArraySchema
        >
        required?: string[]
    }
Array Schema 

    type ArraySchema = {
        type: 'array';
        items: StringSchema | NumberSchema | BooleanSchema | ObjectSchema | ArraySchema
    }
