'use strict';

import Promise from 'bluebird';
import moment from 'moment';
import db from '/QOpenSys/QIBM/ProdData/OPS/Node4/os400/db2i/lib/db2';

export default function (parms) {
  const self = this;
  self.broker = parms.broker;
  self.fileNum = parms.fileNum;

  self.run = () => {
    return new Promise((resolve, reject) => {
      db.init();
      db.conn('*LOCAL');
      db.exec(`SELECT I0ISTAT, I0TYPEE, I0LIVE, I0GOODFS, I0MID#, TRIM(I0MID#) as MFG_Seller, I0OISO, I0DAT8, 
      I0MIDF, I0EISO, I0DUEDA8, I0SEB, I0BTYPE, I0MOTN, I0ESTDO8, I0ENTNUM, CIDDCUS, CIDDNAME 
      FROM QS36F.ABIHOL0P 
      JOIN QS36F.CUSCIDDP ON I0IOR06 = CIDDCUS and I0BKR# = CIDDBKR
      WHERE I0BKR#=${parms.broker} AND I0FILE=${parms.fileNum}`, results => {
        console.log('test test test');
        console.log(results);
        if (results[0]) {
          results = results[0];
          if (results.MFG_SELLER) {
            db.conn('*LOCAL');
            db.exec(`SELECT NAMMF, NAM2MF, STRMF, STR2MF, CTYMF, ZIPMF, COM1F, COM2F FROM QS36F.SYSMIDCP WHERE MIDMF='${results.MFG_SELLER}' AND STATUS <> 'B'`,
              MIDData => {
                MIDData = MIDData[0];
                const fileLevel = Object.assign({ FILE: self.fileNum }, results);
                fileLevel.HASHEAD = true;
                fileLevel.I0DATE = moment(fileLevel.I0DAT8, 'YYYYMMDD').format('MM/DD/YYYY');
                fileLevel.I0DUEDAT = moment(fileLevel.I0DUEDA8, 'YYYYMMDD').format('MM/DD/YYYY');
                fileLevel.I0ESTDOA = moment(fileLevel.I0ESTDO8, 'YYYYMMDD').format('MM/DD/YYYY');
                fileLevel.MFG_Seller = {
                  MID: fileLevel.MFG_SELLER,
                  NAME: `${MIDData.NAMMF.trim()}, ${MIDData.NAM2MF.trim()}`,
                  STREET: `${MIDData.STRMF.trim()}, ${MIDData.STR2MF.trim()}`,
                  CITY: MIDData.CTYMF.trim(),
                  ZIP: MIDData.ZIPMF.trim(),
                  COMMENTS: `${MIDData.COM1F.trim()}, ${MIDData.COM2F.trim()}`
                };
                resolve(fileLevel);
              });
          } else {
            const fileLevel = Object.assign({ FILE: self.fileNum }, results);
            fileLevel.HASHEAD = false;
            fileLevel.I0DATE = moment(fileLevel.I0DAT8, 'YYYYMMDD').format('MM/DD/YYYY');
            fileLevel.I0DUEDAT = moment(fileLevel.I0DUEDA8, 'YYYYMMDD').format('MM/DD/YYYY');
            fileLevel.I0ESTDOA = moment(fileLevel.I0ESTDO8, 'YYYYMMDD').format('MM/DD/YYYY');
            fileLevel.MFG_Seller = {
              MID: results.MFG_SELLER.trim()
            };
            resolve(fileLevel);
          }
        } else {
          resolve({ error: 'File not found!' });
        }
      });
    });
  };
}
