import { createProtectedRouter } from "./context";
import { z } from "zod";
import { log } from "console";
import { createNextApiHandler } from "@trpc/server/adapters/next";

const minio = require('minio')

const client = new minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'testuser',
    secretKey: 'testpassword'
})

export const protectedMediaRouter = createProtectedRouter()
    .mutation("getSignedPutLink", {
        input: z.object({
            fileName: z.string(),
            postId: z.string(),
        }),
        // input: z.string(),
        async resolve({ input, ctx }) {
            console.log(input);
            const url = await client.presignedPutObject('test', input.fileName);
            const prismaRes = await ctx.prisma.photo.create({
                data: {
                    name: input.fileName,
                    url: url,
                    post: {
                        connect: {
                            id: input.postId,
                        }
                    }
                }
            });
            console.log(prismaRes);
            
            return url;
        }
    })
