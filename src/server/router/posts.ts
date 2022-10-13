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
    .query("getConfigUrl", {
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
                    titleDraft: true,
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
                    titleDraft: input.title,
                }
            });
        }
    })
    .query("getPublished", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.post.findFirst({
                where: {
                    id: input.postId,
                },
                select: {
                    isPublic: true,
                }
            });
        }
    })
    .mutation("TogglePublished", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ input, ctx }) {
            const post = await ctx.prisma.post.findFirst({
                where: {
                    id: input.postId,
                },
                select: {
                    isPublic: true,
                }
            });
            return await ctx.prisma.post.update({
                where: {
                    id: input.postId,
                },
                data: {
                    isPublic: post?.isPublic ? !post.isPublic : undefined,
                }
            });
        }
    })
    .query("getIsDraft", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.post.findFirst({
                where: {
                    id: input.postId,
                },
                select: {
                    isDraft: true,
                }
            });
        }
    })
    .mutation("toggleIsDraft", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ input, ctx }) {
            const post = await ctx.prisma.post.findFirst({
                where: {
                    id: input.postId,
                },
                select: {
                    isDraft: true,
                }
            });
            return await ctx.prisma.post.update({
                where: {
                    id: input.postId,
                },
                data: {
                    isDraft: post?.isDraft ? !post.isDraft : undefined,
                }
            });
        }
    })
    .mutation("removeDraft", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ ctx, input }) {
            await ctx.prisma.post.update({
                where: {
                    id: input.postId,
                },
                data: {
                    isDraft: false,
                    articleDraft: "",
                    titleDraft: "",
                }
            })
            await ctx.prisma.photo.updateMany({
                data: {
                    visibility: false,
                },
                where: {
                    post: {
                        id: input.postId,
                    },
                    deleted: true,
                }
            })
        }
    })
    .mutation("createDraft", {
        input: z.object({
            postId: z.string()
        }),
        async resolve({ ctx, input }) {
            const post = await ctx.prisma.post.findUnique({
                where: {
                    id: input.postId,
                },
                select: {
                    title: true,
                    article: true,
                }
            })
            if (post) {
                await ctx.prisma.post.update({
                    where: {
                        id: input.postId,
                    },
                    data: {
                        isDraft: true,
                        titleDraft: post?.title ?? "",
                        articleDraft: post?.article ?? "",
                    }
                })
            } else {
                throw new Error("Unable to create a draft");
            }
        }
    })
    .query("getOpenDrafts", {
        input: z.object({
            userId: z.string().nullish(),
        }),
        async resolve({ ctx, input }) {
            if (input.userId) {
                return await ctx.prisma.post.findMany({
                    where: {
                        isDraft: true,
                        user: {
                            id: input.userId,
                        }
                    },
                    select: {
                        id: true,
                        titleDraft: true,
                        createdAt: true,
                    }
                })
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
    // TODO: protect agains invalid publishes
    .mutation("publish", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ ctx, input }) {
            const post = await ctx.prisma.post.findFirst({
                where: {
                    id: input.postId,
                },
                select: {
                    articleDraft: true,
                    titleDraft: true,
                }
            });
            await ctx.prisma.post.update({
                data: {
                    isPublic: true,
                    isDraft: false,
                    article: post?.articleDraft ?? undefined,
                    title: post?.titleDraft ?? undefined,
                },
                where: {
                    id: input.postId,
                }
            })
            await ctx.prisma.photo.updateMany({
                data: {
                    visibility: false,
                },
                where: {
                    post: {
                        id: input.postId,
                    },
                    deleted: true,
                }
            })
        }
    });
