// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { protectedDraftsRouter } from "./drafts";
import { protectedMediaRouter } from "./media";
import { protectedPhotosRouter } from "./photos";
import { postRouter } from "./post";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("post.draft.", protectedDraftsRouter)
  .merge("post.bucket.", protectedMediaRouter)
  .merge("post.draft.photo.", protectedPhotosRouter)
  .merge("post.", postRouter);
  // .mutation("signedPutLink", {
  //   input: z.object({
  //     fileNames: z.array(z.string()),
  //   }),
  //   async resolve({ input }) {
  //     console.log(input.fileNames);
  //     const links = input.fileNames.map((fileName) => {
  //       let link;
        
  //       console.log(link);
  //       return link;
  //     })
  //     console.log(links);
  //     return links;
      
  //   }
  // });

// export type definition of API
export type AppRouter = typeof appRouter;
