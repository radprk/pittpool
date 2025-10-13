const faker = require('@faker-js/faker').faker;

let driverCounter = 0;
let riderCounter = 0;
let userCounter = 0;

function generateDriverData(context, events, done) {
  driverCounter++;
  const timestamp = Date.now();
  
  context.vars.name = `Driver ${driverCounter}`;
  context.vars.email = `driver${driverCounter}_${timestamp}@test.com`;
  context.vars.phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  context.vars.password = 'TestPass123';
  
  // Set departure time to 2 hours from now
  const departureDate = new Date();
  departureDate.setHours(departureDate.getHours() + 2);
  context.vars.departureTime = departureDate.toISOString();
  
  return done();
}

function generateRiderData(context, events, done) {
  riderCounter++;
  const timestamp = Date.now();
  
  context.vars.name = `Rider ${riderCounter}`;
  context.vars.email = `rider${riderCounter}_${timestamp}@test.com`;
  context.vars.phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  context.vars.password = 'TestPass123';
  
  // Set desired time to 2 hours from now
  const desiredDate = new Date();
  desiredDate.setHours(desiredDate.getHours() + 2);
  context.vars.desiredTime = desiredDate.toISOString();
  
  return done();
}

function generateUserData(context, events, done) {
  userCounter++;
  const timestamp = Date.now();
  
  context.vars.name = `User ${userCounter}`;
  context.vars.email = `user${userCounter}_${timestamp}@test.com`;
  context.vars.phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  context.vars.password = 'TestPass123';
  
  return done();
}

module.exports = {
  generateDriverData,
  generateRiderData,
  generateUserData
};

