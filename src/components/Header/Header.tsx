import { useState } from 'react';
import { Todo } from '../../types/Todo';
import cn from 'classnames';

type HeaderProps = {
  addInputRef: React.RefObject<HTMLInputElement>;
  todos: Todo[];
  tempTodo: Todo | null;
  onSubmit: (query: string, resetInput: () => void) => void;
  onToggleAllComplete: () => Promise<void>;
};

const Header: React.FC<HeaderProps> = ({
  addInputRef,
  todos,
  tempTodo,
  onSubmit,
  onToggleAllComplete,
}) => {
  const [query, setQuery] = useState('');

  const completedTodo = todos?.filter(todo => todo.completed).length;

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    resetInput: () => void,
  ) => {
    e.preventDefault();
    onSubmit(query, resetInput);
  };

  return (
    <header className="todoapp__header">
      {todos.length > 0 && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', {
            active: completedTodo === todos.length,
          })}
          data-cy="ToggleAllButton"
          onClick={onToggleAllComplete}
        />
      )}

      <form onSubmit={e => handleSubmit(e, () => setQuery(''))}>
        <input
          ref={addInputRef}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={tempTodo?.id === 0}
        />
      </form>
    </header>
  );
};

export default Header;
