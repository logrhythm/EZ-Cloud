const request = require('supertest');

const app = require('../src/app');

describe('GET /api/v1/oc', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/oc')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - Open Collector - All good'
      }, done);
  });
});

describe('GET /api/v1/oc/CheckOCHelperVersion', () => {
  it('responds with a json message including "version", "detailed" and "full"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckOCHelperVersion')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/version/)
      .expect(/detailed/)
      .expect(/full/)
      .end(done);
  });
});

describe('GET /api/v1/oc/CheckOSVersion', () => {
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc" and "payload"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckOSVersion')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/stillChecking/)
      .expect(/lastSuccessfulCheckTimeStampUtc/)
      .expect(/payload/)
      .expect(/version/)
      .end(done);
  });
});

describe('GET /api/v1/oc/CheckDockerPresence', () => {
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc" and "payload"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckDockerPresence')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/stillChecking/)
      .expect(/lastSuccessfulCheckTimeStampUtc/)
      .expect(/payload/)
      .expect(/presence/)
      .end(done);
  });
});

describe('GET /api/v1/oc/CheckDockerVersion', () => {
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc" and "payload"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckDockerVersion')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/stillChecking/)
      .expect(/lastSuccessfulCheckTimeStampUtc/)
      .expect(/payload/)
      .expect(/version/)
      .end(done);
  });
});

// eslint-disable-next-line func-names
describe('GET /api/v1/oc/CheckOCPresence', function () {
  this.timeout(10000);
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc", "payload", "presence", "lrtclPresent", "lrtclCanRun" and "ocPresent"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckOCPresence')
      .timeout(10000)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/stillChecking/)
      .expect(/lastSuccessfulCheckTimeStampUtc/)
      .expect(/payload/)
      .expect(/presence/)
      .expect(/lrtclPresent/)
      .expect(/lrtclCanRun/)
      .expect(/ocPresent/)
      .end(done);
  });
});

// eslint-disable-next-line func-names
describe('GET /api/v1/oc/CheckOCVersion', function () {
  this.timeout(10000);
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc", "payload" and "version"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckOCVersion')
      .timeout(10000)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/stillChecking/)
      .expect(/lastSuccessfulCheckTimeStampUtc/)
      .expect(/payload/)
      .expect(/version/)
      .end(done);
  });
});

// eslint-disable-next-line func-names
describe('GET /api/v1/oc/CheckOCHealth', function () {
  this.timeout(10000);
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc", "payload" and "health"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckOCHealth')
      .timeout(10000)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/stillChecking/)
      .expect(/lastSuccessfulCheckTimeStampUtc/)
      .expect(/payload/)
      .expect(/health/)
      .end(done);
  });
});

// eslint-disable-next-line func-names
describe('GET /api/v1/oc/ReadOCConfiguration', function () {
  this.timeout(10000);
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc", "payload", "heartbeat:", "timezone:" and "pipelines:"', (done) => {
    request(app)
      .get('/api/v1/oc/ReadOCConfiguration')
      .timeout(10000)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/stillChecking/)
      .expect(/lastSuccessfulCheckTimeStampUtc/)
      .expect(/payload/)
      .expect(/heartbeat:/)
      .expect(/timezone:/)
      .expect(/pipelines:/)
      .end(done);
  });
});

// eslint-disable-next-line func-names
describe('GET /api/v1/oc/ReadOCConfiguration?Raw', function () {
  this.timeout(10000);
  it('responds with a text message including "heartbeat:", "timezone:" and "pipelines:"', (done) => {
    request(app)
      .get('/api/v1/oc/ReadOCConfiguration?Raw')
      .timeout(10000)
      .set('Accept', 'application/json')
      .expect('Content-Type', /text/)
      .expect(200)
      .expect(/heartbeat:/)
      .expect(/timezone:/)
      .expect(/pipelines:/)
      .end(done);
  });
});
