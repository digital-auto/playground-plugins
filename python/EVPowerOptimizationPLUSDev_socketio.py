import socketio
import asyncio
sio = socketio.AsyncClient()
provider_id = "PYTHON-CLIENT-SAMPLE"

async def simulate_run(val):
    global sio
    for i in range(0, 10):
        await asyncio.sleep(1)
        await sio.emit("sent_to_my_clients", {
        "provider_id": "PYTHON-CLIENT-SAMPLE",
        "cmd": val,
        "data": val
        })
    


async def Get_input():
    L=["vehicle.travelleddistance","vehicle.powertrain.tractionbattery.stateofcharge.current", "vehicle.cabin.hvac.station.row1.left.fanspeed","vehicle.cabin.lights.lightintensity","vehicle.cabin.hvac.station.row1.left.temperature","vehicle.cabin.infotainment.media.volume" ]
    try:
        while 1:
            inp = input("Wish value you want to get it ? ").lower()
            while inp not in L : 
                print("Your input incorrect. ")
                inp = input("Wish value you want to get it ? ").lower()

            await sio.emit("sent_to_my_clients", {
            "provider_id": "PYTHON-CLIENT-SAMPLE",
            "cmd": inp,
            "data": inp
            })
            await simulate_run(inp)
    except:
        await connect()


@sio.event
async def connect():
    global sio
    print('connected to server')
    await sio.emit("register_provider", {
        "provider_id": provider_id,
        "inp": "Sample provider async"
    })
    await Get_input()



@sio.event
async def new_request(data):
    global sio
    if data["cmd"] == "result_from_vehicul":
        await sio.emit("sent_to_my_clients", {
            "provider_id": "PYTHON-CLIENT-SAMPLE",
            "cmd": "showTest",
            "data": data["data"]
        })
        try:
            print(data["data"])
            await simulate_run(data["data"])
        except:
            await connect()
        return

    await sio.emit("provider_reply", {
            **data,
            "result": f"cmd {data['cmd']} is not supported"
        })

async def connect_to_server():
    global sio
    await sio.connect('https://bridge.digitalauto.tech')
    await sio.wait()

asyncio.run(connect_to_server())