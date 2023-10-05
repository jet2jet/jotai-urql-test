import { useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import { atomWithQuery } from 'jotai-urql';
import { gql } from 'urql';

const TODOS_QUERY = gql`
  query Todos {
    todo {
      todos {
        id
        title
      }
    }
  }
`;

interface TodosQuery {
  todo: {
    todos: {
      id: string;
      title: string;
    }[];
  };
}

export interface TodoListProps {
  detailed?: boolean;
}

const todoListAtom = atomWithQuery<TodosQuery>({
  query: TODOS_QUERY,
});
export const loadableTodoListAtom = loadable(todoListAtom);

export default function TodoList() {
  const state = useAtomValue(loadableTodoListAtom);

  return (
    <div>
      {state.state === 'loading' && <p>Loading...</p>}

      {state.state === 'hasError' && <p>Oh no... {String(state.error)}</p>}

      {state.state === 'hasData' && state.data.data != null && (
        <ul>
          {state.data.data.todo.todos.map((todo) => (
            <li key={todo.id}>
              {todo.title} (ID: {todo.id})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
