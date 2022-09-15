// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedExampleRouter } from "./protected-example-router";
import { z } from "zod";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("auth.", protectedExampleRouter);
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
