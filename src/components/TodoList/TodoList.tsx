import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Todo } from '../../types/Todo';
import { TodoItem } from '../TodoItem';

type TodoListProps = {
  todos: Todo[];
  tempTodo: Todo | null;
  title: string;
  titleRef: React.RefObject<HTMLInputElement>;
  isLoading: (todoId: Todo['id']) => boolean;
  isEditing: Todo['id'] | null;
  onDelete: (todoId: Todo['id']) => void;
  onTitleChange: React.Dispatch<React.SetStateAction<string>>;
  onEditTodo: (
    todoId: Todo['id'],
    { fields }: { fields: Partial<Todo> },
  ) => void;
  onToggleSetEditing: (todo: Todo) => void;
  onSubmitChanges: (todo: Todo, e?: React.FormEvent<HTMLFormElement>) => void;
  onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>, todo: Todo) => void;
};

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  tempTodo,
  title,
  titleRef,
  isLoading,
  isEditing,
  onDelete,
  onTitleChange,
  onEditTodo,
  onToggleSetEditing,
  onSubmitChanges,
  onKeyUp,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      <TransitionGroup>
        {todos.map(todo => (
          <CSSTransition key={todo.id} timeout={300} classNames="item">
            <TodoItem
              todo={todo}
              title={title}
              titleRef={titleRef}
              isLoading={isLoading}
              isEditing={isEditing}
              onDelete={onDelete}
              onTitleChange={onTitleChange}
              onEditTodo={onEditTodo}
              onToggleSetEditing={onToggleSetEditing}
              onSubmitChanges={onSubmitChanges}
              onKeyUp={onKeyUp}
            />
          </CSSTransition>
        ))}
        {tempTodo && tempTodo.id === 0 && (
          <CSSTransition key={0} timeout={300} classNames="temp-item">
            <TodoItem
              todo={tempTodo}
              isLoading={isLoading}
              onDelete={() => {}}
            />
          </CSSTransition>
        )}
      </TransitionGroup>
    </section>
  );
};
