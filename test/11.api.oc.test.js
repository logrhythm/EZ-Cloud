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

describe('GET /api/v1/oc/CheckOCPresence', () => {
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc", "payload", "presence", "lrtclPresent", "lrtclCanRun" and "ocPresent"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckOCPresence')
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

describe('GET /api/v1/oc/CheckOCVersion', () => {
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc", "payload" and "version"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckOCVersion')
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

describe('GET /api/v1/oc/CheckOCHealth', () => {
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc", "payload" and "health"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckOCHealth')
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

describe('GET /api/v1/oc/ReadOCConfiguration', () => {
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc", "payload", "heartbeat:", "timezone:" and "pipelines:"', (done) => {
    request(app)
      .get('/api/v1/oc/ReadOCConfiguration')
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

describe('GET /api/v1/oc/ReadOCConfiguration?Raw', () => {
  it('responds with a text message including "heartbeat:", "timezone:" and "pipelines:"', (done) => {
    request(app)
      .get('/api/v1/oc/ReadOCConfiguration?Raw')
      .set('Accept', 'application/json')
      .expect('Content-Type', /text/)
      .expect(200)
      .expect(/heartbeat:/)
      .expect(/timezone:/)
      .expect(/pipelines:/)
      .end(done);
  });
});
