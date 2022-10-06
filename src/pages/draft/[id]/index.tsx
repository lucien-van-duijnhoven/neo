import { trpc } from '../../../utils/trpc';
import { useRouter } from 'next/router';
import { TextInput, FileUploaderItem, FileUploaderButton, FileUploader, FileUploaderDropContainer, Button, TextArea, RadioButtonGroup, RadioButton, FormGroup, Stack } from '@carbon/react';
import { marked } from 'marked';
import { useEffect, useState, useRef, ReactEventHandler } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import { config } from 'process';

enum EditorStates {
    Edit = "edit",
    Preview = "preview"
}

export default function Upload() {
    const router = useRouter();
    const { id } = (router.query);

    const mutateSingedPutLinkConfig = trpc.useMutation('media.getSignedGetLinkConfig');
    const [editorState, setEditorState] = useState<EditorStates>(EditorStates.Edit);

    // title sync start
    const [title, setTitle] = useState<string | null>(null);
    trpc.useQuery(['draft.getTitle', { postId: String(id) }], {
        enabled: title !== null ? false : true,
        onSuccess(data) {
            setTitle(data?.title ?? null);
        },
    });
    const mutateTitle = trpc.useMutation('draft.setTitle');
    useEffect(() => {
        if (title !== null) {
            console.log("title changed");
            mutateTitle.mutateAsync({ postId: String(id), title });
        }
    }, [title]);
    // title sync end

    // markdown sync start
    const [markdown, setMarkdown] = useState<string | null>(null);
    trpc.useQuery(["draft.getArticle", { postId: String(id) }], {
        enabled: markdown !== null ? false : true,
        onSuccess(data) {
            setMarkdown(data?.articleDraft ?? null);
        }
    });
    const mutateArticle = trpc.useMutation("draft.postArticle");
    const [markdownTimerId, setMarkdownTimerId] = useState<number>(0);
    useEffect(() => {
        if (markdown !== null) {
            clearTimeout(markdownTimerId);
            setMarkdownTimerId(window.setTimeout(() => {
                mutateArticle.mutate({ postId: String(id), content: markdown })
            }, 1000));
        }
    }, [markdown]);
    // markdown sync end

    // Config start
    const configUrl = trpc.useQuery(["draft.configUrl", { postId: String(id) }]);
    async function handleConfigUploud(file: File) {
        mutateSingedPutLinkConfig.mutate({ postId: String(id) }, {
            onSuccess: (data) => {
                console.log(file);
                fetch(data.url, {
                    method: 'PUT',
                    body: file,
                }).then(() => {
                    configUrl.refetch();
                })
            }
        });
    }
    // Config end



    // Photo start
    const togglePhotoDeleted = trpc.useMutation('photo.togglePhotoDeleted');
    const mutateSingedPutLinkPhoto = trpc.useMutation("media.getSignedPutLinkPhoto");
    async function handlePhotosUploads(e) {
        const files: Array<File> = e.target.files;
        for (const file of files) {
            await new Promise<void>((resolve, reject) => {
                mutateSingedPutLinkPhoto.mutateAsync({ fileName: file.name, postId: String(id) }, {
                    onSuccess(data, variables, context) {
                        photos.refetch();
                        console.log(`signedLink: ${data}`);
                        console.log(`file: ${file}`);
                        fetch(data.url, {
                            method: 'PUT',
                            body: file,
                        }).then((res) => {
                            photos.refetch();
                            console.log(res);
                        }).catch((err) => {
                            console.error(err);
                        });
                    },
                    onSettled() {
                        resolve();
                    }
                });
            });
        }
    }

    // Photo->Toggle delete start
    const photos = trpc.useQuery(['photo.getPhotos', { postId: String(id) }]);
    const handleTogglePhotoDeleted = (photoId: string) => {
        togglePhotoDeleted.mutate({ photoId: photoId }, {
            onSuccess() {
                photos.refetch();
            }
        });
    }
    // Photo->Toggle delete end
    // Photo end

    const isLoading: boolean = mutateTitle.isLoading || mutateArticle.isLoading;

    useEffect(() => {
        console.log(isLoading);
    }, [isLoading]);

    return (
        <>
            <FormGroup
                legendText="Article"
            >
                <Stack gap={5}>
                    <input value={title ?? ""} type="text" onChange={(e) => { setTitle(e.target.value ?? null) }} />
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
                    <FileUploaderDropContainer onAddFiles={handlePhotosUploads} multiple></FileUploaderDropContainer>
                </Stack>
            </FormGroup>
            <p>slug: {id}</p>
            <button>mutation</button>
            {/* <div>{markdownQuery.data}</div> */}
            {/* {photos.data?.photo.map((photo, index) => {
                return (
                    <>
                        {console.log(photo)}
                        <h3>{photo.name}</h3>
                        <img src={photo.url}></img>
                        <span>{index}</span>
                    </>
                )
            })} */}
            <FileUploaderButton onChange={(e) => { handleConfigUploud(e.target.files[0]) }} textLabel={"Upload"} />
            {configUrl.data?.configUrl ? <a href={configUrl.data.configUrl} download><FileUploaderItem status={"complete"} name="Config" download /></a> : null}
            <PhotoList photos={photos.data ? photos.data : null} handleTogglePhotoDeleted={handleTogglePhotoDeleted} />
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

interface IPhoto {
    photos: {
        photo: {
            id: string;
            name: string;
            url: string;
            deleted: boolean;
        }[] | [];
    } | null;
    handleTogglePhotoDeleted: (id: string) => void;
}

const PhotoList = (props: IPhoto) => {
    const { photos, handleTogglePhotoDeleted } = props;

    if (photos) {
        if (photos.photo.length > 0) {
            return (
                <>
                    <ul className=''>
                        {photos.photo.map(({ id, name, url, deleted }) =>
                            deleted ?
                                <li key={id} className='border-rose-500 border-spacing-2 border-2 flex border-solid bg-red-200 w-full flex-col'>
                                    <span className='truncate line-through'>{name}</span>
                                    <Image className='object-cover' width={100} height={100} src={url} alt={name} />
                                    <div>
                                    <button onClick={() => handleTogglePhotoDeleted(id)}>Delete</button>
                                    <button onClick={() => { navigator.clipboard.writeText(`![${name}](${url} "${name}")`) }}>copy</button>
                                    </div>
                                </li>
                                :
                                <li key={id}>
                                    <h3>{name}</h3>
                                    <Image width={100} height={100} src={url} alt={name} />
                                    <button onClick={() => handleTogglePhotoDeleted(id)}>Delete</button>
                                    <button onClick={() => { navigator.clipboard.writeText(`![${name}](${url} "${name}")`) }}>copy</button>
                                </li>
                        )}
                    </ul>
                </>
            )
        } else {
            return (
                <div>No photos</div>
            )
        }
    } else {
        return (
            <div>Loading...</div>
        )
    }
}

const photoItem = (photo: { id: string, name: string, url: string, deleted: boolean }) => {
    const { id, name, url, deleted } = photo;
    return (
        <div className='border-3'>
            <h3 className={'text-decoration: line-through'}>{name}</h3>
            <Image width={100} height={100} src={url} alt={name} />
            <button onClick={() => handleTogglePhotoDeleted(id)}>Delete</button>
            <button onClick={() => { navigator.clipboard.writeText(`![${name}](${url} "${name}")`) }}>copy</button>
        </div>
    )
}