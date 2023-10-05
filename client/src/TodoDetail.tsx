import { gql, useQuery } from 'urql';

const TODO_DETAIL_QUERY = gql`
  query TodoDetail($id: String!) {
    todo {
      todo(id: $id) {
        id
        title
        description
      }
    }
  }
`;

interface TodoDetailQuery {
  todo: {
    todo: {
      id: string;
      title: string;
      description: string;
    };
  };
}

export interface TodoDetailProps {
  id: string;
}

export default function TodoDetail({ id }: TodoDetailProps) {
  const [result] = useQuery<TodoDetailQuery>({
    query: TODO_DETAIL_QUERY,
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
          <table>
            <tbody>
              <tr>
                <th>ID</th>
                <td>{data.todo.todo.id}</td>
              </tr>
              <tr>
                <th>Title</th>
                <td>{data.todo.todo.title}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td>{data.todo.todo.description}</td>
              </tr>
            </tbody>
          </table>
        ))}
    </div>
  );
}
