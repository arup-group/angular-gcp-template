import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromGCP from '../reducers/gcp.reducer';

export const selectGCPState = createFeatureSelector<fromGCP.State>(
  fromGCP.gcpFeatureKey
);

export const selectMessages = createSelector(
  selectGCPState,
  state => state.messages
);
