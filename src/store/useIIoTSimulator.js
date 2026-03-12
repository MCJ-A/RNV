import { create } from 'zustand';

// Simulated OPC-UA / MQTT Store
export const useIIoTSimulator = create((set, get) => {
    let intervalId = null;

    return {
        machineState: 'PRODUCTION', // 'PRODUCTION', 'SETUP', 'STOPPED', 'ERROR'
        speed: 450, // m/min
        tension: 2.1, // bar
        oee: 82.4, // %
        temperature: 45, // °C

        // Simulates reading tags from an edge device
        startSimulation: () => {
            if (intervalId) return;

            intervalId = setInterval(() => {
                const { machineState, speed, tension, oee, temperature } = get();

                let newSpeed = speed;
                let newTension = tension;

                if (machineState === 'PRODUCTION') {
                    // Add organic noise to metrics
                    newSpeed = Math.max(0, speed + (Math.random() * 10 - 5));
                    newTension = Math.max(0, tension + (Math.random() * 0.2 - 0.1));
                } else if (machineState === 'SETUP') {
                    // Machine is stopped
                    newSpeed = 0;
                    newTension = 0; // Or whatever base setup tension is
                }

                set({
                    speed: Number(newSpeed.toFixed(0)),
                    tension: Number(newTension.toFixed(2)),
                    // Minor OEE drift
                    oee: Number(Math.max(0, Math.min(100, oee + (Math.random() * 0.2 - 0.1))).toFixed(1)),
                    temperature: Number(Math.max(20, temperature + (Math.random() * 0.5 - 0.25)).toFixed(1))
                });
            }, 1000); // Poll every 1 second
        },

        stopSimulation: () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        },

        setMachineState: (newState) => {
            set({ machineState: newState });
        }
    };
});
