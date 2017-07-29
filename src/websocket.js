/* @flow */
const reducer = (state: any = {}, action: any) => {
  switch (action.type) {
    case 'WEBSOCKET_CONNECT':
      return {
        ...state,
        connect: action.data
      };
    case 'WEBSOCKET_DISCONNECT':
      return state;
    case 'WEBSOCKET_SEND':
      return {
        ...state,
        send: action.data
      };
    case 'WEBSOCKET_PAYLOAD':
      console.log(action);
      return {
        ...state,
        payload: action.data
      };
    case 'WEBSOCKET_ERROR':
      return {
        ...state,
        error: action.data
      };
    default:
      return state;
  }
};

export { reducer as WebSocketReducer };
