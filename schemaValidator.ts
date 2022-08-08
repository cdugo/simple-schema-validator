/**
  * String definition
  * For example, a string schema might look like: { type: 'string' }
  * which validates any string value.
  * 
  * A schema of { type: 'string', enum: ['red', 'green', 'blue'] } only
  * validates strings that match exactly 'red', 'green' or 'blue'.
  */
type StringSchema = {
    type: 'string';
    enum?: string[];
}

type NumberSchema = {
    type: 'number'
}

type BooleanSchema = {
    type: 'boolean'
}

/**
 * For example, a schema that looks like 
 * { type: "object", properties: { name: { type: "string" } } }
 * will match { name: "Kevin" } or {} but should fail { name: 5 } and { hello: "world" }
 * 
 * Required fields must be listed
 */
type ObjectSchema = {
    type: 'object';
    properties: Record<
        string, 
        StringSchema | NumberSchema | BooleanSchema | ObjectSchema | ArraySchema
    >
    required?: string[]
}

/**
 * A schema that looks like this:
 * { type: "array", items: { type: object, properties: { a: { type: number } } } }
 * will match: [{a: 5},  {a: 2}, {a: 10}] but won't match [{a: 5}, {a: 'hello'}]
 */
type ArraySchema = {
    type: 'array';
    items: StringSchema | NumberSchema | BooleanSchema | ObjectSchema | ArraySchema
}

/**
 * DESIGN CHOICE:
 * I decided to choose a factory design pattern because I realized that all of these types of schemas shared a single property: they were schemas. Because of this,
 * each schema type would have its own validation method. Utilizing a factory design pattern is useful here because the proper class would be instantiated based on the schema type, and 
 * later automatically validated. This design also allowed easy support for nested schemas, which I recognized could only be necessary in object or array schemas. To support nesting,
 * I recursively instantiated the schema service until a validator was called on a primitive type, since that was the most basic type and there is no possibility of nesting. 
 */

/**
 * General validator interface allowing all types to implement the validate function
 */
interface Validator {
    validate(data: any, schema: ArraySchema | ObjectSchema | BooleanSchema | NumberSchema | StringSchema): void;
}

class objValidator implements Validator {
    validate(data: any, schema: ArraySchema | ObjectSchema | BooleanSchema | NumberSchema | StringSchema): void {
        if (typeof data !== 'object' || schema.type !== 'object') throw new Error(`Data type ${typeof data} does not match schema type ${schema.type}`);
        const props = schema.properties;
        const requiredProps = schema.required;
        const dataKeys = Object.keys(data);
        const isInEvery = (arr: string[], target: string[]) => target.every(v => arr.includes(v));

        if (requiredProps && requiredProps.length && !isInEvery(dataKeys, requiredProps)) throw new Error(`Data object does not include all required object properties, must include ${requiredProps}`);
        
        dataKeys.forEach(key => {
            const schemaType = props[key];
            if (schemaType) {
                new SchemaService().validate(data[<any>key], schemaType);
            } else throw new Error(`Key ${key} in data not found in schema properties ${props}`);
        });
        
    }
    
}


class arrayValidator implements Validator {
    validate(data: any, schema: ArraySchema | ObjectSchema | BooleanSchema | NumberSchema | StringSchema): void {
        if (!Array.isArray(data) || schema.type !== 'array') throw new Error(`Data type ${typeof data} does not match schema type ${schema.type}`);
        data.forEach(datum => {
            new SchemaService().validate(datum, schema.items);
        });
    }
    
}

class stringValidator implements Validator {
    validate(data: any, schema: ArraySchema | ObjectSchema | BooleanSchema | NumberSchema | StringSchema): void {
        if (typeof data !== 'string' || schema.type !== 'string' || typeof data !== schema.type) throw new Error(`Data type ${typeof data} does not match schema type ${schema.type}`);
        if (schema.enum) {
            if (!schema.enum.includes(data)) throw new Error('String not in enum');
        }
    } 
}

class booleanValidator implements Validator {
    validate(data: any, schema: ArraySchema | ObjectSchema | BooleanSchema | NumberSchema | StringSchema): void {
        if ((typeof data !== 'boolean') || typeof data !== schema.type) throw new Error(`Data type ${typeof data} does not match schema type ${schema.type}`) 
    } 
}

class numberValidator implements Validator {
    validate(data: any, schema: ArraySchema | ObjectSchema | BooleanSchema | NumberSchema | StringSchema): void {
        if ((typeof data !== 'number') || typeof data !== schema.type) throw new Error(`Data type ${typeof data} does not match schema type ${schema.type}`) 
    } 
}

/**
 * Delegates validator class that correlates to provided schema's type
 */
class SchemaFactory {
    static getSchemaInstance(schema: ArraySchema | ObjectSchema | BooleanSchema | NumberSchema | StringSchema) {
        switch (schema.type) {
            case "array": 
                return new arrayValidator();
            case "boolean":
                return new booleanValidator();
            case "number":
                return new numberValidator();
            case "string":
                return new stringValidator();
            default:
                return new objValidator();
        }
    }
}

/**
 * Class that contains *validate* method that calls respective factory method
 */
class SchemaService {
    validate(data: any, schema: ArraySchema | ObjectSchema | BooleanSchema | NumberSchema | StringSchema) {
        return SchemaFactory.getSchemaInstance(schema).validate(data, schema);
    }
}

/**
 * 
 * @param data Data structure following a @schema to be validated
 * @param schema structure to reference the @data and validate types
 * @throws Will throw an error if data does not follow given schema rules
 */

 const validateSchema = (data: any, schema: ArraySchema | ObjectSchema | BooleanSchema | NumberSchema | StringSchema) => {
    new SchemaService().validate(data, schema);
}
