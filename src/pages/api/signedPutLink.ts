import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextApiRequestQuery } from "next/dist/server/api-utils";
import { env } from "process";

const minio = require('minio')

const client = new minio.Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: env.MINIO_ROOT_USER,
  secretKey: env.MINIO_ROOT_PASSWORD
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    client.presignedPutObject('test', req.query.name, (err, url) => {
        if (err) throw err
        console.log(url);
        res.status(200).end(url);
    })
}

export default handler;