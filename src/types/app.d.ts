declare module "app" {
    interface Post {
        article: string;
        config: {
            path: string | null;
        };
        photos: [
            {
                status: "new" | "uploaded" | "deleted";
                path: string;
                name: string;
            }
        ]
    }
}
