import { FormItem, FileUploaderDropContainer, FileUploader, Button } from '@carbon/react';
import { useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';

const Upload = function () {
    const [files, setFiles] = useState<File[]>([]);

    const handleSend = function () {
        (new Array(...files)).forEach((file) => {
            console.log(file);
            fetch(`/api/signedPutLink?name=${file.name}`).then((res) => {
                console.log(res);
                res.text().then((url) => {
                    console.log(url);
                    fetch(url, {
                        method: 'PUT',
                        body: file
                    }).then(() => {
                        console.log('done');
                    })
                    .catch((err) => {
                        console.error(err);
                    })
                }).catch((err) => {
                    console.error(err);
                })
            }).catch((err) => {
                console.error(err);
            })
        })
    }

    return (
        <div>
            <h1>Upload</h1>
            <FormItem>

                <p className="cds--file--label">
                    Upload files
                </p>
                <p className="cds--label-description">
                    Supported file types are .jpg and .png.
                </p>
                {/* <FileUploaderDropContainer multiple onAddFiles={setFiles} />
                <div
                    className="cds--file-container"
                    style={{
                        width: '100%'
                    }}
                /> */}
                <div className="cds--file__container">
                    <FileUploader
                        accept={[
                            '.jpg',
                            '.png'
                        ]}
                        buttonKind="primary"
                        buttonLabel="Add files"
                        filenameStatus="edit"
                        iconDescription="Clear file"
                        labelDescription="only .jpg files at 500mb or less"
                        labelTitle="Upload"
                        onChange={(e) => setFiles(e.target.files)}
                        multiple
                    />
                </div>
                <Button onClick={handleSend}>Send</Button>
            </FormItem>
        </div>
    );
};

export default Upload;
