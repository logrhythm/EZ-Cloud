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

describe('GET /api/v1/pipelineTemplates', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/pipelineTemplates')
      .trustLocalhost()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      // .expect((res) => Array.isArray(res.body)) // Not working...
      .end(done);
  });
});

describe('GET /api/v1/pipelineTemplates/{id}', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/pipelineTemplates/abc123')
      .trustLocalhost()
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      // .expect((res) => Array.isArray(res.body)) // Not working...
      .end(done);
  });
});
