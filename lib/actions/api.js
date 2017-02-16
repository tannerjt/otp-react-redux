import deepEqual from 'deep-equal'
import { browserHistory } from 'react-router'
import { createAction } from 'redux-actions'
import fetch from 'isomorphic-fetch'
import qs from 'qs'

import { hasValidLocation } from '../util/state'

export const receivedPlanResponse = createAction('PLAN_RESPONSE')
export const requestPlanResponse = createAction('PLAN_REQUEST')

export function planTrip () {
  return function (dispatch, getState) {
    const otpState = getState().otp
    const latest = otpState.searches.length && otpState.searches[otpState.searches.length - 1]
    // check for query change
    // TODO: check for change in time if 'NOW' mode is selected
    if (otpState.activeSearch !== null && latest && deepEqual(latest.query, otpState.currentQuery)) {
      console.log('query hasn\'t changed')
      return
    }
    if (!hasValidLocation(otpState, 'from') || !hasValidLocation(otpState, 'to')) {
      console.log('invalid query', otpState)
      return // TODO: replace with isQueryValid?
    }
    dispatch(requestPlanResponse())
    const url = constructPlanQuery(getState().otp.config.api, getState().otp.currentQuery)
    fetch(url)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response from server')
        }
        return response.json()
      }).then(json => {
        dispatch(receivedPlanResponse(json))
        setURLSearch(url, getState())
      })
  }
}

function setURLSearch (params, state) {
  if (state.routing) {
    browserHistory.push(`plan?${params.split('plan?')[1]}`)
  }
}

function constructPlanQuery (api, query) {
  const planEndpoint = `${api.host}:${api.port}${api.path}/plan`
  const { mode, time, date } = query
  const params = {
    fromPlace: `${query.from.lat},${query.from.lon}`,
    showIntermediateStops: true,
    toPlace: `${query.to.lat},${query.to.lon}`,
    mode
  }
  //  TODO: add all non-object values to params
  // for (var key in query) {
  //   if (query.hasOwnProperty(key) && !(query[key] instanceof Object) && query[key] !== null) {
  //     console.log('non-object', query[key])
  //     params[key] = query[key]
  //   }
  // }
  switch (query.departArrive) {
    case 'ARRIVE':
      params.arriveBy = true
      params.date = date
      params.time = time
      break
    case 'DEPART':
      params.arriveBy = false
      params.date = date
      params.time = time
      break
    default:
      break
  }
  const stringParams = qs.stringify(params)
  // TODO: set url hash based on params
  // setURLSearch(stringParams)
  // TODO: check that valid from/to locations are provided

  return `${planEndpoint}?${stringParams}`
}
