// Original Callback-Based Code
function fetchUser(id, callback) {
  setTimeout(() => {
    console.log(`Fetched user with ID: ${id}`);
    callback(null, { id, name: 'Muskan' });
  }, 1000);
}

function processUser(user, callback) {
  setTimeout(() => {
    console.log(`Processing user: ${user.name}`);
    callback(null, `User ${user.name} processed`);
  }, 1000);
}

// Callback Hell
fetchUser(101, (err, user) => {
  if (err) return console.error(err);

  processUser(user, (err, result) => {
    if (err) return console.error(err);

    console.log(result);
  });
});


// Refactored Using Promises
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Fetched user with ID: ${id}`);
      resolve({ id, name: 'Muskan' });
    }, 1000);
  });
}

function processUser(user) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Processing user: ${user.name}`);
      resolve(`User ${user.name} processed`);
    }, 1000);
  });
}

fetchUser(101)
  .then(user => processUser(user))
  .then(result => console.log(result))
  .catch(err => console.error(err));


// Refactored Using Async/Await
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Fetched user with ID: ${id}`);
      resolve({ id, name: 'Muskan' });
    }, 1000);
  });
}

function processUser(user) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Processing user: ${user.name}`);
      resolve(`User ${user.name} processed`);
    }, 1000);
  });
}

async function runFlow() {
  try {
    const user = await fetchUser(101);
    const result = await processUser(user);
    console.log(result);
  } catch (err) {
    console.error('Error:', err);
  }
}

runFlow();
