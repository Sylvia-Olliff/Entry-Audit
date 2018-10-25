'use strict';

import Promise from 'bluebird';
import express from 'express';
import logger from '../logger';
import { viewAll as repGen, viewPG as pgGen } from '../app/controllers/ReportGenerator';

export default {
  init (app) {
    return new Promise(resolve => {
      app.use('/css', express.static(`${__dirname}/../views/assets/css/`));
      app.use('/js', express.static(`${__dirname}/../views/assets/js/`));
      app.use('/images', express.static(`${__dirname}/../views/assets/images/`));

      app.get('/', (req, res) => {
        res.render('index.ejs', (err, html) => {
          if (err) {
            logger.error(err);
            res.status(500).send(`<p>There was an error retrieving the Entry Audit Main Page. Please contact Sysop at ext. 351 with this message.</p>`);
          } else res.send(html);
        });
      });

      app.post('/test', (req, res) => {
        res.send(res.locals.report.name);
      });

      app.get('/download/:downID', (req, res) => {
        const fileID = `${req.params.downID}.xlsx`;
        try {
          res.download(`../public/${fileID}`);
        } catch (err) {
          logger.error(err);
          res.status(500).send({ error: err });
        }
      });

      app.post('/viewAll', repGen, (req, res) => {
        const viewAll = res.locals.viewAll;
        logger.debug('Generating html response');
        if (viewAll.fileLevel.error !== undefined) {
          res.send('FILE NOT FOUND');
        } else if (viewAll.errors !== undefined) {
          res.send(viewAll);
        } else {
          res.render(`snippets/view-all`, { viewAll }, (err, html) => {
            if (err) {
              logger.log('error', err);
              res.status(500).send({ error: err });
            } else res.send({ html });
          });
        }
      });

      app.post('/viewPG', pgGen, (req, res) => {
        res.render('snippets/view-pg', { viewPG: res.locals.viewPGD }, (err, html) => {
          if (err) {
            logger.error(err);
            res.status(500).send({ error: err });
          } else res.send({ html });
        });
      });

      resolve(app);
    });
  }
};
