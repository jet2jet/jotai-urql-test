import * as React from 'react';
import { useSetAtom } from 'jotai';
import { clientAtom } from 'jotai-urql';
import { Client, Provider, fetchExchange, ssrExchange } from 'urql';
import { Entity, cacheExchange } from '@urql/exchange-graphcache';

import TodoList from './TodoList';
import TodoDetail from './TodoDetail';
import TodoTags from './TodoTags';

import * as schema from '../../schema.json';
import TodoListDetail from './TodoListDetail';

const ssr = ssrExchange({
  isClient: true,
  // Emulate SSR
  initialState: {
    '-2104782858': {
      data: '{"todo":{"todos":[{"id":"1","title":"First todo title","__typename":"Todo"},{"id":"2","title":"Second todo title","__typename":"Todo"}],"__typename":"TodoContainer"}}',
      hasNext: false,
    },
  },
});

const client = new Client({
  url: 'http://localhost:4000',
  exchanges: [
    cacheExchange({
      schema,
      keys: {
        TodoContainer: (_data) => null,
      },
      resolvers: {
        TodoContainer: {
          todo: (parent, args, cache, _info) => {
            const cached = cache.resolve(parent as Entity, 'todo', args);
            if (cached != null) {
              return cached;
            }
            if (args.id != null) {
              return {
                __typename: 'Todo',
                id: args.id,
              };
            }
            return undefined;
          },
        },
      },
    }),
    ssr,
    fetchExchange,
  ],
});

export default function App() {
  const [id, setId] = React.useState<string | null>(null);
  const [listType, setListType] = React.useState<'normal' | 'detailed'>(
    'normal'
  );
  const refInput = React.useRef<HTMLInputElement>(null);
  const onSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (refInput.current == null) {
      return;
    }
    setId(refInput.current.value);
  }, []);
  const setClient = useSetAtom(clientAtom);
  React.useEffect(() => {
    setClient(client);
  }, [setClient]);

  return (
    <Provider value={client}>
      <section>
        <h2>List</h2>
        <p>
          {listType}
          <br />
          <button onClick={() => setListType('normal')}>Normal</button>
          <button onClick={() => setListType('detailed')}>Detailed</button>
        </p>
        {listType === 'normal' ? <TodoList /> : <TodoListDetail />}
      </section>
      <section>
        <h2>Detail</h2>
        <form onSubmit={onSubmit}>
          <p>
            ID: <input ref={refInput} type="text" />{' '}
            <input type="submit" value="Get" />
          </p>
        </form>
        <h3>Properties</h3>
        {id != null && <TodoDetail id={id} />}
        <h3>Tags</h3>
        {id != null && <TodoTags id={id} />}
      </section>
    </Provider>
  );
}
