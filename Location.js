import SignalPills from "./reusable/SignalPills.js";
import SignalTile from "./reusable/SignalTile.js";
import GoogleMapsFromSignal from "./reusable/GoogleMapsFromSignal.js";

const LocationPlugin = ({ widgets, vehicle }) => {
  const LatitudeTile = {
    signal: "Vehicle.CurrentLocation.Latitude",
    label: "Latitude",
    icon: "satellite",
  };

  const LongitudeTile = {
    signal: "Vehicle.CurrentLocation.Longitude",
    label: "Longitude",
    icon: "satellite",
  };

  widgets.register(
    "LatitudeTile",
    SignalTile(LatitudeTile, vehicle)
  );

  widgets.register(
    "LongitudeTile",
    SignalTile(LongitudeTile, vehicle)
  );

  widgets.register(
    "LatLongPills",
    SignalPills([LatitudeTile, LongitudeTile], vehicle)
  );

  widgets.register(
    "GoogleMapDirections",
    GoogleMapsFromSignal(
      [
        {
          lat: 48.149497,
          lng: 11.523194,
        },
        {
          lat: 50.445168,
          lng: 11.020569,
        },
      ],
      vehicle,
      { iterate: true }
    )
  );
};

export default LocationPlugin;
