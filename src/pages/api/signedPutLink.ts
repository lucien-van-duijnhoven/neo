import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextApiRequestQuery } from "next/dist/server/api-utils";

const minio = require('minio')

const client = new minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'testuser',
  secretKey: 'testpassword'
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    client.presignedPutObject('test', req.query.name, (err, url) => {
        if (err) throw err
        console.log(url);
        res.status(200).end(url);
    })
}

export default handler;