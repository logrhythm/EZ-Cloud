const request = require('supertest');

const app = require('../src/app');

describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .trustLocalhost()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/message/)
      .expect(/version/)
      .end(done);
  });
});

// describe('GET /api/v1/test', () => {
//   it('responds with a json message', (done) => {
//     request(app)
//       .get('/api/v1/test')
//       .trustLocalhost()
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(200, ['👍', '✔'], done);
//   });
// });
