from sdv_model import Vehicle
from browser import timer
from browser import aio
import plugins

EV_Plugin = plugins.get_plugin("EVPowerOptimizationPLUSDev")
vehicle = Vehicle()

plugin.notifyPhone("test")
# plugins.Terminal.reset()

#EV_Plugin.load_signals()

async def get_signal_values():
    EV_Plugin.notifyPhone("Test.")
    global soc
    soc = await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.get()
    return soc


async def run_simulation():
    await get_signal_values()

    if int(soc) > 99:
        EV_Plugin.notifyPhone("Your car is on the way to the nearest charging station.")
    else:
        EV_Plugin.notifyPhone("The current electric vehicle is low on power, please use the power optimization policy")

# def start_with_JS(seconds):

#     EV_Plugin.start_simulation(seconds)
#     #EV_Plugin.notifyPhone("Your car is on the way to the nearest charging station.")

def stop_with_JS():
    EV_Plugin.stop_simulation()
    #EV_Plugin.notifyPhone("Congratulations! Arrived!")

# await vehicle.Speed.subscribe(run_simulation)
await vehicle.Powertrain.TractionBattery.StateOfCharge.Current.subscribe(run_simulation)
EV_Plugin.start_simulation(1000)
# startSuccess = start_with_JS(100)

if startSuccess:
    # The default running time for this prototype/simulation is the 30s
    timer.set_timeout(stop_with_JS, 30000)

