import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';

import { environment } from '../../../environments/environment';

export interface State {
}

export const reducers: ActionReducerMap<State> = {
};

// console.log all actions
export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state: any, action: any): any => {
    const result = reducer(state, action);
    console.groupCollapsed(action.type);
    console.log('previous state: ', state);
    console.log('action: ', action);
    console.log('next state: ', result);
    console.groupEnd();

    return result;
  };
}

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? [logger]
  : [];
