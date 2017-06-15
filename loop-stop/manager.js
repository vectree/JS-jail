"use strict";

module.exports = Object.freeze(LoopStopManager());

/**
 * THE COMMENTS WILL BE HERE AS SOON AS POSSIBLE :)
 *
 * @since 13.06.17
 * @author iretd
 */
function LoopStopManager() {

    //------------------------
    // MILLISECONDS
    //------------------------
    const START_MONITORING_AFTER = 2000;
    const STOP_ALL_MONITORING_TIMEOUT = 5000;
    const MAX_TIME_IN_LOOP_TILL_EXIT = 2200;

    // If we successfully run for X seconds no need to continue
    // to monitor because we know the program isn't locked
    let programNoLongerBeingMonitored = false;
    let programKilledSoStopMonitoring = false;
    let timeOfFirstCallToShouldStopLoop = 0;

    let loopExits = {};
    // Keep track of how long program spends in single loop w/o an exit
    let loopTimers = {};

    let t = {};

    t.shouldStopExecution = shouldStopExecution;
    t.exitedLoop = exitedLoop;

    return t;

    function shouldStopExecution(loopID) {

        let shouldStop = shouldStopLoop(loopID);

        if(shouldStop) {

            // TODO A temporary log.
            console.warn("An infinite loop (or a loop taking too long) was detected, so we stopped its execution. Sorry!");

        }

        return shouldStop;

    }

    function exitedLoop(loopID) {

        loopExits[loopID] = true;

    }

    function shouldStopLoop(loopID) {

        // Once we kill a loop, kill them all, we have an infinite loop and
        // it must be fixed prior to running again.
        if (programKilledSoStopMonitoring) {

            return true;

        }

        // Program exceeded monitor time, we're in the clear
        if (programNoLongerBeingMonitored) {

            return false;

        }

        // If the loopExit already called return
        // It's possible for the program to break out
        if (loopExits[loopID]) {

            return false;

        }

        var now = getTime();

        if (!timeOfFirstCallToShouldStopLoop) {

            timeOfFirstCallToShouldStopLoop = now;

            // first call to shouldStopLoop so just exit already
            return false;

        }

        var programRunningTime = now - timeOfFirstCallToShouldStopLoop;

        // Allow program to run unmolested (yup that's the right word)
        // while it starts up
        if (programRunningTime < START_MONITORING_AFTER) {

            return false;

        }

        // Once the program's run for a satisfactory amount of time
        // we assume it won't lock up and we can simply continue w/o
        // checking for infinite loops
        if (programRunningTime > STOP_ALL_MONITORING_TIMEOUT) {

            programNoLongerBeingMonitored = true;

            return false;

        }

        // Second level shit around new hotness logic
        try {

            checkOnInfiniteLoop(loopID, now);

        } catch(e) {

            programKilledSoStopMonitoring = true;

            return true;

        }

        return false;
    }

    function checkOnInfiniteLoop(loopID, now) {

        if (!loopTimers[loopID]) {

            loopTimers[loopID] = now;

            // We just started the timer for this loop. exit early
            return false;

        }

        let loopRunningTime = now - loopTimers[loopID];

        if (loopRunningTime > MAX_TIME_IN_LOOP_TILL_EXIT) {

            throw "Infinite Loop found on loop: " + loopID;

        }

    }

    function getTime() {

        return +new Date();

    }

}
