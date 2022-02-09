const request = require('supertest');

const app = require('../src/app');
const { v4: uuidv4 } = require('uuid');

const pipelineTemplateUid = uuidv4();
const ezPublisherHeaderValue = '33f66b74-7cea-4a0e-b981-249c01ae1138:baac1908-8daf-40e3-952f-f0b17c93fe4c'

function hasNoErrorFieldInBody(res) {
  if ('error' in res.body) throw new Error('endpoint returned an error');
}

describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
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
      .set('EZ-Publisher', ezPublisherHeaderValue)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(hasNoErrorFieldInBody)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      .end(done);
  });
});

describe('GET /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/pipelineTemplates/79af3507-038d-4128-acea-b8e5fd15d3d8')
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(hasNoErrorFieldInBody)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      .end(done);
  });
});

describe('GET /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/pipelineTemplates/00000000-0000-0000-0000-000000000000')
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(hasNoErrorFieldInBody)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      .end(done);
  });
});

describe('GET /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/pipelineTemplates/bogus-malformed-uuid-0000')
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(hasNoErrorFieldInBody)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      .end(done);
  });
});

describe('POST /api/v1/pipelineTemplates/', async () => {
  it('responds with a json message after creating a new Pipeline Template', (done) => {
    request(app)
      .post('/api/v1/pipelineTemplates')
      .send(
        {
          pipelineTemplate: {
            pipelineTemplateUid,
            name: 'Test 1',
            collectionConfiguration: {},
            fieldsMapping: {},
            stats: {}
          }
        }
      )
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(hasNoErrorFieldInBody)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      .expect(/result/)
      .expect((res) => {
        if (!(
          res.body.returned === 0
          && res.body.records.length === 0
          && res.body.result
          && res.body.result.affectedRows === 1
        )) throw new Error('endpoint did not create the Pipeline Template');
      })
      .end(done);
  });
});

describe('GET /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message with the newly created Pipeline Template', (done) => {
    request(app)
      .get(`/api/v1/pipelineTemplates/${pipelineTemplateUid}`)
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(hasNoErrorFieldInBody)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      .expect((res) => {
        if (!(
          res.body.returned === 1
          && res.body.records.length >= 1
          && res.body.records[0].uid === pipelineTemplateUid
          && res.body.records[0].name === 'Test 1'
        )) throw new Error('endpoint did not return the right Pipeline Template');
      })
      .end(done);
  });
});

describe('POST /api/v1/pipelineTemplates/', async () => {
  it('responds with a json message with an error message containing "ER_DUP_ENTRY"', (done) => {
    request(app)
      .post('/api/v1/pipelineTemplates')
      .send(
        {
          pipelineTemplate: {
            pipelineTemplateUid,
            name: 'Test 1',
            collectionConfiguration: {},
            fieldsMapping: {},
            stats: {}
          }
        }
      )
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
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
      .expect(/error/)
      .expect((res) => {
        if (!(
          res.body.returned === 0
          && res.body.records.length === 0
          && res.body.error
          && res.body.error.includes('ER_DUP_ENTRY')
        )) throw new Error('endpoint did not return an "ER_DUP_ENTRY" error');
      })
      .end(done);
  });
});

describe('PUT /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message after updating an existing Pipeline Template', (done) => {
    request(app)
      .put(`/api/v1/pipelineTemplates/${pipelineTemplateUid}`)
      .send(
        {
          pipelineTemplate: {
            pipelineTemplateUid,
            name: 'Test 2',
            collectionConfiguration: {},
            fieldsMapping: {},
            stats: {}
          }
        }
      )
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(hasNoErrorFieldInBody)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      .expect(/result/)
      .expect((res) => {
        if (!(
          res.body.returned === 0
          && res.body.records.length === 0
          && res.body.result
          && res.body.result.affectedRows === 1
        )) throw new Error('endpoint did not update the Pipeline Template');
      })
      .end(done);
  });
});

describe('GET /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message with the newly updated Pipeline Template', (done) => {
    request(app)
      .get(`/api/v1/pipelineTemplates/${pipelineTemplateUid}`)
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(hasNoErrorFieldInBody)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      .expect((res) => {
        if (!(
          res.body.returned === 1
          && res.body.records.length >= 1
          && res.body.records[0].uid === pipelineTemplateUid
          && res.body.records[0].name === 'Test 2'
        )) throw new Error('endpoint did not return the updated Pipeline Template');
      })
      .end(done);
  });
});

describe('PUT /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message with an error message containing "UID mismatch"', (done) => {
    request(app)
      .put(`/api/v1/pipelineTemplates/${uuidv4()}`)
      .send(
        {
          pipelineTemplate: {
            pipelineTemplateUid,
            name: 'Test 1',
            collectionConfiguration: {},
            fieldsMapping: {},
            stats: {}
          }
        }
      )
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
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
      .expect(/error/)
      .expect((res) => {
        if (!(
          res.body.returned === 0
          && res.body.records.length === 0
          && res.body.error
          && res.body.error.includes('UID mismatch')
        )) throw new Error('endpoint did not return an "UID mismatch" error');
      })
      .end(done);
  });
});

describe('PUT /api/v1/pipelineTemplates/{id}', async () => {
  const tempUuid = uuidv4();
  it('responds with a json message with ".result.affectedRows" === 0', (done) => {
    request(app)
      .put(`/api/v1/pipelineTemplates/${tempUuid}`)
      .send(
        {
          pipelineTemplate: {
            pipelineTemplateUid: tempUuid,
            name: 'Test 1',
            collectionConfiguration: {},
            fieldsMapping: {},
            stats: {}
          }
        }
      )
      .trustLocalhost()
      .set('EZ-Publisher', ezPublisherHeaderValue)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(hasNoErrorFieldInBody)
      .expect(/action/)
      .expect(/description/)
      .expect(/pageSize/)
      .expect(/pageNumber/)
      .expect(/found/)
      .expect(/returned/)
      .expect(/records/)
      .expect((res) => {
        if (!(
          res.body.returned === 0
          && res.body.records.length === 0
          && res.body.result
          && res.body.result.affectedRows === 0
        )) throw new Error('endpoint did not return .result.affectedRows === 0');
      })
      .end(done);
  });
});
