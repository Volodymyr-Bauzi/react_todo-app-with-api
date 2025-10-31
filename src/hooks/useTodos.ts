import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { getFilteredTodos, Todo } from '../types/Todo';
import { StatusFilter } from '../types/statusFilter';
import { ErrorMessage } from '../types/error';
import { todosService, USER_ID } from '../api/todos';
import useErrors from './useErrors';

const useTodos = () => {
  // #region State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState(StatusFilter.All);
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState<Todo['id'] | null>(null);

  const { errorMessage, showError, hideError } = useErrors();

  const addInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // #endregion

  // #region Effects
  useEffect(() => {
    const loadTodos = async () => {
      showError(ErrorMessage.Null);

      try {
        const todosFromServer = await todosService.getTodos();

        setTodos(todosFromServer);
      } catch {
        showError(ErrorMessage.LoadingTodos);
      }
    };

    loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tempTodo || todos.length > 0) {
      addInputRef.current?.focus();
    }
  }, [tempTodo, todos]);

  // #endregion

  // #region Helpers
  const filteredTodos = useMemo(
    () => getFilteredTodos(todos, { status }),
    [todos, status],
  );

  const todosLeft = useMemo(
    () => todos.filter(todo => !todo.completed).length,
    [todos],
  );
  // #endregion

  // #region Handlers
  const handleStatusChange = useCallback((newStatus: StatusFilter) => {
    setStatus(newStatus);
  }, []);

  const handleSubmit = useCallback(
    async (query: string, resetInput: () => void) => {
      const normalizedQuery = query.trim();

      if (!normalizedQuery) {
        showError(ErrorMessage.EmptyTitle);

        return;
      }

      const temporaryTodo: Todo = {
        id: 0,
        title: normalizedQuery,
        completed: false,
        userId: USER_ID,
      };

      setTempTodo(temporaryTodo);
      setLoadingTodoIds([temporaryTodo.id]);

      try {
        const newTodo = await todosService.createTodo({
          title: normalizedQuery,
        });

        setTodos(prev => [...prev, newTodo]);
        resetInput();
      } catch {
        showError(ErrorMessage.AddingTodo);
      } finally {
        setTempTodo(null);
        setLoadingTodoIds([]);
      }
    },
    [showError],
  );

  const handleAddTodoToLoading = useCallback((todoId: Todo['id']) => {
    setLoadingTodoIds(currentLoading => [...currentLoading, todoId]);
  }, []);

  const handleRemoveTodoFromLoading = useCallback((todoId: Todo['id']) => {
    setLoadingTodoIds(currentLoading =>
      currentLoading.filter(id => id !== todoId),
    );
  }, []);

  const getIsTodoLoading = useCallback(
    (todoId: Todo['id']) => {
      return loadingTodoIds.includes(todoId);
    },
    [loadingTodoIds],
  );

  const handleDelete = useCallback(
    async (todoId: Todo['id']) => {
      handleAddTodoToLoading(todoId);

      await todosService
        .deleteTodo(todoId)
        .then(() => {
          setTodos(prev => prev.filter(todo => todo.id !== todoId));
        })
        .catch(() => {
          showError(ErrorMessage.DeletingTodo);
        })
        .finally(() => {
          handleRemoveTodoFromLoading(todoId);
        });
    },
    [handleAddTodoToLoading, handleRemoveTodoFromLoading, showError],
  );

  const handleDeleteAllCompleted = useCallback(async () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id);

    if (completedIds.length === 0) {
      return;
    }

    setLoadingTodoIds(completedIds);
    await Promise.all(completedIds.map(id => handleDelete(id)));
    setLoadingTodoIds([]);
  }, [todos, handleDelete]);

  const handleEditTodo = useCallback(
    async (todoId: Todo['id'], { fields }: { fields: Partial<Todo> }) => {
      handleAddTodoToLoading(todoId);

      const foundTodo = todos.find(todo => todo.id === todoId);

      if (!foundTodo) {
        return;
      }

      const updatedTodo = {
        ...foundTodo,
        ...fields,
      };

      await todosService
        .editTodo({
          id: Number(todoId),
          title: updatedTodo.title,
          completed: updatedTodo.completed,
        })
        .then(() => {
          setIsEditing(null);
          setTodos(prev =>
            prev.map(todo =>
              todo.id === todoId ? { ...todo, ...fields } : todo,
            ),
          );
        })
        .catch(() => {
          showError(ErrorMessage.UpdatingTodo);
          titleInputRef.current?.focus();
        })
        .finally(() => {
          handleRemoveTodoFromLoading(todoId);
        });
    },
    [todos, showError, handleAddTodoToLoading, handleRemoveTodoFromLoading],
  );

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  const handleToggleAllComplete = useCallback(async () => {
    if (todos.every(t => t.completed)) {
      const completedIds = todos.map(t => t.id);

      setLoadingTodoIds(completedIds);
      await Promise.all(
        completedIds.map(id =>
          handleEditTodo(id, { fields: { completed: false } }),
        ),
      );
      setLoadingTodoIds([]);
    } else if (todos.some(t => t.completed)) {
      const completedIds = todos.filter(t => !t.completed).map(t => t.id);

      setLoadingTodoIds(completedIds);
      await Promise.all(
        completedIds.map(id =>
          handleEditTodo(id, { fields: { completed: true } }),
        ),
      );
      setLoadingTodoIds([]);
    } else {
      const completedIds = todos.filter(t => !t.completed).map(t => t.id);

      setLoadingTodoIds(completedIds);
      await Promise.all(
        completedIds.map(id =>
          handleEditTodo(id, { fields: { completed: true } }),
        ),
      );
      setLoadingTodoIds([]);
    }
  }, [todos, handleEditTodo]);

  const handleToggleSetEditing = (todo: Todo) => {
    if (isEditing === todo.id) {
      setIsEditing(null);

      return;
    }

    setTitle(todo.title);
    setIsEditing(todo.id);
  };

  const handleSubmitChanges = async (todo: Todo) => {
    if (title.trim() === todo.title) {
      setIsEditing(null);
      return;
    }

    if (title.trim() === '') {
      handleDelete(todo.id);
      return;
    }

    await handleEditTodo(todo.id, { fields: { title: title.trim() } });
  };

  const handleKeyUp = (
    e: React.KeyboardEvent<HTMLInputElement>,
    todo: Todo,
  ) => {
    if (e.key === 'Escape') {
      handleSubmitChanges(todo);
    }
  };
  // #endregion

  return {
    todos,
    status,
    tempTodo,
    todosLeft,
    addInputRef,

    filteredTodos,
    getIsTodoLoading,

    errorMessage,
    showError,
    hideError,

    handleSubmit,
    handleDelete,
    handleStatusChange,
    handleEditTodo,
    handleToggleAllComplete,
    handleDeleteAllCompleted,

    title,
    titleInputRef,
    setTitle,
    isEditing,
    handleToggleSetEditing,
    handleSubmitChanges,
    handleKeyUp,
  };
};

export default useTodos;
