import React, { useState, useEffect, useRef } from 'react';
import Translation from './Translation';

interface Props {
    output: { text: string }[];
    finished: boolean;
    generateTranslation: (messageId: string) => void;
    setToLanguage: (value: string) => void;
}

const Information: React.FC<Props> = (props: Props) => {
    const { output, finished } = props;
    const [tab, setTab] = useState<'transcription' | 'translation'>('transcription');
    const [translation, setTranslation] = useState<string | null>(null);
    const [toLanguage, setToLanguage] = useState<string>('Select language');
    const [translating, setTranslating] = useState<boolean | null>(null);
    const [messageId, setMessageId] = useState<string>('');
    console.log(output);

    const worker = useRef<Worker | null>(null);
    
    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(new URL('../utils/translate.worker.js', import.meta.url), {
                type: 'module'
            });
        }

        const onMessageReceived = async (e: MessageEvent) => {
            console.log(e.data)
            switch (e.data.status) {
                case 'initiate':
                    console.log('DOWNLOADING');
                    break;
                case 'progress':
                    console.log('LOADING');
                    break;
                case 'update':
                    setTranslation(e.data.output);
                    console.log(e.data.output);
                    break;
                case 'complete':
                    setTranslating(false);
                    console.log("DONE");
                    break;
            }
        };

        worker.current.addEventListener('message', onMessageReceived);

        return () => worker.current!.removeEventListener('message', onMessageReceived);
    }, []);

    const textElement = tab === 'transcription' ? output.map(val => val.text) : translation || '';

    function generateTranslation() {
        if (translating || toLanguage === 'Select language') {
            return;
        }

        setTranslating(true);

        worker.current!.postMessage({
            text: output.map(val => val.text),
            src_lang: 'eng_Latn',
            tgt_lang: toLanguage
        });
    }
    return (
        <main className='flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto'>
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl whitespace-nowrap'>Your <span className='text-blue-400 bold'>Transcription</span></h1>
           
            <div className='my-8 flex flex-col-reverse max-w-prose w-full mx-auto gap-4'>
                {(!finished || translating) && (
                    <div className='grid place-items-center'>
                        <i className="fa-solid fa-spinner animate-spin"></i>
                    </div>
                )}
               
                {/* <Translation 
                    messageId={messageId}
                    textElement={textElement} 
                    toLanguage={toLanguage} 
                    translating={translating} 
                    setToLanguage={setToLanguage} 
                    generateTranslation={generateTranslation} 
                /> */}
            </div>
        </main>
    );
}

export default Information;