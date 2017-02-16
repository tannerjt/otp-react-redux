import qs from 'qs'

import { getCurrentTime, getCurrentDate } from '../util/time'
import { coordsToString } from '../util/map'

/**
 * Get the active itinerary for the active search object
 * @param {object} otpState the OTP state object
 * @returns {object} an itinerary object from the OTP plan response, or null if
 *   there is no active search or itinerary
 */

function getActiveSearch (otpState) {
  return otpState.searches.length > otpState.activeSearch && otpState.activeSearch >= 0
    ? otpState.searches[otpState.activeSearch]
    : null
}
export { getActiveSearch }

/**
 * Get the active itinerary for the active search object
 * @param {object} otpState the OTP state object
 * @returns {object} an itinerary object from the OTP plan response, or null if
 *   there is no active search or itinerary
 */

function getActiveItinerary (otpState) {
  const search = getActiveSearch(otpState)
  if (!search || !search.planResponse || !search.planResponse.plan) return null
  const plan = search.planResponse.plan
  return plan.itineraries.length > search.activeItinerary && search.activeItinerary >= 0
    ? plan.itineraries[search.activeItinerary]
    : null
}
export { getActiveItinerary }

/**
 * Determine if the current query has a valid location, including lat/lon
 * @param {object} otpState the OTP state object
 * @param {string} locationKey the location key ('from' or 'to')
 * @returns {boolean}
 */

export function hasValidLocation (otpState, locationKey) {
  return otpState.currentQuery[locationKey] &&
    otpState.currentQuery[locationKey].lat &&
    otpState.currentQuery[locationKey].lon
}

/**
 * Determine if the current query is valid
 * @param {object} otpState the OTP state object
 * @returns {boolean}
 */

export function queryIsValid (otpState) {
  return hasValidLocation(otpState, 'from') &&
    hasValidLocation(otpState, 'from')
    // TODO: add mode validation
    // TODO: add date/time validation
}

function stringToCoords (str) {
  return str && str.split(',').map(c => +c) || []
}

export function planParamsToQuery (params) {
  const query = {}
  for (var key in params) {
    switch (key) {
      case 'fromPlace':
        const from = stringToCoords(params.fromPlace)
        query.from = from.length ? {
          name: coordsToString(from) || null,
          lat: from[0] || null,
          lon: from[1] || null
        } : null
        break
      case 'toPlace':
        const to = stringToCoords(params.toPlace)
        query.to = to.length ? {
          name: coordsToString(to) || null,
          lat: to[0] || null,
          lon: to[1] || null
        } : null
        break
      case 'arriveBy':
        query.departArrive = params.arriveBy === 'true'
          ? 'ARRIVE'
          : params.arriveBy === 'false'
          ? 'DEPART'
          : 'NOW'
        break
      case 'date':
        query.date = params.date || getCurrentDate()
        break
      case 'time':
        query.time = params.time || getCurrentTime()
        break
      default:
        query[key] = params[key]
    }
  }
  return query
}

export function parseStartParams () {

}
