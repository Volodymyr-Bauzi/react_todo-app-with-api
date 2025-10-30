import { Todo } from '../../types/Todo';
import cn from 'classnames';

export type TodoItemProps = {
  todo: Todo;
  title?: string;
  titleRef?: React.RefObject<HTMLInputElement>;
  isLoading: (todoId: Todo['id']) => boolean;
  isEditing?: Todo['id'] | null;
  onDelete?: (todoId: Todo['id']) => void;
  onTitleChange?: React.Dispatch<React.SetStateAction<string>>;
  onEditTodo?: (
    todoId: Todo['id'],
    { fields }: { fields: Partial<Todo> },
  ) => void;
  onToggleSetEditing?: (todo: Todo) => void;
  onSubmitChanges?: (todo: Todo, e?: React.FormEvent<HTMLFormElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>, todo: Todo) => void;
};

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
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
    <div
      key={todo.id}
      data-cy="Todo"
      className={cn('todo', { completed: todo.completed })}
    >
      <label className="todo__status-label">
        <input
          aria-label={`Mark todo "${todo.title}" as completed`}
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          disabled={isLoading(todo.id)}
          onChange={() =>
            onEditTodo?.(todo.id, { fields: { completed: !todo.completed } })
          }
        />
      </label>

      {isEditing === todo.id ? (
        <form onSubmit={e => onSubmitChanges?.(todo, e)}>
          <input
            ref={titleRef}
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={title}
            onChange={event => onTitleChange?.(event.target.value)}
            onBlur={() => onSubmitChanges?.(todo)}
            onKeyUp={e => onKeyUp?.(e, todo)}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => onToggleSetEditing?.(todo)}
          >
            {todo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDelete?.(todo.id)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': isLoading(todo.id),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
