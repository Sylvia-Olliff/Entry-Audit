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
        db.exec(`SELECT I2GRI35, I2ISOE, I2DC37, I2NDC37, I2CRF34, I2CNI40, I2REL01, I2COMINV, I2IGRWGT, 
          I2BLQIH, I2GRWR, I2BLUIH FROM QS36F.ABIHOL2P WHERE I2BKR#=${self.broker} AND I2FILE=${self.fileNum}`,
          results => {
            if (results.length > 0) {
              const invDetails = {};
              let count = 1;
              results.forEach(result => {
                invDetails[count] = result;
                count++;
              });
              resolve(invDetails);
            } else {
              resolve({ error: 'Invoice Not Found' });
            }
          });
      } catch (err) {
        reject(err);
      }
    });
  };
}
