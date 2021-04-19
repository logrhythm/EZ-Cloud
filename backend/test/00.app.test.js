const request = require('supertest');

const app = require('../src/app');

describe('GET /non-existing-file', () => {
  it('responds with a not found message', (done) => {
    request(app)
      .get('/non-existing-file')
      .trustLocalhost()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404, done);
  });
});

describe('GET /', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/test')
      .trustLocalhost()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: '👋 All good mate'
      }, done);
  });
});
