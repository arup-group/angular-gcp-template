import { createAction, props } from '@ngrx/store';
import { User } from 'src/app/data/models/user';

export const setUser = createAction(
  '[Auth] Set current user',
  props<{user: any}>()
);

export const loadData = createAction(
  '[NewScenario] Create New Scenario',
  props<{ payload: any }>()
);

export const loadDataSuccess = createAction(
  '[NewScenario] Create New Scenario Success',
);

export const loadDataFailure = createAction(
  '[NewScenario] Create New Scenario Failure',
  props<{ error: any }>()
);
