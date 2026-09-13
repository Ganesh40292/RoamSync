import React from 'react';
import GoogleTripMap from './GoogleTripMap';

/**
 * Backwards compatibility wrapper for RouteMapLeaflet.
 * Delegates to GoogleTripMap powered by the Google Maps JavaScript API.
 */
export default function RouteMapLeaflet(props) {
  return <GoogleTripMap {...props} />;
}
