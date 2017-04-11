const greenTheme = {
  name: 'Green',
  main: 'mediumseagreen',
  secondary: 'tomato'
};

const redTheme = {
  name: 'Red',
  main: 'palevioletred',
  secondary: 'slateblue'
};

// Reducers
const themeReducer = (state = {}, action) => {
  switch (action.type) {
    case 'CHANGE_THEME':
      return Object.assign({}, state, {
        theme: action.theme
      })
    default:
      return state;
  }
};

const hl7 = (state = {}, action) => {
  switch (action.type) {
    case 'hl7':
      return {
        ...state,
        data: action.data
      };
    default:
      return state;
  }
};

const mockFetching = (state = {}, action) => {
  switch (action.type) {
    case 'MOCK_FETCHING':
      return {
        ...state,
        data: action.data
      };
    default:
      return state;
  }
};

// Rxweb
const client = new RxWeb.Client();

// Rxweb Middleware/Observers
const filterFunc = task => task.type === 'ASYNC';
const subscribeFunc = task => {
  console.log(task.data.counter);
  log(`Task #${task.data.counter}`);

};
const ASYNCMiddleware = new RxWeb.Middleware(filterFunc, subscribeFunc);

client.middlewares = [
  ASYNCMiddleware,
  new RxWeb.Middleware(
    'GENERATE_REDUCER',
    task => task.done({ ...task.data,
      success: 'From GENERATE_REDUCER'
    })
  ),
  new RxWeb.Middleware(
    'ANOTHER_GENERATE_REDUCER',
    task => task.error({ ...task.data,
      error: 'From ANOTHER_GENERATE_REDUCER'
    })
  ),
  new RxWeb.Middleware(
    'testGraphql',
    task => axios.post('http://graphql-swapi.parseapp.com/', {
      query: `
        {
          allStarships(first: 7) {
            edges {
              node {
                ...starshipFragment
              }
            }
          }
        }

        fragment starshipFragment on Starship {
          id
          name
          model 
          costInCredits
          pilotConnection { edges { node { ...pilotFragment }}}
        }
        fragment pilotFragment on Person {
          name
          homeworld { name }
        }
      `
    }),
    task => log(`${JSON.stringify(task.store.getState().testGraphql, null, '  ')}`)
  ),
  new RxWeb.Middleware(
    'TEST_PROMISE_WITH_DUMMY_SUBSCRIBE_FUNC',
    task => axios.get('http://echo.jsontest.com/hello/world/foo/bar'),
    task => {
      log(`TEST_PROMISE_WITH_DUMMY_SUBSCRIBE_FUNC is ${JSON.stringify(task.store.getState().TEST_PROMISE_WITH_DUMMY_SUBSCRIBE_FUNC, null, '  ')}`);
    }
  ),
  new RxWeb.Middleware(
    'TEST_PROMISE',
    // task => axios.get('http://date.jsontest.com/'),
    // task => axios.get('https://jsonplaceholder.typicode.com/users'),
    // task => axios.get('https://www.graphqlhub.com/graphql'), // Forced expected error
    task => axios.post('https://www.graphqlhub.com/graphql', {
      query: `
        {
          hn {
            topStories(limit: 2) {
              title
              url
            }
          }
        }
      `
      }
    ),
    task => {
      console.log('TEST_PROMISE completed.');
      log(`TEST_PROMISE completed is ${JSON.stringify(task.store.getState().TEST_PROMISE, null, '  ')}`);
    }
  ),
  new RxWeb.Middleware(
    'TEST_PROMISE_FETCH',
    task => fetch('https://www.graphqlhub.com/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            {
              hn {
                topStories(limit: 2) {
                  title
                  url
                }
              }
            }
          `
        })
      }
    ),
    task => {
      console.log('TEST_PROMISE_FETCH completed.');
      console.log(task)
      task.response.json()
        .then(d => log(`TEST_PROMISE_FETCH completed is ${JSON.stringify(d, null, '  ')}`));
    }
  ),
  new RxWeb.Middleware(
    'TEST_PROMISE_FAIL',
    task => axios.get('http://this-site-cannot-possibly-exist.org/'),
    task => {
      console.log('TEST_PROMISE_FAIL completed.');
      log('TEST_PROMISE_FAIL completed.');
      console.log(task);
    }
  ),
  new RxWeb.Middleware(
    'mockFetch',
    task => {
      console.log('I am subscribing to MOCK_FETCH.');
      log('I am subscribing to MOCK_FETCH.');

      async function asideEffect() {
        const {
          store,
          data,
          next,
          done,
          init
        } = task;

        init();

        log(`Redux state is ${JSON.stringify(store.getState(), null, '  ')}`);

        const promise = new Promise(resolve => {
          setTimeout(() => {
            const other = {
              other: 1
            };
            log(`Updating Redux reducer mockFetchSuccess with ${JSON.stringify(other)}`);
            
            done({ ...data,
              other
            });

            console.log(store.getState());
            log(`Redux state is ${JSON.stringify(store.getState(), null, '  ')}`);
            resolve();
          }, 3000);
        })

        await promise;
        console.log('I waited for 3 second');
        log('I waited for 3 second');

        log(`Calling an auto-generated reducer ANOTHER_GENERATE_REDUCER`);
        done();
        log(`Redux state is ${JSON.stringify(store.getState(), null, '  ')}`);

        console.log('Starting some asynchronous tasks...');
        log('Starting some asynchronous tasks (will not update Redux)...');
        for (let i = 0; i < 100; i++) {
          setTimeout(() => next({
            type: 'ASYNC',
            data: {
              counter: i
            }
          }), Math.random() * 30);
        }
      }
      asideEffect();
    }
  )
];

client.start();

// Create store
const middlewares = client.getReduxMiddlewares();

const rxReducers = client.getReduxReducers();

const reducers = Redux.combineReducers({
  themeReducer,
  hl7,
  mockFetching,
  ...rxReducers
});
console.log(rxReducers);
const store = Redux.createStore(reducers, {
  theme: greenTheme
}, Redux.applyMiddleware(...middlewares));

log(`Redux state is ${JSON.stringify(store.getState(), null, '  ')}`);

store.dispatch({
  type: 'testGraphql'
});

store.dispatch({
  type: 'TEST_PROMISE_WITH_DUMMY_SUBSCRIBE_FUNC'
});

store.dispatch({
  type: 'mockFetch',
  data: {
    startTest: true
  }
});

store.dispatch({
  type: 'ANOTHER_GENERATE_REDUCER',
  data: {
    message: 'hey'
  }
});

store.dispatch({
  type: 'GENERATE_REDUCER',
  data: {
    message: 'hey again'
  }
});

store.dispatch({
  type: 'TEST_PROMISE',
  data: {
    message: 'testing a promise with axios'
  }
});

store.dispatch({
  type: 'TEST_PROMISE_FETCH',
  data: {
    message: 'testing a promise with fetch'
  }
});

store.dispatch({
  type: 'TEST_PROMISE_FAIL',
  data: {
    message: 'testing a failed promise'
  }
});
