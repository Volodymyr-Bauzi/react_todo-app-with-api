import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Todo } from '../../types/Todo';
import { TodoItem } from '../TodoItem';
import { createRef, useRef } from 'react';

type TodoListProps = {
  titleInputRef: React.RefObject<HTMLInputElement>;
  todos: Todo[];
  tempTodo: Todo | null;
  title: string;
  isLoading: (todoId: Todo['id']) => boolean;
  isEditing: Todo['id'] | null;
  onDelete: (todoId: Todo['id']) => void;
  onTitleChange: React.Dispatch<React.SetStateAction<string>>;
  onEditTodo: (
    todoId: Todo['id'],
    { fields }: { fields: Partial<Todo> },
  ) => void;
  onToggleSetEditing: (todo: Todo) => void;
  onSubmitChanges: (todo: Todo) => Promise<void>;
  onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>, todo: Todo) => void;
};

export const TodoList: React.FC<TodoListProps> = ({
  titleInputRef,
  todos,
  tempTodo,
  title,
  isLoading,
  isEditing,
  onDelete,
  onTitleChange,
  onEditTodo,
  onToggleSetEditing,
  onSubmitChanges,
  onKeyUp,
}) => {
  const nodeRefs = useRef<Record<number, React.RefObject<HTMLDivElement>>>({});

  return (
    <section className="todoapp__main" data-cy="TodoList">
      <TransitionGroup>
        {todos.map(todo => {
          if (!nodeRefs.current[todo.id]) {
            nodeRefs.current[todo.id] = createRef<HTMLDivElement>();
          }
          const nodeRef = nodeRefs.current[todo.id];

          return (
            <CSSTransition
              key={todo.id}
              nodeRef={nodeRef}
              timeout={300}
              classNames="item"
            >
              {/* <div ref={nodeRef}> */}
              <TodoItem
                titleInputRef={titleInputRef}
                todo={todo}
                title={title}
                isLoading={isLoading}
                isEditing={isEditing}
                onDelete={onDelete}
                onTitleChange={onTitleChange}
                onEditTodo={onEditTodo}
                onToggleSetEditing={onToggleSetEditing}
                onSubmitChanges={onSubmitChanges}
                onKeyUp={onKeyUp}
              />
              {/* </div> */}
            </CSSTransition>
          );
        })}
        {tempTodo && tempTodo.id === 0 && (
          <CSSTransition
            key={0}
            nodeRef={nodeRefs.current[0] || (nodeRefs.current[0] = createRef())}
            timeout={300}
            classNames="temp-item"
          >
            <div ref={nodeRefs.current[0]}>
              <TodoItem
                todo={tempTodo}
                isLoading={isLoading}
                onDelete={() => {}}
              />
            </div>
          </CSSTransition>
        )}
      </TransitionGroup>
    </section>
  );
};
