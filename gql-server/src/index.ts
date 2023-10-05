import { ApolloServer, type Config, gql } from 'apollo-server';
import type {
  AddTodoArgs,
  RemoveTodoArgs,
  Todo,
  TodoArgs,
  TodosFromIdsArgs,
  UpdateTodoArgs,
} from './types';

const typeDefs = gql`
  type Todo {
    id: String!
    title: String!
    description: String!
    tags: [String!]!
  }

  type TodoContainer {
    todos: [Todo!]!
    privateTodos: [Todo!]!
    todo(id: String!): Todo
    todosFromIds(ids: [String!]!): [Todo!]!
  }

  type Query {
    todo: TodoContainer!
  }

  type Mutation {
    addTodo(title: String!, description: String!): Todo!
    updateTodo(id: String!, title: String!, description: String!): Todo!
    removeTodo(id: String!): Todo!
    addPrivateTodo(title: String!, description: String!): Todo!
    updatePrivateTodo(id: String!, title: String!, description: String!): Todo!
    removePrivateTodo(id: String!): Todo!
  }
`;

interface MyContext {
  isPrivate: boolean;
}

const todos: Todo[] = [
  {
    id: '1',
    title: 'First todo title',
    description: 'First todo description',
    tags: ['first'],
  },
  {
    id: '2',
    title: 'Second todo title',
    description: 'Second todo description',
    tags: [],
  },
];
const privateTodos: Todo[] = [];
let currentId: number = 0;
let currentPrivateId: number = 0;

const resolvers = {
  TodoContainer: {
    todos: () => todos,
    privateTodos: (_1: unknown, _2: unknown, context: MyContext) => {
      if (!context.isPrivate) {
        throw new Error('Authorization needed');
      }
      return privateTodos;
    },
    todo: (_, args: TodoArgs) => {
      return todos.find((todo) => todo.id === args.id) ?? null;
    },
    todosFromIds: (_, args: TodosFromIdsArgs) => {
      return args.ids
        .map((id) => todos.find((todo) => todo.id === id))
        .filter((todo): todo is NonNullable<typeof todo> => todo != null);
    },
  },
  Query: {
    todo: () => ({}),
  },
  Mutation: {
    addTodo: (_: unknown, args: AddTodoArgs) => {
      const newId = ++currentId;
      const newTodo: Todo = {
        id: `${newId}`,
        title: args.title,
        description: args.description,
        tags: args.tags ?? [],
      };
      todos.push(newTodo);
      return newTodo;
    },
    updateTodo: (_: unknown, args: UpdateTodoArgs) => {
      const todo = todos.find((t) => t.id === args.id);
      if (!todo) {
        throw new Error('Not found');
      }
      todo.title = args.title;
      todo.description = args.description;
      todo.tags = args.tags ?? todo.tags;
      return todo;
    },
    removeTodo: (_: unknown, args: RemoveTodoArgs) => {
      const i = todos.findIndex((t) => t.id === args.id);
      if (i < 0) {
        throw new Error('Not found');
      }
      return todos.splice(i, 1);
    },
    addPrivateTodo: (_: unknown, args: AddTodoArgs, context: MyContext) => {
      if (!context.isPrivate) {
        throw new Error('Authorization needed');
      }
      const newId = ++currentPrivateId;
      const newTodo: Todo = {
        id: `${newId}`,
        title: args.title,
        description: args.description,
        tags: args.tags ?? [],
      };
      privateTodos.push(newTodo);
      return newTodo;
    },
    updatePrivateTodo: (
      _: unknown,
      args: UpdateTodoArgs,
      context: MyContext
    ) => {
      if (!context.isPrivate) {
        throw new Error('Authorization needed');
      }
      const todo = privateTodos.find((t) => t.id === args.id);
      if (!todo) {
        throw new Error('Not found');
      }
      todo.title = args.title;
      todo.description = args.description;
      todo.tags = args.tags ?? todo.tags;
      return todo;
    },
    removePrivateTodo: (
      _: unknown,
      args: RemoveTodoArgs,
      context: MyContext
    ) => {
      if (!context.isPrivate) {
        throw new Error('Authorization needed');
      }
      const i = privateTodos.findIndex((t) => t.id === args.id);
      if (i < 0) {
        throw new Error('Not found');
      }
      return privateTodos.splice(i, 1);
    },
  },
} satisfies Config['resolvers'];

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  context: ({ req }): MyContext => {
    const token: string = req.headers.authorization || '';
    const isPrivate = token !== '';
    return { isPrivate };
  },
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
