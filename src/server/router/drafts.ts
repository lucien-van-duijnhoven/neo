import { createProtectedRouter } from "./context";
import { z } from "zod";
import { group, log } from "console";

export const protectedDraftsRouter = createProtectedRouter()
  .mutation("new", {
    async resolve({ ctx }) {
      return ctx.prisma.post.create({
        data: {
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
    },
  })
  .query("getOpenDrafts", {
    input: z.object({
      userId: z.string().nullish(),
    }),
    async resolve({ ctx, input }) {
      if (input.userId) {
        return ctx.prisma.post.findMany({
          where: {
            isDraft: true,
            user: {
              id: input.userId,
            },
          },
          select: {
            id: true,
            titleDraft: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }
    },
  })
  .middleware(async ({ ctx, next, rawInput }) => {
    console.group("middleware");
    if (
      typeof rawInput === "object" &&
      (!("postId" in rawInput) || typeof rawInput.postId !== "string")
    ) {
      throw new Error("No postId provided");
    }
    console.log(rawInput);
    const post = await ctx.prisma.post.findFirst({
      where: {
        user: {
          id: ctx.session.user.id,
        },
        id: rawInput.postId,
      },
      select: {
        id: true,
        isDraft: true,
      },
    });
    if (!post) {
      throw new Error("Post does not belong to user");
    }
    console.log(post);
    if (!post.isDraft) {
      console.log("Post is not a draft");
      const postData = await ctx.prisma.post.findUnique({
        where: {
          id: String(rawInput.postId),
        },
        select: {
          title: true,
          article: true,
        },
      });
      console.log(postData);
      await ctx.prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          isDraft: true,
          titleDraft: postData?.title ?? "",
          articleDraft: postData?.article ?? "",
        },
      });
    }
    console.groupEnd();
    return next();
  })
  .query("getArticle", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
        select: {
          articleDraft: true,
        },
      });
    },
  })
  .mutation("postArticle", {
    input: z.object({
      postId: z.string(),
      content: z.string().nullish(),
    }),
    async resolve({ input, ctx }) {
      if (input.content) {
        return ctx.prisma.post.update({
          where: {
            id: input.postId,
          },
          data: {
            articleDraft: input.content,
          },
        });
      }
    },
  })
  .query("getConfigUrl", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
        select: {
          configUrl: true,
        },
      });
    },
  })
  .query("getTitle", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
        select: {
          titleDraft: true,
        },
      });
    },
  })
  .mutation("setTitle", {
    input: z.object({
      postId: z.string(),
      title: z.string(),
    }),
    async resolve({ input, ctx }) {
      return ctx.prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          titleDraft: input.title,
        },
      });
    },
  })
  .query("getIsPublic", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
        select: {
          isPublic: true,
        },
      });
    },
  })
  .mutation("ToggleIsPublic", {
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
        },
      });
      return ctx.prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          isPublic: post?.isPublic ? !post.isPublic : undefined,
        },
      });
    },
  })
  .query("getIsDraft", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
        select: {
          isDraft: true,
        },
      });
    },
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
        },
      });
      return ctx.prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          isDraft: post?.isDraft ? !post.isDraft : undefined,
        },
      });
    },
  })
  .mutation("removeDraft", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      console.log("removeDraft");
      console.log(input);

      await ctx.prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          isDraft: false,
          articleDraft: "",
          titleDraft: "",
        },
      });
      await ctx.prisma.photo.updateMany({
        data: {
          visibility: false,
        },
        where: {
          post: {
            id: input.postId,
          },
          deleted: true,
        },
      });
    },
  })
  .mutation("createDraft", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
        select: {
          title: true,
          article: true,
        },
      });
      if (post) {
        await ctx.prisma.post.update({
          where: {
            id: input.postId,
          },
          data: {
            isDraft: true,
            titleDraft: post?.title ?? "",
            articleDraft: post?.article ?? "",
          },
        });
      } else {
        throw new Error("Unable to create a draft");
      }
    },
  })

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
          configUrl: true,
        },
      });
      if (!post?.configUrl) {
        return { message: "The post config has not been set." };
      }
      await ctx.prisma.post.update({
        data: {
          isPublic: true,
          isDraft: false,
          article: post?.articleDraft ?? undefined,
          title: post?.titleDraft ?? undefined,
        },
        where: {
          id: input.postId,
        },
      });
      await ctx.prisma.photo.updateMany({
        data: {
          visibility: false,
        },
        where: {
          post: {
            id: input.postId,
          },
          deleted: true,
        },
      });
    },
  })
  .query("HasDraft", {
    input: z.object({
      postId: z.string(),
    }),
    resolve({ ctx }) {
      console.log(ctx);
    },
  });
