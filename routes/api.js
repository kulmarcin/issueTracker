'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const ProjectModel = require('../models.js').Project;
const IssueModel = require('../models.js').Issue;

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;

      const {
        _id,
        issue_title,
        issue_text,
        created_on,
        updated_on,
        created_by,
        assigned_to,
        open,
        status_text
      } = req.query;

      ProjectModel.aggregate([
        { $match: { name: project } },
        { $unwind: '$issues' },
        _id != undefined
          ? { $match: { 'issues._id': ObjectId(_id) } }
          : { $match: {} },
        issue_title != undefined
          ? { $match: { 'issues.issue_title': issue_title } }
          : { $match: {} },
        issue_text != undefined
          ? { $match: { 'issues.issue_text': issue_text } }
          : { $match: {} },
        open != undefined
          ? { $match: { 'issues.open': open } }
          : { $match: {} },
        created_by != undefined
          ? { $match: { 'issues.created_by': created_by } }
          : { $match: {} },
        assigned_to != undefined
          ? { $match: { 'issues.assigned_to': assigned_to } }
          : { $match: {} },
        status_text != undefined
          ? { $match: { 'issues.status_text': status_text } }
          : { $match: {} }
      ]).exec((err, data) => {
        if (!data) {
          res.json([]);
        } else {
          const mapped = data.map(item => item.issues);
          res.json(mapped);
        }
      });
    })

    .post(function (req, res) {
      let project = req.params.project;

      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: 'required field(s) missing' });
        return;
      }

      const newIssue = new IssueModel({
        issue_title: issue_title || '',
        issue_text: issue_text || '',
        created_by: created_by || '',
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        open: true,
        created_on: new Date(),
        updated_on: new Date()
      });

      ProjectModel.findOne({ name: project }, (err, data) => {
        if (!data) {
          const newProject = new ProjectModel({
            name: project
          });

          newProject.issues.push(newIssue);
          newProject.save((err, data) => {
            if (err || !data) {
              res.send('ERROR');
              console.log(err);
            } else {
              res.json(newIssue);
            }
          });
        } else {
          data.issues.push(newIssue);
          data.save((err, data) => {
            if (err || !data) {
              res.send('ERROR');
            } else {
              res.json(newIssue);
            }
          });
        }
      });
    })

    .put(function (req, res) {
      let project = req.params.project;

      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        open,
        status_text
      } = req.body;

      if (!_id) {
        res.json({ error: 'missing _id' });
        return;
      }

      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !open &&
        !status_text
      ) {
        res.json({ error: 'no update field(s) sent', _id: _id });
        return;
      }

      ProjectModel.findOne({ name: project }, (err, data) => {
        if (err || !data) {
          res.json({ error: 'could not update', _id: _id });
        } else {
          const issueData = data.issues.filter(
            el => ObjectId(el._id).toString() === _id
          )[0];
          console.log(issueData);

          if (!issueData) {
            res.json({ error: 'could not update', _id: _id });
            return;
          }
          issueData.issue_title = issue_title || issueData.issue_title;
          issueData.issue_text = issue_text || issueData.issue_text;
          issueData.created_by = created_by || issueData.created_by;
          issueData.assigned_to = assigned_to || issueData.assigned_to;
          issueData.status_text = status_text || issueData.status_text;
          issueData.updated_on = new Date();
          issueData.open = open;

          data.save((err, saveData) => {
            if (err || !saveData) {
              res.json({ error: 'could not update', _id: _id });
            } else {
              res.json({ result: 'successfully updated', _id: _id });
            }
          });
        }
      });
    })

    .delete(function (req, res) {
      let project = req.params.project;

      const { _id } = req.body;

      if (!_id) {
        res.json({ error: 'missing _id' });
        return;
      }

      ProjectModel.findOne({ name: project }, (err, data) => {
        if (!data || err) {
          res.json({ error: 'could not delete', _id: _id });
        } else {
          const issueData = data.issues.filter(
            el => ObjectId(el._id).toString() === _id
          )[0];

          if (!issueData) {
            res.json({ error: 'could not delete', _id: _id });
            return;
          }
          issueData.remove();

          data.save((err, savedData) => {
            if (!savedData || err) {
              res.json({ error: 'could not delete', _id: _id });
            } else {
              res.json({ result: 'successfully deleted', _id: _id });
            }
          });
        }
      });
    });
};
