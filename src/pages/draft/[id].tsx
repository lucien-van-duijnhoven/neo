import { trpc } from '../../utils/trpc';
import { useRouter } from 'next/router';
import { FileUploaderDropContainer, Button, TextArea, RadioButtonGroup, RadioButton, FormGroup, Stack } from '@carbon/react';
import { marked } from 'marked';
import { useEffect, useState, useRef } from 'react';

enum EditorStates {
    Edit = "edit",
    Preview = "preview"
}

export default function Upload() {
    const router = useRouter();
    const { id } = (router.query);

    const photos = trpc.useQuery(['draft.getPhotos', {postId: String(id)}]);
    const mutateSingedPutLink = trpc.useMutation("media.getSignedPutLink");
    const mutateArticle = trpc.useMutation("draft.postArticle");
    const [timerId, setTimerId] = useState<number>(0);
    const isInitialMount = useRef(true);
    const [editorState, setEditorState] = useState<EditorStates>(EditorStates.Edit);
    const [markdown, setMarkdown] = useState<string | null>(null);
    const markdownQueryEnabled = markdown === null ? true : false;
    const { data: markdownQuery, isSuccess: markdownQueryIsSuccess } = trpc.useQuery(["draft.getArticle", { postId: String(id) }], {
        enabled: markdownQueryEnabled,
    });

    async function handleFilesUploads(e) {
        console.log("on files upload");
        console.log(e);
        
        const files: Array<File> = e.target.files;

        console.log(Array(...files));
        
        Array(...files).forEach(file => {
            mutateSingedPutLink.mutate({ fileName: file.name, postId: String(id) }, {
                onSuccess(data, variables, context) {
                    console.log(`signedLink: ${data}`);
                    console.log(`file: ${file}`);
                    fetch(data, {
                        method: 'PUT',
                        body: file,
                    }).then((res) => {
                        console.log(res);
                    }).catch((err) => {
                        console.error(err);
                    });
                }
            });
        });
    }

    useEffect(() => {
        console.log(`markdownQE: ${markdownQueryEnabled}`);
    }, [markdownQueryEnabled]);


    useEffect(() => {
        console.log(`markdown: ${markdown}`);

        if (isInitialMount.current) {
            isInitialMount.current = false;
            // refetch();
        } else {
            console.log("whatuu");
            clearTimeout(timerId);
            if (markdown !== null) {
                setTimerId(window.setTimeout(() => {
                    console.log("aftersome time");
                    console.log(markdown);
                    mutateArticle.mutate({ postId: String(id), content: markdown })
                }, 1000));
            }
        }
    }, [markdown]);

    useEffect(() => {
        if (!markdown && markdownQueryIsSuccess) {
            console.log(`set markdown ${markdownQuery?.articleDraft || null}`);
            setMarkdown(typeof markdownQuery?.articleDraft === "string" ? markdownQuery?.articleDraft : null);
        }
    }, [markdownQuery]);
    // trpc.useQuery(["draft.getArticle", { postId: String(id) }]);
    // const mutation = trpc.useMutation("example.mutation", {
    //     onSuccess(data, variables, context) {
    //         console.log(data);
    //         console.log(variables);
    //         console.log(context);
    //     }
    // });
    return (
        <>
            <FormGroup
                legendText="Article"
            >
                <Stack gap={5}>
                    <RadioButtonGroup
                        defaultSelected={EditorStates.Edit}
                        legend="Group Legend"
                        name="radio-button-group"
                        // valueSelected="default-selected"
                        onChange={setEditorState}
                    >
                        <RadioButton
                            id={EditorStates.Edit}
                            labelText="Edit"
                            value={EditorStates.Edit}
                        />
                        <RadioButton
                            id={EditorStates.Preview}
                            labelText="Preview"
                            value={EditorStates.Preview}
                        />
                    </RadioButtonGroup>
                    <MarkdownEditor markdown={markdown} setMarkdown={setMarkdown} state={editorState}></MarkdownEditor>
                    <FileUploaderDropContainer onAddFiles={handleFilesUploads} multiple></FileUploaderDropContainer>
                </Stack>
            </FormGroup>
            <p>slug: {id}</p>
            <button>mutation</button>
            {/* <div>{markdownQuery.data}</div> */}
        </>
    )
}

interface IProps {
    markdown: string | null;
    setMarkdown: React.Dispatch<React.SetStateAction<string | null>>;
    state: EditorStates;
}

const MarkdownEditor = (props: IProps) => {

    const { markdown, setMarkdown, state } = props;
    if (state === "edit") {
        return (
            <TextArea value={markdown ?? ""} labelText={"Editor"} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setMarkdown(e.target.value) }} disabled={markdown === null ? true : false}></TextArea>
        )
    } else if (state === "preview") {
        return (
            <div dangerouslySetInnerHTML={{ __html: marked(markdown ? markdown : "") }}></div>
        )
    } else {
        return (
            <div>Loading...</div>
        )
    }

}