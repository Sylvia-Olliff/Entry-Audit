'use strict';

import Promise from 'bluebird';
import db from '/QOpenSys/QIBM/ProdData/OPS/Node4/os400/db2i/lib/db2';
import PartGov from '../models/PartGov';

const pgNumArray = ['01', '02', '04', '05', '06', '07', '08', '10', '13', '14', '17', '18', '19', '20', '21', '22',
  '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '50', '51', '55', '60'];

export default function () {
  const self = this;
  self.pgs = new Map();

  pgNumArray.forEach(num => {
    self.pgs.set(num, new PartGov({ pgNum: num }));
  });

  self.detectPGFiles = (fileData) => {
    return new Promise((resolve, reject) => {
      let queryStr = 'SELECT ';
      self.pgs.forEach(pg => {
        queryStr += pg.getDetectStr(fileData) + ', ';
      });
      queryStr = queryStr.slice(0, -2);

      queryStr += ' FROM SYSIBM.SYSDUMMY1';

      try {
        db.init();
        db.conn('*LOCAL');
        db.exec(queryStr, results => {
          results = results[0];
          const pgList = [];
          // console.log(results);
          const keys = Object.entries(results)
            .filter(([key, value]) => (value > 0))
            .map(([key, value]) => { return key; })
            .sort((itemX, itemY) => {
              if (parseInt(itemX, 10) > parseInt(itemY, 10)) return 1;
              else if (parseInt(itemX, 10) < parseInt(itemY, 10)) return -1;
              else return 0;
            });

          keys.forEach(key => {
            pgList.push(self.pgs.get(key));
          });
          resolve(pgList);
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  self.getPGFileData = async (fileData) => {
    const pgNumList = await self.detectPGFiles(fileData);
    const viewPGD = [];
    db.init();
    let count = 1;
    await pgNumList.forEach(async pgFile => {
      db.conn('*LOCAL');
      viewPGD.push(await pgFile.runQuery(db));
      if (count % 5 === 0) {
        db.close();
        db.init();
      }
      count++;
    });
    db.close();
    return viewPGD;
  };
}
