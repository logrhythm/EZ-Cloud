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
      .end(done);
  });
});

describe('GET /api/v1/oc/CheckOCPresence', () => {
  it('responds with a json message including "stillChecking", "lastSuccessfulCheckTimeStampUtc", "payload", "lrtclPresent", "lrtclCanRun" and "ocPresent"', (done) => {
    request(app)
      .get('/api/v1/oc/CheckOCPresence')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/stillChecking/)
      .expect(/lastSuccessfulCheckTimeStampUtc/)
      .expect(/payload/)
      .expect(/lrtclPresent/)
      .expect(/lrtclCanRun/)
      .expect(/ocPresent/)
      // .expect(/ocVersion/)
      // .expect(/ocStatus/)
      .end(done);
  });
});
