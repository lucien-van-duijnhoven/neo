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
          className="cursor-pointer bg-gray-300 p-2 truncate"
        >
          Go back
        </button>
        {post?.postOfUser ? (
          <button
            className="grow cursor-pointer bg-emerald-300 p-2 truncate"
            onClick={handleEditPost}
          >
            edit
          </button>
        ) : null}
        {post?.prismaData?.configUrl ? (
          <a
            className="grow flex place-content-center cursor-pointer bg-blue-300 p-2 truncate"
            href={post?.prismaData?.configUrl}
            download
          >
            Download config
          </a>
        ) : null}
      </div>
      <div className="m-2 container place-self-center p-3">
        <h1 className="truncate text-6xl">{post?.prismaData?.title}</h1>
        <hr className="border bg-black border-solid pt-1 m-2" />
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
