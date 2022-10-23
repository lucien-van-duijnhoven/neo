import { trpc } from "../../utils/trpc";
import Router, { useRouter } from "next/router";
import { marked } from "marked";

function Post() {
  const router = useRouter();
  const { id } = router.query;
  const { data: post } = trpc.useQuery(
    ["post.getPost", { postId: String(id) }],
    {
      onSuccess(data) {
        console.log(data);
      },
    }
  );
  function handleEditPost() {
    Router.push(`/draft/${id}`);
  }
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 flex w-full flex-row flex-wrap">
        <button
          onClick={() => Router.push("/")}
          className="cursor-pointer truncate bg-gray-300 p-2"
        >
          Go back
        </button>
        {post?.postOfUser ? (
          <button
            className="grow cursor-pointer truncate bg-emerald-300 p-2"
            onClick={handleEditPost}
          >
            edit
          </button>
        ) : null}
        {post?.prismaData?.configUrl ? (
          <a
            className="flex grow cursor-pointer place-content-center truncate bg-blue-300 p-2"
            href={post?.prismaData?.configUrl}
            download
          >
            Download config
          </a>
        ) : null}
      </div>
      <div className="container m-2 place-self-center p-3">
        <h1 className="truncate text-6xl">{post?.prismaData?.title}</h1>
        <hr className="m-2 border border-solid bg-black pt-1" />
        <div
          dangerouslySetInnerHTML={{
            __html: marked(post?.prismaData?.article ?? ""),
          }}
          className="prose"
        ></div>
      </div>
    </div>
  );
}

export default Post;
