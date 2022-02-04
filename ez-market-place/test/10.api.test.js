const request = require('supertest');

const app = require('../src/app');

function hasNoErrorFieldInBody(res) {
  if ('error' in res.body) throw new Error('endpoint returned an error');
}

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

describe('GET /api/v1/pipelineTemplates', async () => {
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
      .expect(hasNoErrorFieldInBody)
      .end(done);
  });
});

describe('GET /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/pipelineTemplates/79af3507-038d-4128-acea-b8e5fd15d3d8')
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
      .expect(hasNoErrorFieldInBody)
      .end(done);
  });
});

describe('GET /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/pipelineTemplates/00000000-0000-0000-0000-000000000000')
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
      .expect(hasNoErrorFieldInBody)
      .end(done);
  });
});

describe('GET /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/pipelineTemplates/bogus-malformed-uuid-0000')
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
      .expect(hasNoErrorFieldInBody)
      .end(done);
  });
});
