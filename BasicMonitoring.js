import SignalPills from "./reusable/SignalPills.js";
import SignalTile from "./reusable/SignalTile.js";
import LineChart from "./reusable/LineChart.js";
import MobileNotifications from "./reusable/MobileNotifications.js";

const plugin = ({ widgets, vehicle, simulator }) => {
  const ETATile = {
    signal: "Vehicle.Cabin.Infotainment.Navigation.DestinationSet.ETA",
    label: "ETA",
    icon: "flag-checkered",
    suffix: "s",
  };

  const Proximity = {
    signal: "Vehicle.Driver.ProximityToVehicle",
    label: "PROX",
    icon: "person",
    suffix: "s",
  };

  widgets.register(
    "Proximity",
    SignalPills(Proximity, vehicle)
  );

  widgets.register(
    "ETATile",
    SignalTile(ETATile, vehicle)
  );

  widgets.register(
    "SpeedLineChart",
    LineChart(
      [
        {
          signal: "Vehicle.Speed",
          suffix: " km/h",
        },
      ],
      vehicle
    )
  );

  widgets.register(
    "TemperatureLineCharts",
    LineChart(
        [
            {
                signal: "Vehicle.Trailer.Chassis.Axle.Row1.Temperature",
                suffix: " C",
                color: "yellow"
            },
            {
                signal: "Vehicle.Trailer.Chassis.Axle.Row2.Temperature",
                suffix: " C",
                color: "#a21caf"
            },
            
            {
                signal: "Vehicle.Trailer.Chassis.Axle.Row2.Wheel.Left.Brake.Temperature",
                suffix: " C",
                color: "#14b8a6"
            },
            {
                signal: "Vehicle.Trailer.Chassis.Axle.Row2.Wheel.Right.Brake.Temperature",
                suffix: " C",
                color: "#a3e635"
            },
            {
                signal: "Vehicle.Trailer.Chassis.Axle.Row1.Wheel.Left.Brake.Temperature",
                suffix: " C",
                color: "#e11d48"
            },
            {
                signal: "Vehicle.Trailer.Chassis.Axle.Row1.Wheel.Right.Brake.Temperature",
                suffix: " C",
                color: "#fca5a5"
            },
        ],
        vehicle
    )
)

  widgets.register(
    "driverscoreLineCharts",
    LineChart(
        [
            {
                signal: "Vehicle.Driver.Trip.CurrentSegment.AccumulatedDriveTime",
                suffix: " C",
                color: "yellow"
            },
            {
                signal: "Vehicle.Driver.Trip.CurrentSegment.AllowedDriveTime",
                suffix: " C",
                color: "#a21caf"
            }
        ],
        vehicle
    )
)

  widgets.register("MobileNotifications", (box) => {
    const {printNotification} = MobileNotifications({box})
    const intervalId = setInterval(async () => {
        const [Frontbrake, Rearbrake] = [
            await vehicle.Trailer.Chassis.Axle.Row1.Temperature.get(),
            await vehicle.Trailer.Chassis.Axle.Row2.Temperature.get()
        ]
        let message = ""
        if (Frontbrake > 21) {
            message += "\nTemperature of front brake exceeding threshold 21C!\n\n"
        }
        if (Rearbrake > 21) {
            message += "Temperature of rear brake exceeding threshold 21C!"
        }
        printNotification(message)
    }, 300)

    const iteratorIntervalidId = setInterval(async () => {
        await vehicle.Next.get()
    }, 3000)
    
    return ( ) => {
        clearInterval(intervalId)
        clearInterval(iteratorIntervalidId)
    }
})

  let mobileNotifications = null;
  widgets.register("Mobile", (box) => {
    const {printNotification} = MobileNotifications({
        apis : null,
        vehicle: null,
        box: box,
        refresh: null,
        backgroundColor: "rgb(0 80 114)"
    })
    mobileNotifications = printNotification;
})
};

export default plugin;
