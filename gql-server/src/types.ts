export interface Todo {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface TodoArgs {
  id: string;
}

export interface TodosFromIdsArgs {
  ids: string[];
}

export interface AddTodoArgs {
  title: string;
  description: string;
  tags?: string[] | null;
}

export interface UpdateTodoArgs {
  id: string;
  title: string;
  description: string;
  tags?: string[] | null;
}

export interface RemoveTodoArgs {
  id: string;
}
