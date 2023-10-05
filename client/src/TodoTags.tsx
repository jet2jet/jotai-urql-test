import { gql, useQuery } from 'urql';

const TODO_TAGS_QUERY = gql`
  query TodoTags($id: String!) {
    todo {
      todo(id: $id) {
        id
        tags
      }
    }
  }
`;

interface TodoTagsQuery {
  todo: {
    todo: {
      id: string;
      tags: string[];
    };
  };
}

export interface TodoTagsProps {
  id: string;
}

export default function TodoTags({ id }: TodoTagsProps) {
  const [result] = useQuery<TodoTagsQuery>({
    query: TODO_TAGS_QUERY,
    variables: { id },
  });

  const { data, fetching, stale, error } = result;

  return (
    <div>
      {(fetching || stale) && <p>Loading...</p>}

      {error && <p>Oh no... {error.message}</p>}

      {data?.todo &&
        (!data.todo.todo ? (
          <p>Todo is null...</p>
        ) : (
          <p>
            {data.todo.todo.tags.length > 0
              ? data.todo.todo.tags.join(', ')
              : '(none)'}
          </p>
        ))}
    </div>
  );
}
