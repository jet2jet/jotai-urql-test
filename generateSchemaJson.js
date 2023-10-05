const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { getIntrospectionQuery } = require('graphql/utilities');

async function main() {
  console.log('Fetch http://localhost:4000');
  const res = await fetch('http://localhost:4000', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: getIntrospectionQuery({ descriptions: false }),
    }),
  });
  const data = await res.json();
  fs.writeFileSync(
    path.resolve(__dirname, 'schema.json'),
    JSON.stringify(data.data, null, 2),
    'utf-8'
  );
  console.log('Done.');
}

main();
