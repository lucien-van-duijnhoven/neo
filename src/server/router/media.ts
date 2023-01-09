import { createProtectedRouter } from "./context";
import { z } from "zod";
import { log } from "console";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { randomUUID } from "crypto";
import { env } from "process";

const minio = require('minio')

enum Buckets {
    Photo = "photos",
    Configs = "configs",
}

const client = new minio.Client({
    endPoint: '127.0.0.1',
    port: 9001,
    useSSL: false,
    accessKey: env.MINIO_ASSESS_KEY,
    secretKey: env.MINIO_SECRET_KEY
})

export const protectedMediaRouter = createProtectedRouter()
    .mutation("getSignedPutLinkPhoto", {
        input: z.object({
            fileName: z.string(),
            postId: z.string(),
        }),
        // input: z.string(),
        async resolve({ input, ctx }) {
            console.log(input);
            const fileName = input.fileName;
            const randomName = randomUUID();
            const getUrl = `http://127.0.0.1:9000/${Buckets.Photo}/${randomName}`;
            const postUrl = await client.presignedPutObject(Buckets.Photo, randomName);
            const prismaRes = await ctx.prisma.photo.create({
                data: {
                    name: fileName,
                    url: getUrl,
                    post: {
                        connect: {
                            id: input.postId,
                        }
                    }
                }
            });
            console.log(prismaRes);

            return { url: postUrl, name: randomName };
        }
    })
    .mutation("getSignedGetLinkConfig", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ input, ctx }) {
            const randomName = randomUUID();
            const getUrl = `http://127.0.0.1:9000/${Buckets.Configs}/${randomName}`;
            const postUrl = await client.presignedPutObject(Buckets.Configs, randomName);
            await ctx.prisma.post.update({
                where: {
                    id: input.postId,
                },
                data: {
                    configUrl: getUrl,
                }
            });
            return { url: postUrl };
        }
    });
