import { useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import { atomWithQuery } from 'jotai-urql';
import { gql } from 'urql';
import { loadableTodoListAtom } from './TodoList';

const TODO_LIST_DETAIL_QUERY = gql`
  query TodoListDetail($ids: [String!]!) {
    todo {
      todosFromIds(ids: $ids) {
        id
        title
        description
      }
    }
  }
`;

interface TodoListDetailQuery {
  todo: {
    todosFromIds: {
      id: string;
      title: string;
      description: string;
    }[];
  };
}

interface TodoListDetailQueryVariables {
  ids: string[];
}

const todoListDetailQueryAtom = atomWithQuery<
  TodoListDetailQuery,
  TodoListDetailQueryVariables
>({
  query: TODO_LIST_DETAIL_QUERY,
  getVariables: (get) => {
    const state = get(loadableTodoListAtom);
    return {
      ids:
        state.state === 'hasData'
          ? state.data.data?.todo.todos.map((todo) => todo.id) ?? []
          : [],
    };
  },
  getPause: (get) => {
    const state = get(loadableTodoListAtom);
    return state.state !== 'hasData';
  },
});
const loadableTodoListDetailQueryAtom = loadable(todoListDetailQueryAtom);

export default function TodoListDetail() {
  const state = useAtomValue(loadableTodoListDetailQueryAtom);
  switch (state.state) {
    case 'loading':
      return <>Loading...</>;
    case 'hasError':
      return <>Error: {String(state.error)}</>;
    case 'hasData':
      return (
        <ul>
          {state.data.data?.todo.todosFromIds.map((todo) => (
            <li key={todo.id}>
              {todo.title} (ID: {todo.id}, description = {todo.description})
            </li>
          ))}
        </ul>
      );
  }
}
