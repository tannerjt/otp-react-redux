import { createAction } from 'redux-actions'

import { planTrip } from './api'
import { queryIsValid } from '../util/state'

export const settingMode = createAction('SET_MODE')
export const settingDepart = createAction('SET_DEPART')
export const settingDate = createAction('SET_DATE')
export const settingTime = createAction('SET_TIME')
export const changingForm = createAction('FORM_CHANGED')

export function setMode (payload) {
  return function (dispatch, getState) {
    dispatch(settingMode(payload))
    dispatch(formChanged())
  }
}

export function setDepart (payload) {
  return function (dispatch, getState) {
    dispatch(settingDepart(payload))
    dispatch(formChanged())
  }
}

export function setDate (payload) {
  return function (dispatch, getState) {
    dispatch(settingDate(payload))
    dispatch(formChanged())
  }
}

export function setTime (payload) {
  return function (dispatch, getState) {
    dispatch(settingTime(payload))
    dispatch(formChanged())
  }
}

export function formChanged () {
  return function (dispatch, getState) {
    dispatch(changingForm())
    // TODO: make auto-plan trip a configurable
    if (queryIsValid(getState().otp)) {
      dispatch(planTrip())
    }
  }
}
