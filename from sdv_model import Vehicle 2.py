from sdv_model import Vehicle
from browser import timer
from browser import aio
import plugins


EV_Plugin = plugins.get_plugin("EVPowerOptimizationPLUSDev")

vehicle = Vehicle()
# EV_Plugin.load_signals()


async def low_battery_notify():

    current_soc = await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.get()

    if current_soc < 30:

        plugins.notifyPhone("The current electric vehicle is low on power, please use the power optimization policy")


def start_with_JS(seconds):
    EV_Plugin.start_simulation(seconds)
    EV_Plugin.notifyPhone("Your car is on the way to the nearest charging station.")

def stop_with_JS():
    EV_Plugin.stop_simulation()
    EV_Plugin.notifyPhone("Congratulations! Arrived!")

await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.subscribe(low_battery_notify)
start_with_JS(10)

# The default running time for this prototype/simulation is the 30s
timer.set_timeout(stop_with_JS, 600000)


# await vehicle.Next.get()
# EV_Plugin.update_simulation()


# def update_signals():
#     print("hi")
#     EV_Plugin.update_simulation()
#     vehicle.Next.get()

# def start_with_python(seconds):
#     timer.set_interval(update_signals, seconds)

