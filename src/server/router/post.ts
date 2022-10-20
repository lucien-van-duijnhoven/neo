import { createRouter } from "./context";
import { z } from "zod";
export const postRouter = createRouter()
    .query("getPost", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ ctx, input }) {
            const prismaRes = await ctx.prisma.post.findFirst({
                where: {
                    id: input.postId,
                    isPublic: true,
                },
                select: {
                    id: true,
                    title: true,
                    article: true,
                    configUrl: true,
                }
            })
            return {prismaData: prismaRes, postOfUser: ctx.session ? true : false};
        }
    })
    .query("getPostsList", {
        async resolve({ ctx }) {
            return ctx.prisma.post.findMany({
                where: {
                    isPublic: true,
                },
                select: {
                    id: true,
                    title: true,
                    photo: {
                        select: {
                            url: true,
                        },
                        take: 1,
                    },
                    updatedAt: true,
                    user: {
                        select: {
                            name: true,
                        },
                    },
                }
            })
        }
    })