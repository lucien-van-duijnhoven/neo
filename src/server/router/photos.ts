import { createProtectedRouter } from "./context";
import { z } from "zod";

export const protectedPhotosRouter = createProtectedRouter()
    .query("getPhotos", {
        input: z.object({
            postId: z.string(),
        }),
        async resolve({ input, ctx }) {
            return await ctx.prisma.post.findFirst({
                where: {
                    id: input.postId,
                },
                select: {
                    photo: {
                        select: {
                            id: true,
                            url: true,
                            name: true,
                            deleted: true,
                        },
                        where: {
                            visibility: true,
                        }
                    },
                }
            });
        }
    })
    .mutation("togglePhotoDeleted", {
        input: z.object({
            photoId: z.string(),
        }),
        async resolve({ input, ctx }) {
            const photo = await ctx.prisma.photo.findFirst({
                where: {
                    id: input.photoId,
                },
                select: {
                    deleted: true,
                }
            });
            return await ctx.prisma.photo.update({
                where: {
                    id: input.photoId,
                },
                data: {
                    deleted: {
                        set: photo ? !photo.deleted : undefined,
                    }
                },
            });
        }
    })
    