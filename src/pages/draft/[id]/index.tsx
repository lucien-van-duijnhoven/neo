import { trpc } from '../../../utils/trpc';
import Router, { useRouter } from 'next/router';
import { ButtonSet, TextInput, FileUploaderItem, FileUploaderButton, FileUploader, FileUploaderDropContainer, Button, TextArea, RadioButtonGroup, RadioButton, FormGroup, Stack } from '@carbon/react';
import { marked } from 'marked';
import React, { useEffect, useState, useRef, ReactEventHandler } from 'react';
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

    const mutateSingedPutLinkConfig = trpc.useMutation('post.bucket.getSignedGetLinkConfig');
    const [editorState, setEditorState] = useState<EditorStates>(EditorStates.Edit);

    // title sync start
    const [title, setTitle] = useState<string | null>(null);
    trpc.useQuery(['post.draft.getTitle', { postId: String(id) }], {
        enabled: title !== null ? false : true,
        onSuccess(data) {
            setTitle(data?.titleDraft ?? null);
        },
    });
    const mutateTitle = trpc.useMutation('post.draft.setTitle');
    const [titleTimerID, setTitleTimerID] = useState<number>(0);
    useEffect(() => {
        if (title !== null) {
            clearTimeout(titleTimerID);
            setTitleTimerID(window.setTimeout(() => {
                mutateTitle.mutate({ postId: String(id), title });
            }, 1000));
            // mutateTitle.mutateAsync({ postId: String(id), title });
        }
    }, [title]);
    // title sync end

    // markdown sync start
    const [markdown, setMarkdown] = useState<string | null>(null);
    trpc.useQuery(["post.draft.getArticle", { postId: String(id) }], {
        enabled: markdown !== null ? false : true,
        onSuccess(data) {
            setMarkdown(data?.articleDraft ?? null);
        }
    });
    const mutateArticle = trpc.useMutation("post.draft.postArticle");
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
    const configUrl = trpc.useQuery(["post.draft.getConfigUrl", { postId: String(id) }]);
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
    const togglePhotoDeleted = trpc.useMutation('post.draft.photo.togglePhotoDeleted');
    const mutateSingedPutLinkPhoto = trpc.useMutation("post.bucket.getSignedPutLinkPhoto");
    async function handlePhotosUploads(e: any) {
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
    const photos = trpc.useQuery(['post.draft.photo.getPhotos', { postId: String(id) }]);
    const handleTogglePhotoDeleted = (photoId: string) => {
        togglePhotoDeleted.mutate({ photoId: photoId }, {
            onSuccess() {
                photos.refetch();
            }
        });
    }
    // Photo->Toggle delete end
    // Photo end

    // Publish start
    const mutatePublish = trpc.useMutation('post.draft.publish');
    const handlePublish = () => {
        mutatePublish.mutate({ postId: String(id) }, {
            onSuccess() {
                Router.push(`/${id}`);
            }
        });
    }
    // Publish end

    // Cancel start
    function handleCancel() {
        Router.push(`/`);
    }
    // Cancel end

    const isLoading: boolean = mutateTitle.isLoading || mutateArticle.isLoading;

    useEffect(() => {
        console.log(isLoading);
    }, [isLoading]);

    return (
        <>
            <div className='flex flex-col w-full md:flex-row'>
                <div
                    className='flex flex-col w-full'
                >
                    <Stack gap={5} className='p-2 w-fill'>
                        {editorState === EditorStates.Edit ? <TextInput placeholder='title' value={title ?? ""} onChange={(e) => { setTitle(e.target.value ?? null) }} disabled={title === null ? true : false} /> : null}
                        <RadioButtonGroup
                            defaultSelected={EditorStates.Edit}
                            legend="Group Legend"
                            name="radio-button-group"
                            onChange={setEditorState}
                            className={editorState === EditorStates.Edit ? 'justify-self-start' : 'justify-self-center'}
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
                        {editorState === EditorStates.Edit ?
                            <div>
                                <FileUploaderButton onChange={(e: any) => { handleConfigUploud(e.target.files[0]) }} textLabel={"Upload"} />
                                {configUrl.data?.configUrl ? <a href={configUrl.data.configUrl} download><FileUploaderItem status={"complete"} name="Config" download /></a> : null}
                            </div>
                            :
                            null}
                        <div className={"w-full max-w-xl" + ` ${editorState === EditorStates.Edit ? "justify-self-start" : "justify-self-center"}`}>
                            <button className="w-1/2 bg-transparent text-zinc-700 h-11 hover:bg-gray-600 hover:text-white" onClick={handleCancel}>Cancel</button>
                            <button onClick={handlePublish} className="w-1/2 bg-transparent text-zinc-700 h-11 hover:bg-blue-600 hover:text-white">Publish</button>
                        </div>
                    </Stack>
                </div>
                {editorState === EditorStates.Edit ?
                    <div className='flex flex-col flex-wrap w-full p-3 md:p-0 md:w-64'>
                        {/* <PhotosSideBar photos={photos.data ? photos.data : null} handleTogglePhotoDeleted={handleTogglePhotoDeleted} handlePhotosUploads={handlePhotosUploads} /> */}
                        <input title='photos' placeholder='photos' className='block w-full h-20 bg-transparent border-2 border-blue-400 border-dashed cursor-pointer hover:border-solid file:underline border-1 file:border-0 file:bg-transparent file:mt-6 file:ml-8 file:text-blue-300' type="file" onChange={handlePhotosUploads} multiple />
                        {photos.isLoading ?
                            <div>loading</div>
                            : photos.data?.photo && photos.data?.photo.length == 0 ?
                                <div className='text-red-300'>no photos</div>
                                :
                                <ul className='flex flex-wrap w-full place-content-center md:m-0'>
                                    {photos.data?.photo.map(({ id, name, url, deleted }) =>
                                        <li key={id} className='flex flex-col w-64 p-2 m-2 border-2 border-gray-400 border-solid border-spacing-2'>
                                            <span className={"w-full truncate" + ` ${deleted ? 'line-through':''}`}>{name}</span>
                                            <Image className='object-cover w-64 aspect-square' width={300} height={300} src={url} alt={name} />
                                            {/* <img className='object-cover w-64 aspect-square' width={100} height={100} src={url} alt={name} /> */}
                                            <div className='flex w-full'>
                                                <button onClick={() => handleTogglePhotoDeleted(id)} className='relative w-1/2 h-12 m-1 rounded-none hover:text-white from-neutral-50 hover:bg-red-500 min-w-fit'>Delete</button>
                                                <button onClick={() => { navigator.clipboard.writeText(`![${name}](${url} "${name}")`) }} className='decoration-white relative hover:text-white border-{1px} border-blue-500 rounded-none m-1 from-neutral-50 hover:bg-blue-500 w-1/2 min-w-fit h-12'>copy</button>
                                            </div>
                                        </li>
                                        // <></>

                                    )}
                                </ul>
                        }
                    </div>
                    :
                    null}
            </div>
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
            <div dangerouslySetInnerHTML={{ __html: marked(markdown ? markdown : "") }} className="max-w-3xl prose grow justify-self-center"></div>
        )
    } else {
        return (
            <div>Loading...</div>
        )
    }
}

