import { useState } from 'react';
import { Embedding } from './vector-core/types';

const useMultiFileDownloader = (urls: string[]) => {
    const [progress, setProgress] = useState(0)
    const [completed, setCompleted] = useState(false)
    const [data, setData] = useState<Embedding[]>([])

    const downloadFile = (url: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', url, true)
            xhr.responseType = 'json'

            xhr.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = event.loaded / event.total
                    setProgress((prevProgress) => {
                        const newProgress = prevProgress + (percentComplete / urls.length) * 100;
                        return Math.min(newProgress, 100);
                    });
                }
            }

            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(xhr.response)
                } else {
                    reject(new Error('File download failed.'))
                }
            }

            xhr.onerror = () => {
                reject(new Error('Network error.'))
            }

            xhr.send()
        })
    }

    const downloadAllFiles = async () => {
        const data = await urls.reduce(async (promiseChain, url) => {
            const chainResults = await promiseChain
            const currentResult = await downloadFile(url)
            return [...chainResults, currentResult]
        }, Promise.resolve([] as Embedding[]))

        if (data) {
            setData(data.flat())
            setCompleted(true)
            setProgress(100)
        }
    }

    return { progress, downloadAllFiles, completed, data }
}

export default useMultiFileDownloader
