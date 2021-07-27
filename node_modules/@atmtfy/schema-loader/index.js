import { getOptions } from 'loader-utils';
import { validate } from 'schema-utils';

const schema = {
  type: 'object',
  properties: {
    dest: {
      type: 'string'
    }
  }
}

export default function(source) {
  const options = getOptions(this);

  validate(schema, options, {
    name: "SchemaLoader"
  })
  console.log("Schema Loader Running!");
  console.log(source);
}
