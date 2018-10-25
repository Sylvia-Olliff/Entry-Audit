'use strict';

import Promise from 'bluebird';
// import db from '/QOpenSys/QIBM/ProdData/OPS/Node4/os400/db2i/lib/db2';

export default function (initData) {
  const self = this;

  self.pgNum = initData.pgNum;

  self.getDetectStr = (fileData) => {
    self.broker = fileData.broker;
    self.fileNum = fileData.fileNum;
    self.invoice = fileData.invoice;
    self.line = fileData.line;
    self.user = fileData.user;
    const sqlStr = `(SELECT COUNT(P${self.pgNum}FILE) FROM QS36F.IMPPG${self.pgNum}P WHERE P${self.pgNum}BKR=${self.broker} AND P${self.pgNum}FILE=${self.fileNum} AND P${self.pgNum}ICNT=${self.invoice} AND P${self.pgNum}TCNT=${self.line} AND P${self.pgNum}USER='') as "${self.pgNum}"`;
    // console.log(sqlStr);
    return sqlStr;
  };

  self.runQuery = (db) => {
    return new Promise((resolve, reject) => {
      let queryStr = `SELECT 'PG${self.pgNum}' as PG, `;
      let labels = [];
      try {
        db.exec(`SELECT RTRIM(P00DSPFLD) as FIELD, RTRIM(P00DSCFLD) as DESCRIPTION FROM JOELIB.IMPPG00P WHERE P00FILE = 'IMPPG${self.pgNum}P' ORDER BY P00FILE, P00DISORD`,
          descDetails => {
            // console.log(descDetails);
            Object.entries(descDetails).forEach(([key, value]) => {
              // console.log(`Key: ${key}, Value: ${value}`);
              // console.log(value);
              queryStr += `${value.FIELD}, `;
              labels.push(value.DESCRIPTION);
            });

            queryStr = queryStr.slice(0, -2);

            queryStr += ` FROM QS36F.IMPPG${self.pgNum}P WHERE P${self.pgNum}BKR=${self.broker} AND P${self.pgNum}FILE=${self.fileNum} AND P${self.pgNum}ICNT=${self.invoice} AND P${self.pgNum}TCNT=${self.line} AND P${self.pgNum}USER='${self.user}'`;
            // console.log(queryStr);
            db.exec(queryStr, results => {
              results[results.length] = labels;
              resolve(results);
            });
          });
      } catch (err) {
        reject(err);
      }
    });
  };
}
