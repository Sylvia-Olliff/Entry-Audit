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
    
        db.exec(`SELECT I3ICNT, I3CO, I3TCNT, I3TSU41, I3SPIP1, I3SPIS1, I3SPIC1, I3RATE, I3TSV42, I3QTY44, I3QTY45,
          I3QTY46, I3OA1, I3TSUS#2 as HTS2, I3SPIP2, I3SPIS2, I3SPIC2, I3RATE2, I3TSVA2, I3QTY54, 
          I3QTY55, I3QTY56, I3OA2, I3TSUS#3 as HTS3, I3SPIP3, I3SPIS3, I3SPIC3, I3RATE3, I3TSVA3, 
          I3QTY64, I3QTY65, I3QTY66, I3OA3, I3YIELD, I3FEEEXP, I3VISA# as VISANUM, I3CVDCS# as CVDCASE, 
          I3CVDRAT, I3ADDCS# as ADDCASE, I3ADDRAT, I3LINWGT, I3CHGNDC, I3CHGDC, I3CHG48, HOL3.I3MID#1 as MFG,
          (SELECT TRIM(NAMMF) || TRIM(NAM2MF) || ',' || TRIM(STRMF) || TRIM(STR2MF) || ',' || TRIM(CTYMF) || ',' || TRIM(ZIPMF) || ',' || TRIM(COM1F) || TRIM(COM2F) FROM QS36F.SYSMIDCP WHERE MIDMF=HOL3.I3MID#1 AND STATUS<>'B') as MFG_DATA,
          (SELECT I0OISO FROM QS36F.ABIHOL0P WHERE I0BKR#=${self.broker} AND I0FILE=${self.fileNum}) as I0OISO,
          (SELECT I0EISO FROM QS36F.ABIHOL0P WHERE I0BKR#=${self.broker} AND I0FILE=${self.fileNum}) as I0EISO,
          I3COE, I3MIDF FROM QS36F.ABIHOL3P as HOL3 WHERE I3BKR#=${self.broker} AND I3FILE=${self.fileNum}`,
          results => {
            if (results.length > 0) {
              const lineItems = {};
              let count = 1;
              results.forEach(result => {
                let MFGDataSet = result.MFG_DATA.split(',');
                lineItems[count] = result;
                lineItems[count].MFG = {
                  MID: result.MFG,
                  NAME: MFGDataSet[0],
                  STREET: MFGDataSet[1],
                  CITY: MFGDataSet[2],
                  ZIP: MFGDataSet[3],
                  COMMENTS: MFGDataSet[4]
                };
                count++;
              });
              resolve(lineItems);
            } else {
              resolve({ error: 'Line Items not found' });
            }
          });
      } catch (err) {
        reject(err);
      }
    });
  };
}
