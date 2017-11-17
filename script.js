const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }

      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO':
      return state.map(t =>
        todo(t, action)
      );
    default:
      return state;
  }
};

const visibilityFilter = (
  state = 'SHOW_ALL',
  action
) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const { combineReducers } = Redux;
const todoApp = combineReducers({
  todos,
  visibilityFilter
});

let nextTodoId = 0;
const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  };
};

const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  };
};

const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  };
};

const { Component } = React;
const { Provider, connect } = ReactRedux;

const Radio = ({
  active,
  children,
  onChange
}) => {

  return (
    <label className="filter">
      <input checked={active}
        type="radio"
        name="filter"
        className="filter__radio"
         onChange={e => {
           onChange();
         }}
      />
      <span className={`filter__label--${children.toLowerCase()}`}>{children}</span>
    </label>
  );
};

const mapStateToRadioProps = (
  state,
  ownProps
) => {
  return {
    active:
      ownProps.filter ===
      state.visibilityFilter
  };
};
const mapDispatchToRadioProps = (
  dispatch,
  ownProps
) => {
  return {
    onChange: () => {
      dispatch(
        setVisibilityFilter(ownProps.filter)
      );
    }
  };
}
const FilterRadio = connect(
  mapStateToRadioProps,
  mapDispatchToRadioProps
)(Radio);

const Footer = () => (
  <fieldset className="filters">
    <legend className="filters__title">Show:</legend>
    <FilterRadio filter='SHOW_ALL'>
      All
    </FilterRadio>
    <FilterRadio filter='SHOW_ACTIVE'>
      Active
    </FilterRadio>
    <FilterRadio filter='SHOW_COMPLETED'>
      Completed
    </FilterRadio>
  </fieldset>
);

const Todo = ({
  onClick,
  completed,
  text
}) => (
  <li
    onClick={onClick}
    className={
      completed ?
        "todo-list__item--completed" :
        "todo-list__item--active"
    }
  >
    {text}
  </li>
);

const TodoList = ({
  todos,
  onTodoClick
}) => (
  <ReactCSSTransitionGroup
        component="ul"
        className="todo-list"
        transitionName="todo-transition"
        transitionEnterTimeout={100}
        transitionLeaveTimeout={100}
      >
    {todos.map(todo =>
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => onTodoClick(todo.id)}
      />
    )}
  </ReactCSSTransitionGroup>
);

let AddTodo = ({ dispatch }) => {
  let input;

  return (
    <div className="add-todo">
      <input ref={node => {
        input = node;
      }} className="add-todo__input" placeholder="new todo" onKeyUp={(e) => {
        if (e.keyCode == 13) {
          dispatch(addTodo(input.value));
          input.value = '';
        }
      }}/>
      <button onClick={() => {
        dispatch(addTodo(input.value));
        input.value = '';
      }} className="add-todo__button">
        Add Todo
      </button>
    </div>
  );
};
AddTodo = connect()(AddTodo);

const getVisibleTodos = (
  todos,
  filter
) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(
        t => t.completed
      );
    case 'SHOW_ACTIVE':
      return todos.filter(
        t => !t.completed
      );
  }
}

const mapStateToTodoListProps = (
  state
) => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  };
};
const mapDispatchToTodoListProps = (
  dispatch
) => {
  return {
    onTodoClick: (id) => {
      dispatch(toggleTodo(id));
    }
  };
};
const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps
)(TodoList);

const TodoApp = () => (
  <div className="todo-app">
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
);

const todoAppStore = Redux.createStore(todoApp);
todoAppStore.dispatch(addTodo('New TODO'));
todoAppStore.dispatch(addTodo('Even newer TODO'));
todoAppStore.dispatch(addTodo('One more TODO'));
todoAppStore.dispatch(toggleTodo(1));

ReactDOM.render(
  <Provider store={todoAppStore}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
);
