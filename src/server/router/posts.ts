import { createProtectedRouter } from "./context";
import { z } from "zod";

export const protectedPostsRouter = createProtectedRouter()
    .query("getArticle", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.post.findFirst({
                where: {
                    id: input.postId,
                },
                select: {
                    articleDraft: true,
                }
            });
        }
    })
    .mutation("postArticle", {
        input: z.object({
            postId: z.string(),
            content: z.string().nullish(),
        }),
        async resolve({ input, ctx }) {
            if (input.content) {
                return await ctx.prisma.post.update({
                    where: {
                        id: input.postId,
                    },
                    data: {
                        articleDraft: input.content,
                    }
                });
            }
        }
    })
    .mutation("new", {
        async resolve({ ctx }) {
            return await ctx.prisma.post.create({
                data: {
                    user: {
                        connect: {
                            id: ctx.session.user.id,
                        }
                    }    
                },
                select: {
                    id: true,
                }
            });
        }
    })
    .query("configUrl", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.post.findFirst({
                where: {
                    id: input.postId,
                },
                select: {
                    configUrl: true,
                }
            });
        }
    })
    .query("getTitle", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.post.findFirst({
                where: {
                    id: input.postId,
                },
                select: {
                    title: true,
                }
            });
        }
    })
    .mutation("setTitle", {
        input: z.object({
            postId: z.string(),
            title: z.string(),
        }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.post.update({
                where: {
                    id: input.postId,
                },
                data: {
                    title: input.title,
                }
            });
        }
    })
    