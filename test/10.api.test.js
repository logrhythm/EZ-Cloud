const path = require('path');
const request = require('supertest');

// Define the base directory name of the process
process.env.baseDirname = process.env.baseDirname || path.join(__dirname, '..');

const app = require('../src/app');

describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .trustLocalhost()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - All good'
      }, done);
  });
});

describe('GET /api/v1/test', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/test')
      .trustLocalhost()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, ['👍', '✔'], done);
  });
});
