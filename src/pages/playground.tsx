import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';

export default function Upload() {
    const router = useRouter();
    const { id } = (router.query)

    // trpc.useQuery(["draft.getArticle", { postId: String(id)}]);
    const mutation = trpc.useMutation("draft.new", {
        onSuccess(data, variables, context) {
            console.log(data);
            console.log(variables);
            console.log(context);
            (router.push("/draft/" + data.id));
        }
    });
    const link = trpc.useMutation("media.getSignedPutLink", {
        onSuccess(data, variables, context) {
            console.log(data);
            console.log(variables);
            console.log(context);
        }
    });
    function handleClick() {
        mutation.mutate();
    }
    function handleLink() {
        ["something", "somethingelse"].forEach((filename) => {
            link.mutate(filename);
        });
    }
    return (
        <>
        <button onClick={handleClick}>new</button>
        <button onClick={handleLink}>test link</button>
        </>
    )
}