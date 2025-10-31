/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import { TodoList } from './components/TodoList';
import Footer from './components/Footer';
import ErrorNotification from './components/ErrorNotification';
import Header from './components/Header';
import useTodos from './hooks/useTodos';

export const App: React.FC = () => {
  const {
    todos,
    status,
    tempTodo,
    todosLeft,
    addInputRef,
    errorMessage,
    filteredTodos,
    hideError,
    handleSubmit,
    handleDelete,
    getIsTodoLoading,
    handleStatusChange,
    handleEditTodo,
    handleToggleAllComplete,
    handleDeleteAllCompleted,

    title,
    titleInputRef,
    isEditing,
    setTitle,
    handleKeyUp,
    handleSubmitChanges,
    handleToggleSetEditing,
  } = useTodos();

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          addInputRef={addInputRef}
          todos={todos}
          tempTodo={tempTodo}
          onSubmit={handleSubmit}
          onToggleAllComplete={handleToggleAllComplete}
        />

        <TodoList
          titleInputRef={titleInputRef}
          todos={filteredTodos}
          tempTodo={tempTodo}
          isEditing={isEditing}
          title={title}
          onKeyUp={handleKeyUp}
          onDelete={handleDelete}
          isLoading={getIsTodoLoading}
          onTitleChange={setTitle}
          onEditTodo={handleEditTodo}
          onSubmitChanges={handleSubmitChanges}
          onToggleSetEditing={handleToggleSetEditing}
        />

        {todos.length > 0 && (
          <Footer
            todos={todos}
            status={status}
            todosLeft={todosLeft}
            onDeleteAll={handleDeleteAllCompleted}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      <ErrorNotification errorMsg={errorMessage} onHideError={hideError} />
    </div>
  );
};
