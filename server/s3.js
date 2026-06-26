import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export async function getFiles() {
  console.log('getting', process.env.S3_WEB_ROOT);
  const xmlString = await axios.get(process.env.S3_WEB_ROOT).then((res) => res.data);
  const xmlData = await parseStringPromise(xmlString);

  return xmlData.ListBucketResult.Contents.map((c) => c.Key[0])
    .filter((key) => key.startsWith && key.startsWith('video/'))
    .map((key) => `${process.env.S3_WEB_ROOT}${key}`);
}
