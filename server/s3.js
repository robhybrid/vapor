const axios = require('axios');
const path = require('path');
const xml2js = require('xml2js');
const util = require('util');

const parseXML = util.promisify(xml2js.parseString);

getFiles = async () => {
  console.log('getting', process.env.S3_WEB_ROOT);
  const xmlString = await axios.get(process.env.S3_WEB_ROOT)
    .then(res => res.data);
  const xmlData = await parseXML(xmlString);

  const urls = xmlData.ListBucketResult.Contents
    .map(c => c.Key[0])
    .filter(key => key.startsWith && key.startsWith('video/') )
    .map(key => `${process.env.S3_WEB_ROOT}${key}`);
  return urls;
};

module.exports.getFiles = getFiles;