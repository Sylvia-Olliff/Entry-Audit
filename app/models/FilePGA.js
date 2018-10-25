'use strict';

import Promise from 'bluebird';
import db from '/QOpenSys/QIBM/ProdData/OPS/Node4/os400/db2i/lib/db2';

export default function (parms) {
  const self = this;

  self.broker = parms.broker;
  self.fileNum = parms.fileNum;

  self.run = () => {
    return new Promise((resolve, reject) => {
      try {
        db.init();
        db.conn('*LOCAL');
    
        db.exec(`SELECT P01ICNT, P01TCNT, RTRIM(P01USER) as USER FROM QS36F.IMPPG01P WHERE P01BKR=${self.broker} AND P01FILE=${self.fileNum}`,
        results => {
          let prevUsername = '';
          let currentLine = results[0].P01TCNT;
          let usernames = [];
      
          const pgData = {};
      
          results.forEach(result => {
            if (currentLine !== result.P01TCNT) {
              usernames = [];
              prevUsername = '';
              currentLine = result.P01TCNT;
            }
      
            if (result.USER && result.USER !== prevUsername) {
              prevUsername = result.USER;
              usernames.push(prevUsername);
            }
      
            pgData[result.P01TCNT] = {
              P01TCNT: result.P01TCNT,
              P01USER: usernames
            };
          });
      
          resolve(pgData);
        });
      } catch (err) {
        reject(err);
      }
    });
  };
}