// interface IPhoto {
//     photos: {
//         photo: {
//             id: string;
//             name: string;
//             url: string;
//             deleted: boolean;
//         }[] | [];
//     } | null;
//     handleTogglePhotoDeleted: (id: string) => void;
//     handlePhotosUploads: (e: React.ChangeEvent<HTMLInputElement>) => void;
// }

// const PhotosSideBar = (props: IPhoto) => {
//     const { photos, handleTogglePhotoDeleted, handlePhotosUploads } = props;

//     if (photos) {
//         if (photos.photo.length > 0) {
//             return (
//                 <div className='max-w-fit'>
//                     <FileUploaderDropContainer onAddFiles={handlePhotosUploads} multiple></FileUploaderDropContainer>

//                     <ul className='overflow-x-hidden overflow-y-auto max-w-fit'>
//                         {photos.photo.map(({ id, name, url, deleted }) =>

//                             <li key={id} className='border-spacing-2 border-2 flex border-solid w-fill flex-col w-{100px} p-2 border-4 border-solid border-gray-400 m-2'>
//                                 <span className={deleted ? 'line-through truncate w-auto' : 'truncate w-auto'}>{name}</span>
//                                 <Image className='object-cover' width={100} height={100} src={url} alt={name} />
//                                 <div className='flex w-full'>
//                                     <button onClick={() => handleTogglePhotoDeleted(id)} className='relative w-1/2 h-12 m-1 border-2 border-red-500 rounded-none from-neutral-50 hover:bg-red-500 min-w-fit'>Delete</button>
//                                     <button onClick={() => { navigator.clipboard.writeText(`![${name}](${url} "${name}")`) }} className='decoration-white relative border-{1px} border-blue-500 rounded-none m-1 from-neutral-50 hover:bg-blue-500 w-1/2 min-w-fit h-12'>copy</button>
//                                 </div>
//                             </li>

//                         )}
//                     </ul>
//                 </div>
//             )
//         } else {
//             return (
//                 <>
//                     <FileUploaderDropContainer onAddFiles={handlePhotosUploads} multiple />
//                     <div className='text-zinc-50'>No photos</div>
//                 </>

//             )
//         }
//     } else {
//         return (
//             <div>Loading...</div>
//         )
//     }
// }

// const photoItem = (photo: { id: string, name: string, url: string, deleted: boolean }) => {
//     const { id, name, url, deleted } = photo;
//     return (
//         <div className='border-3'>
//             <h3 className={'text-decoration: line-through'}>{name}</h3>
//             <Image width={100} height={100} src={url} alt={name} />
//             <button onClick={() => handleTogglePhotoDeleted(id)}>Delete</button>
//             <button onClick={() => { navigator.clipboard.writeText(`![${name}](${url} "${name}")`) }}>copy</button>
//         </div>
//     )
// }