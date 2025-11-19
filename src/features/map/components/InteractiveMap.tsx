import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface MarkerData {
  id: string;
  title: string;
  coordinate: Coordinate;
}

interface InteractiveMapProps {
  markers: MarkerData[];
  userLocation?: Coordinate | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  markers,
  userLocation,
}) => {
  const initialRegion = {
    latitude: userLocation?.latitude || 41.0082,
    longitude: userLocation?.longitude || 28.9784,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={marker.title}
          pinColor="red"
        />
      ))}

      {userLocation && (
        <Marker
          coordinate={userLocation}
          title="You are here"
          pinColor="blue"
        />
      )}
    </MapView>
  );
};
