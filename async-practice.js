const globalValue = "I am in the global execution context";

function outer() {
  const outerValue = "I am in outer's execution context";

  function inner() {
    const innerValue = "I am in inner's execution context";
    console.log(globalValue);
    console.log(outerValue);
    console.log(innerValue);
  }

  inner();
}

outer();

function runAsyncPractice() {
  console.log("1. Sync start");

  setTimeout(() => console.log("5. setTimeout (macrotask)"), 0);

  Promise.resolve().then(() => console.log("4. Promise (microtask)"));

  console.log("2. Sync end");
  console.log("3. Call stack is empty, now the event loop runs queued tasks");
}

function showDelayedMessage() {
  setTimeout(() => {
    console.log("Message after 3 seconds");
  }, 3000);
}

function startCountdown(seconds) {
  let remaining = seconds;
  console.log(`Countdown: ${remaining}`);

  const timerId = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      console.log(`Countdown: ${remaining}`);
    } else {
      console.log("Countdown finished");
      clearInterval(timerId);
    }
  }, 1000);
}

function fetchUserWithCallback(callback) {
  setTimeout(() => {
    callback({ id: 1, name: "Rahim" });
  }, 1000);
}

function checkNumber(number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (number > 0) {
        resolve(`${number} is positive`);
      } else {
        reject(new Error(`${number} is not positive`));
      }
    }, 500);
  });
}

function promiseExample() {
  checkNumber(5)
    .then((msg) => console.log("Promise resolved:", msg))
    .catch((err) => console.log("Promise rejected:", err.message));

  checkNumber(-2)
    .then((msg) => console.log("Promise resolved:", msg))
    .catch((err) => console.log("Promise rejected:", err.message));
}

async function asyncAwaitExample() {
  try {
    const positive = await checkNumber(10);
    console.log("Async/Await resolved:", positive);
    const negative = await checkNumber(-10);
    console.log("Async/Await resolved:", negative);
  } catch (err) {
    console.log("Async/Await rejected:", err.message);
  }
}

function runAllPractice() {
  runAsyncPractice();
  showDelayedMessage();
  startCountdown(5);
  fetchUserWithCallback((user) => console.log("Callback received:", user));
  promiseExample();
  asyncAwaitExample();
}

runAllPractice();
