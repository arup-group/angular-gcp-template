import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {switchMap, map, catchError, withLatestFrom} from 'rxjs/operators';
import {ApiService} from "../../data/services/api.service";

import * as AuthActions from "../actions/auth.actions";


@Injectable()
export class AuthEffects {
  loadSomeData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.loadData),
      switchMap((action) => this.api.getData()
        .pipe(
          map((result: any[]) => AuthActions.loadDataSuccess()),
          catchError((error: any) => of(AuthActions.loadDataFailure({error})))
        )
      )
    );
  });


  constructor(
    private actions$: Actions,
    private api: ApiService,
  ) {
  }

}
