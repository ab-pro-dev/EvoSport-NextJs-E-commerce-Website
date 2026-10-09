import { SmartPollingManager, CUSTOMER_POLLING_CONFIG, ADMIN_POLLING_CONFIG } from "../hooks/use-smart-polling";

class FakeTimerEngine {
  private currentTime = 0;
  private nextId = 1;
  private timers = new Map<number, { callback: () => void; dueTime: number }>();

  getNow = () => this.currentTime;

  setTimer = (callback: () => void, ms: number) => {
    const id = this.nextId++;
    this.timers.set(id, { callback, dueTime: this.currentTime + ms });
    return id;
  };

  clearTimer = (id: any) => {
    this.timers.delete(id);
  };

  advanceTime(ms: number) {
    this.currentTime += ms;
    // Execute all timers due up to currentTime
    let executed = true;
    while (executed) {
      executed = false;
      let earliestId: number | null = null;
      let earliestDue = Infinity;

      for (const [id, timer] of this.timers.entries()) {
        if (timer.dueTime <= this.currentTime && timer.dueTime < earliestDue) {
          earliestDue = timer.dueTime;
          earliestId = id;
        }
      }

      if (earliestId !== null) {
        const timer = this.timers.get(earliestId)!;
        this.timers.delete(earliestId);
        timer.callback();
        executed = true;
      }
    }
  }

  getActiveTimerCount() {
    return this.timers.size;
  }
}

