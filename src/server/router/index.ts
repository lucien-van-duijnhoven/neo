// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedExampleRouter } from "./protected-example-router";
import { protectedPostsRouter } from "./posts";
import { protectedMediaRouter } from "./photo";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("auth.", protectedExampleRouter)
  .merge("draft.", protectedPostsRouter)
  .merge("media.", protectedMediaRouter);
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
