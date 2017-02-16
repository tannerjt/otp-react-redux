import objectPath from 'object-path'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Map } from 'react-leaflet'

import { setLocation, updateMapState } from '../../actions/map'
import { constructLocation, getItineraryBounds } from '../../util/map'
import { getActiveItinerary, getActiveSearch } from '../../util/state'

class BaseMap extends Component {

  static propTypes = {
    config: PropTypes.object,
    mapClick: PropTypes.func,
    mapState: PropTypes.object,
    setLocation: PropTypes.func // TODO: rename from action name to avoid namespace conflict?
  }
  _onClick = (e) => {
    const location = constructLocation(e.latlng)
    if (!this.props.isFromSet) this.props.setLocation('from', location)
    else if (!this.props.isToSet) this.props.setLocation('to', location)
  }
  // TODO: make map controlled component
  _mapBoundsChanged = (e) => {
    // if (this.state.zoomToTarget) {
    //   setTimeout(() => { this.setState({zoomToTarget: false}) }, 200)
    //   return false
    // } else {
    const zoom = e.target.getZoom()
    const bounds = e.target.getBounds()
    // if (this.props.mapState.zoom !== zoom) {
    //   this.props.updateMapState({zoom})
    // }
    if (!bounds.equals(this.props.mapState.bounds)) {
      this.props.updateMapState({bounds: e.target.getBounds()})
    }
    // }
  }
  componentWillReceiveProps (nextProps) {
    // TODO: maybe setting bounds ought to be handled in map props...
    // Pan to to entire itinerary if made active (clicked)
    if (nextProps.itinerary && nextProps.activeLeg === null) {
      this.refs.map && this.refs.map.leafletElement.fitBounds(getItineraryBounds(nextProps.itinerary), {padding: [3, 3]})
    }
    // Pan to to itinerary step if made active (clicked)
    if (nextProps.itinerary && nextProps.activeLeg !== null && nextProps.activeStep !== null && nextProps.activeStep !== this.props.activeStep) {
      const leg = nextProps.itinerary.legs[nextProps.activeLeg]
      const step = leg.steps[nextProps.activeStep]
      this.refs.map && this.refs.map.leafletElement.panTo([step.lat, step.lon])
    }
    // Pan to to itinerary leg if made active (clicked)
    if (nextProps.itinerary && nextProps.activeLeg !== this.props.activeLeg) {
      this.refs.map && this.refs.map.leafletElement.eachLayer(l => {
        if (objectPath.has(l, 'feature.geometry.index') && l.feature.geometry.index === nextProps.activeLeg) {
          this.refs.map.leafletElement.fitBounds(l.getBounds())
        }
      })
    }
  }
  render () {
    const {
      config,
      children,
      mapState
    } = this.props
    const position = [config.map.initLat, config.map.initLon]
    // const position = [+mapState.lat, +mapState.lon]
    // const zoom = +mapState.zoom
    const zoom = config.map.initZoom || 13
    const bounds = mapState.bounds
    const mapProps = {
      ref: 'map',
      className: 'map',
      // center: position,
      // bounds: mapState.bounds || null,
      // zoom: config.initZoom,
      // zoom: +mapState.zoom,
      onClick: this._onClick,
      // onMoveEnd: this._mapBoundsChanged,
      // onZoomEnd: this._mapBoundsChanged,
    }
    if (bounds) {
      mapProps.bounds = bounds
    } else if (position && zoom) {
      mapProps.center = position
      mapProps.zoom = zoom
    } else {
      console.error('no map position/bounds provided!', {position, zoom, bounds})
    }
    console.log(mapProps)
    return (
      <Map
        {...mapProps}
      >
        {children}
      </Map>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  return {
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    config: state.otp.config,
    mapState: state.otp.mapState,
    isFromSet: state.otp.currentQuery.from && state.otp.currentQuery.from.lat && state.otp.currentQuery.from.lon,
    isToSet: state.otp.currentQuery.to && state.otp.currentQuery.to.lat && state.otp.currentQuery.to.lon,
    itinerary: getActiveItinerary(state.otp)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setLocation: (type, location) => { dispatch(setLocation({ type, location })) },
    updateMapState: (props) => { dispatch(updateMapState(props)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseMap)
