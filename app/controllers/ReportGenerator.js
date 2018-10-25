'use strict';

import FileHeader from '../models/FileHeader';
import FileInvoice from '../models/FileInvoice';
import FileLine from '../models/FileLine';
import FilePGA from '../models/FilePGA';
import PGAHandler from './PGAHandler';
import logger from '../../logger';
import _ from 'underscore';

const pgaHandler = new PGAHandler();

export const viewAll = function (req, res, next) {
  const fileNum = req.body.file;
  const broker = req.body.broker;

  const header = new FileHeader({ broker, fileNum });
  const invoice = new FileInvoice({ broker, fileNum });
  const lines = new FileLine({ broker, fileNum });
  const pga = new FilePGA({ broker, fileNum });

  (async () => {
    try {
      logger.debug('Starting Data Compilation');

      const headerData = await header.run();
      logger.debug('Retrieved Header data');

      const invoiceData = await invoice.run();
      logger.debug('Retrieved Invoice data');

      const linesData = await lines.run();
      logger.debug('Retrieved Lineitem data');

      const pgaData = await pga.run();
      logger.debug('Retrieved Basic PGA data');

      res.locals.viewAll = {
        fileLevel: headerData,
        invoiceDetails: invoiceData,
        lineItems: linesData,
        PGDATA: pgaData
      };
      logger.debug('Completed Data Compilation');
      next();
    } catch (err) {
      logger.log('error', err);
      next();
    }
  })();
};

export const viewPG = function (req, res, next) {
  const fileNum = req.body.file;
  const broker = req.body.broker;
  const invoice = req.body.invoice;
  const line = req.body.line;
  const user = req.body.user;

  (async () => {
    try {
      res.locals.viewPGD = await pgaHandler.getPGFileData({ fileNum, broker, invoice, line, user });
      next();
    } catch (err) {
      logger.log('error', err);
      next();
    }
  })();
};
