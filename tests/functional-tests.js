const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  test('create an issue with every field', done => {
    chai
      .request(server)
      .post('/api/issues/project')
      .set('content-type', 'application/json')
      .send({
        issue_title: 'Issue',
        issue_text: 'Functional Test',
        created_by: 'Marcin',
        assigned_to: 'test',
        status_text: 'Not done'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Issue');
        assert.equal(res.body.issue_text, 'Functional Test');
        assert.equal(res.body.created_by, 'Marcin');
        assert.equal(res.body.assigned_to, 'test');
        assert.equal(res.body.status_text, 'Not done');
        done();
      });
  });
  test('created an issue with only required fields', done => {
    chai
      .request(server)
      .post('/api/issues/project')
      .set('content-type', 'application/json')
      .send({
        issue_title: 'Issue',
        issue_text: 'Functional Test',
        created_by: 'Marcin',
        assigned_to: '',
        status_text: ''
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Issue');
        assert.equal(res.body.issue_text, 'Functional Test');
        assert.equal(res.body.created_by, 'Marcin');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        done();
      });
  });
  test('Create an issue with missing required fields', done => {
    chai
      .request(server)
      .post('/api/issues/project')
      .set('content-type', 'application/json')
      .send({
        issue_title: '',
        issue_text: '',
        created_by: '',
        assigned_to: 'Marcin',
        status_text: 'hehe'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });
  test('View issues on a project', done => {
    chai
      .request(server)
      .get('/api/issues/project')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        done();
      });
  });
  test('View issues on a project with one filter', done => {
    chai
      .request(server)
      .get('/api/issues/test')
      .query({ _id: '61c9f15e10784a7df5c30df2' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body[0], {
          _id: '61c9f15e10784a7df5c30df2',
          issue_text: 'someTest',
          issue_title: 'test123',
          assigned_to: 'TEST',
          created_by: 'FunctionalTest',
          created_on: '2021-11-30T23:00:00.000Z',
          status_text: 'inTesting'
        });
        done();
      });
  });
  test('View issues on a project with multiple filters', done => {
    chai
      .request(server)
      .get('/api/issues/test')
      .query({ issue_title: 'test123', issue_text: 'someTest' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body[0], {
          _id: '61c9f15e10784a7df5c30df2',
          issue_text: 'someTest',
          issue_title: 'test123',
          assigned_to: 'TEST',
          created_by: 'FunctionalTest',
          created_on: '2021-11-30T23:00:00.000Z',
          status_text: 'inTesting'
        });
        done();
      });
  });

  test('Update one field on an issue', done => {
    chai
      .request(server)
      .put('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ _id: '61c9f15e10784a7df5c30df2', issue_title: 'anotherTest' })
      .end((err, res) => {
        if (err) {
          done(err);
        }
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, '61c9f15e10784a7df5c30df2');
        done();
      });
  });

  test('Update multiple fields on an issue', done => {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        _id: '61c9f15e10784a7df5c30df2',
        issue_title: 'anotherTest2',
        issue_text: 'anotherTestHere'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, '61c9f15e10784a7df5c30df2');
        done();
      });
  });

  test('Update an issue with missing _id', done => {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({ issue_title: 'anotherTest2' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update', done => {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({ _id: '61c9f15e10784a7df5c30df2' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('Update an issue with an invalid _id', done => {
    chai
      .request(server)
      .put('/api/issues/test')
      .send({
        _id: '123',
        issue_title: 'anotherTest2',
        issue_text: 'anotherTestHere'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete an issue', done => {
    chai
      .request(server)
      .delete('/api/issues/test')
      .send({ _id: '61c9f15e10784a7df5c30df2' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  test('Delete an issue with an invalid _id', done => {
    chai
      .request(server)
      .delete('/api/issues/test')
      .send({ _id: '123' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('Delete an issue with missing _id', done => {
    chai
      .request(server)
      .delete('/api/issues/test')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