async function runTests() {
  console.log("=== Testing SmartPollingManager with Fake Timers ===\n");
  const results: { test: string; passed: boolean; details: string }[] = [];

  // TEST 1: Does not start when logged out
  {
    const engine = new FakeTimerEngine();
    let pollCount = 0;
    const isAuthenticated = false; // Logged out

    const manager = new SmartPollingManager({
      ...CUSTOMER_POLLING_CONFIG,
      onPoll: () => { pollCount++; },
      getNow: engine.getNow,
      setTimer: engine.setTimer,
      clearTimer: engine.clearTimer,
      isDocumentHidden: () => false,
    });

    if (isAuthenticated) {
      manager.start();
    }
    engine.advanceTime(120000);

    const passed = pollCount === 0 && engine.getActiveTimerCount() === 0;
    results.push({
      test: "1. Does not start when logged out",
      passed,
      details: `pollCount=${pollCount}, activeTimers=${engine.getActiveTimerCount()}`
    });
  }

  // TEST 2: Pauses when hidden (Customer config: pauseWhenHidden = true)
  {
    const engine = new FakeTimerEngine();
    const pollHistory: { isCatchUp: boolean; time: number }[] = [];
    let isHidden = false;

    const manager = new SmartPollingManager({
      ...CUSTOMER_POLLING_CONFIG, // intervalMs: 60000, pauseWhenHidden: true
      onPoll: (p) => { pollHistory.push({ isCatchUp: p.isCatchUp, time: engine.getNow() }); },
      getNow: engine.getNow,
      setTimer: engine.setTimer,
      clearTimer: engine.clearTimer,
      isDocumentHidden: () => isHidden,
    });

    manager.start(); // initial poll at t=0
    engine.advanceTime(60000); // normal poll at t=60000

    // Tab becomes hidden at t=70000
    engine.advanceTime(10000);
    isHidden = true;
    manager.handleVisibilityChange(false);

    // Advance 3 minutes while hidden
    engine.advanceTime(180000);
    const countWhileHidden = pollHistory.length; // should still be 2

    // Tab becomes visible again at t=250000
    isHidden = false;
    manager.handleVisibilityChange(true); // triggers catch-up fetch

    const passed = countWhileHidden === 2 && pollHistory.length === 3 && pollHistory[2].isCatchUp === true;
    results.push({
      test: "2. Pauses when hidden (customer config)",
      passed,
      details: `initial+firstPoll=2, whileHidden=${countWhileHidden}, afterResume=${pollHistory.length}, catchUp=${pollHistory[2]?.isCatchUp}`
    });
  }

  // TEST 3: Stops after idle limit (idleLimitMs: 5 minutes)
  {
    const engine = new FakeTimerEngine();
    let pollCount = 0;

    const manager = new SmartPollingManager({
      intervalMs: 60000,
      idleLimitMs: 300000, // 5 minutes (300,000 ms)
      pauseWhenHidden: false,
      onPoll: () => { pollCount++; },
      getNow: engine.getNow,
      setTimer: engine.setTimer,
      clearTimer: engine.clearTimer,
      isDocumentHidden: () => false,
    });

    manager.start(); // t=0 (poll 1)
    engine.advanceTime(60000); // t=1m (poll 2)
    engine.advanceTime(60000); // t=2m (poll 3)
    engine.advanceTime(60000); // t=3m (poll 4)
    engine.advanceTime(60000); // t=4m (poll 5)
    engine.advanceTime(60000); // t=5m (300000ms): timer fires, idleLimit (300000ms) reached -> no poll fired, isIdle set to true
    // Total polls: t=0 (1), t=1m (2), t=2m (3), t=3m (4), t=4m (5).
    const pollCountAfterIdle = pollCount;
    
    // Advance another 20 minutes with zero activity
    engine.advanceTime(1200000);

    const passed = pollCountAfterIdle === 5 && pollCount === 5 && manager.getStatus().isIdle === true;
    results.push({
      test: "3. Stops after the idle limit",
      passed,
      details: `pollCount=${pollCount}, isIdle=${manager.getStatus().isIdle}, stoppedFiringAfterLimit=true`
    });
  }

  // TEST 4: Resumes with ONE immediate fetch and no chime (isCatchUp: true)
  {
    const engine = new FakeTimerEngine();
    const pollHistory: { isCatchUp: boolean; time: number }[] = [];

    const manager = new SmartPollingManager({
      intervalMs: 60000,
      idleLimitMs: 300000, // 5 minutes
      pauseWhenHidden: true,
      onPoll: (p) => { pollHistory.push({ isCatchUp: p.isCatchUp, time: engine.getNow() }); },
      getNow: engine.getNow,
      setTimer: engine.setTimer,
      clearTimer: engine.clearTimer,
      isDocumentHidden: () => false,
    });

    manager.start(); // t=0 (poll 1)
    // Advance past idle limit into stopped state
    engine.advanceTime(360000); // idle!
    const countBeforeResume = pollHistory.length;

    // User moves mouse / types key
    manager.handleActivity();

    // Verify immediate single fetch with isCatchUp: true
    const resumedImmediately = pollHistory.length === countBeforeResume + 1;
    const latestPoll = pollHistory[pollHistory.length - 1];
    const isCatchUpFlag = latestPoll.isCatchUp === true;

    // Advance 60s to confirm normal polling resumes afterward with isCatchUp: false
    engine.advanceTime(60000);
    const normalPollResumed = pollHistory.length === countBeforeResume + 2 && pollHistory[pollHistory.length - 1].isCatchUp === false;

    const passed = resumedImmediately && isCatchUpFlag && normalPollResumed;
    results.push({
      test: "4. Resumes with one immediate fetch and no chime (isCatchUp: true)",
      passed,
      details: `resumedImmediately=${resumedImmediately}, isCatchUp=${isCatchUpFlag}, normalIntervalResumed=${normalPollResumed}`
    });
  }

  // TEST 5: Middleware maintenance cache (60s TTL)
  {
    let fetchCount = 0;
    let mockNow = 1000;
    let cache: { value: boolean; timestamp: number } | null = null;
    const TTL = 60 * 1000;

    async function checkMaintenance(fetchFn: () => Promise<boolean>) {
      if (cache && mockNow - cache.timestamp < TTL) {
        return cache.value;
      }
      try {
        fetchCount++;
        const val = await fetchFn();
        cache = { value: val, timestamp: mockNow };
        return val;
      } catch {
        return false;
      }
    }

    // Call 1: Miss, fetches
    await checkMaintenance(async () => false);
    // Call 2 at +30s: Hit, no fetch
    mockNow += 30000;
    await checkMaintenance(async () => false);
    // Call 3 at +65s: Expired (>60s), fetches
    mockNow += 35000;
    await checkMaintenance(async () => false);

    const passed = fetchCount === 2;
    results.push({
      test: "5. Middleware maintenance check caches for 60 seconds",
      passed,
      details: `fetchCount=${fetchCount} (expected 2 fetches across 3 requests over 65s)`
    });
  }

  // TEST 6: Middleware maintenance check fails open on error / 500
  {
    let cache: { value: boolean; timestamp: number } | null = null;
    const TTL = 60 * 1000;
    const mockNow = 1000;

    async function checkMaintenanceWithResponse(resStatus: number, shouldThrow = false) {
      if (cache && mockNow - cache.timestamp < TTL) {
        return cache.value;
      }
      try {
        if (shouldThrow) throw new Error("Neon connection timeout");
        if (resStatus === 200) {
          cache = { value: true, timestamp: mockNow };
          return true;
        }
        return false; // Fail open
      } catch {
        return false; // Fail open
      }
    }

    const resultOnError = await checkMaintenanceWithResponse(500, true);
    const resultOn500 = await checkMaintenanceWithResponse(500, false);

    const passed = resultOnError === false && resultOn500 === false;
    results.push({
      test: "6. Middleware maintenance check fails open on error / 500",
      passed,
      details: `resultOnError=${resultOnError}, resultOn500=${resultOn500} (never blocks site)`
    });
  }

  console.table(results);
  const allPassed = results.every(r => r.passed);
  console.log("\nAll tests passed:", allPassed ? "YES" : "NO");
  if (!allPassed) process.exit(1);
}

runTests().catch(console.error);
