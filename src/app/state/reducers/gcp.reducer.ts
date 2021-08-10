import { Action, createReducer, on } from '@ngrx/store';
import * as GcpActions from '../actions/gcp.actions';

export const gcpFeatureKey = 'gcp';

export interface State {
  messages: any;
}

export const initialState: State = {
  messages: null
};

export const reducer = createReducer(
  initialState,
  on(GcpActions.newWebSocketMessage, (state, action) => (
    {
      ...state,
      messages: action.messages,
    }
  )),
);

