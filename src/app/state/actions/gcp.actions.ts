import { createAction, props } from '@ngrx/store';

export const newWebSocketMessage = createAction(
  '[Gcp] New web socket message',
  props<{messages: any[]}>()
);
