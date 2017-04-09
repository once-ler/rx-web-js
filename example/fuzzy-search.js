// Rxweb
const client = new RxWeb.Client();

// VirtualList
var VirtualList = window.VirtualList.default;

const Header = props => (
  <h2>Fuzzy Search</h2>
);

const onChangeHandler = (event, props) => {
  const searchValue = event.target.value;
  if (searchValue.length == 0) return props.dispatch({type: 'resetComments'});

  props.dispatch({type: 'moreSearch', searchValue });
};

const Input = props => (
  <input type="text" onChange={e => onChangeHandler(e, props)} />
);

const Count = props => (
  <h3>Results: {props.comments.list.length}</h3>
);

const List = props => {
  const {comments, dispatch} = props;
  return (
    <div>
      <Header />
      <Input dispatch={dispatch} fuse={comments.fuse} />
      <Count comments={comments}/>
      <VirtualList
        width='100%'
        height={600}
        itemCount={comments.list.length}
        itemSize={50}
        renderItem={({index, style}) => {
            return (
              <div key={index} style={style}>
                #{index}: Body: {comments.list[index].body}
              </div>
            )
          }
        }
      />
    </div>
  );
};

const searchMiddleware = new RxWeb.Middleware(
  'moreSearch',
  task => {
    const fuse = task.store.getState().comments.fuse;
    const results = fuse.search(task.searchValue);
    task.store.dispatch({type: 'comments', fuse, payload: results});
  }
);

/*
  https://jsonplaceholder.typicode.com/comments
  columns: postId, id, name, email, body
*/
client.middlewares = [
  new RxWeb.Middleware(
    'fetchComments',
    task => axios.get('https://jsonplaceholder.typicode.com/comments'),
    task => {
      const options = {
        keys: ['body', 'email', 'name'],
        threshold: 0,
        verbose: false
      }
      const payload = task.store.getState().fetchComments.payload.data;
      const fuse = new Fuse(payload, options);
      task.store.dispatch({type: 'comments', fuse, payload});
    }
  ),
  searchMiddleware
];

client.start();

// Test reducers
const comments = (state = { searchValue: '', list: [], fuse: null }, action) => {
  switch (action.type) {
    case 'comments':
      return {
        ...state,
        list: action.payload,
        fuse: action.fuse
      };
    case 'resetComments':
      return {
        ...state,
        list: state.fuse.list
      }
    default:
      return state;
  }
};

// Create store
const middlewares = client.getReduxMiddlewares();
const rxReducers = client.getReduxReducers();

const reducers = Redux.combineReducers({ comments, ...rxReducers });
const store = Redux.createStore(reducers, Redux.applyMiddleware(...middlewares));

store.dispatch({type: 'fetchComments'});

const mapStateToProps = state => ({comments: state.comments, searchValue: state.searchValue, fuse: state.fuse});
const mapDispatchToProps = dispatch => ({ dispatch });
const App = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(List);

ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <App />       
  </ReactRedux.Provider>,
  document.getElementById('root'));
