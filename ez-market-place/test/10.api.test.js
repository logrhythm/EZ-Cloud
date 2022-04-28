const path = require('path');
const request = require('supertest');
const { v4: uuidv4 } = require('uuid');

// Define the base directory name of the process
process.env.baseDirname = process.env.baseDirname || path.join(__dirname, '..');

const app = require('../src/app');

const pipelineTemplateUid = uuidv4();
const dummyPublisherUid = '598ab7fb-e324-45bd-9332-20c0aa9e30ac';
const dummyPublisherDisplayName = 'Dummy Automated Test Name';

// const ezPublisherHeaderValue =
// '33f66b74-7cea-4a0e-b981-249c01ae1138:baac1908-8daf-40e3-952f-f0b17c93fe4c';
// 33f66b74-7cea-4a0e-b981-249c01ae1138:baac1908-8daf-40e3-952f-f0b17c93fe4c:2748491
// eslint-disable-next-line max-len
// const encryptedEzPublisherHeaderValue = 'LDiYHGd1w44xVqf17RWncZ3I6IYjfh3R3TVwWerX7j6R6uCKiDipf4W73M/HqOXDZxSaVok6qJWVrXsediAS03N2/WF1G/bAwj5a53qJ349twJ2NkpgMI/sgAE2pIp2plK1dSjN8w2unTa+R37CCK2V1K/+ducTa4dvXWME2hCcduQ8pH2BtHjEoWMZ7OgM7veJ/MnLujFISekLpmNertLYGJUEttazYQhsPEwyr/HzlFgErJgqz+d1nuUh4LXUcYW7kOT1/QUFRsnK+WJD382/hz6gZij5M+kp2GlrQoydhZouZUutVlZwczOXM5L9TlUBrtdoYur8JKXbyu/g0KQ==';

// Dummy UIDs
// 4a261b6e-d0c1-446f-93bd-b0cbfd3cdc8d:598ab7fb-e324-45bd-9332-20c0aa9e30ac:12345
const encryptedEzPublisherHeaderValue = 'cIsHGg9Xy8IxHsZlv5htfkFNnIiHaJ2bnJhz7W5fhSPl7UM4SOUk8P+cD39VfVkTytyudmul7Y/75nYf2X8ycxKO9feeaJl33QI93p+chj84ro6EAFvA4PTuDmQ62Zdmuufc53smRq5BqLh5ceiIY9V4YqDzB/EMpJuR3l4gnrSGhikrwaFh+QBiQxVHqA4Yfl8uailT91IOFYAYDsyNTlbmX29l93oqGkv8TZcTtDj+vbL6GHcIJxJEMPtjW+Okq+FUtwwO9S86FP6nvX8wxcC8hUy2OghHfzcD+qVoD8YPgZgIwkY3vVF3B1H7b3QwjBPxhoixz+/gqhEiob5r+A==';

function hasNoErrorFieldInBody(res) {
  if ('error' in res.body) throw new Error('endpoint returned an error');
}

describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .trustLocalhost()
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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

describe('PUT /api/v1/pipelineTemplates/{id}   (non-existing UID)', async () => {
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
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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

describe('DELETE /api/v1/pipelineTemplates/{id}   (non-existing UID)', async () => {
  const tempUuid = uuidv4();
  it('responds with a json message with ".result.affectedRows" === 0', (done) => {
    request(app)
      .delete(`/api/v1/pipelineTemplates/${tempUuid}`)
      .trustLocalhost()
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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

describe('DELETE /api/v1/pipelineTemplates/{id}', async () => {
  it('responds with a json message with ".result.affectedRows" === 1', (done) => {
    request(app)
      .delete(`/api/v1/pipelineTemplates/${pipelineTemplateUid}`)
      .trustLocalhost()
      .set('EZ-Publisher', encryptedEzPublisherHeaderValue)
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
          && res.body.result.affectedRows === 1
        )) throw new Error('endpoint did not delete the newly updated Pipeline Template');
      })
      .end(done);
  });
});
