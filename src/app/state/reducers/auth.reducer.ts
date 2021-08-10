import { Action, createReducer, on } from '@ngrx/store';
import { User } from 'src/app/data/models/user';
import * as AuthActions from '../actions/auth.actions';

export const authFeatureKey = 'auth';
export interface State {
  user: any;
}

export const initialState: State = {
  user: null
};

export const reducer = createReducer(
  initialState,
  on(AuthActions.setUser, (state, action) => (
    {
      ...state,
      user: action.user,
    }
  )),
);

