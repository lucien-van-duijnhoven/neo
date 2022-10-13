import { trpc } from "../../utils/trpc";
import Router, { useRouter } from 'next/router';
import { marked } from 'marked';


function Post() {
    const router = useRouter();
    const { id } = (router.query);
    const { data: post } = trpc.useQuery(["post.getPost", { postId: String(id) }], {
        onSuccess(data) {
            console.log(data);
        },
    });
    function handleEditPost() {
        Router.push(`/draft/${id}`);
    }
    return (
        <div className="flex flex-col bg-gray-200">
            <div className="sticky top-0 flex flex-row flex-wrap justify-end w-full bg-slate-300">
                <a onClick={() => Router.push("/")} className="p-2 bg-gray-300 border-2 border-gray-500 cursor-pointer ">Go back</a>
                {post?.postOfUser ? <button className="cursor-pointer bg-emerald-300 grow" onClick={handleEditPost}>edit</button> : null}
                {post?.prismaData?.configUrl ? <a className="p-2 bg-blue-300 border-2 border-blue-500 cursor-pointer grow " href={post?.prismaData?.configUrl} download>Download config</a> : null}
            </div>
            <div className="max-w-3xl p-3 m-2 border-solid rounded-xl place-self-center grow">
                <h1 className="text-6xl truncate">{post?.prismaData?.title}</h1>
                <p dangerouslySetInnerHTML={{ __html: marked(post?.prismaData?.article ?? "") }} className="max-w-3xl p-3 prose border-2 border-solid rounded-sm place-self-center grow"></p>
            </div>
        </div>
    );
}

export default Post;