import React, { useState, useEffect, useRef } from 'react';
import { LANGUAGES } from '../utils/presets';
import { Icons } from './icons';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Languages } from 'lucide-react';
// import axios from "axios";
// const nextTranslate=require('next-translate')

interface TranslationProps {
    messageId: string;
    textElement: string | string[]
    toLanguage: string;
    setToLanguage: (value: string) => void;
}
export const Translation: React.FC<TranslationProps> = (props: TranslationProps) => {
  const {messageId, textElement, toLanguage, setToLanguage } = props;
  const [tab, setTab] = useState<'transcription' | 'translation'>('transcription');
  const [translation, setTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState<boolean | null>(null);
  // const worker = useRef<Worker | null>(null);

  // useEffect(() => {
  //   console.log(worker.current)
  //   if (!worker.current) {
  //     try {
  //       worker.current = new Worker(new URL('../utils/translate.worker.js', import.meta.url),
  //        {
  //         type: 'module'
  //     });
  //     } catch (error) {
  //       throw error
  //     }
  //   }

  //   const onMessageReceived = async (e: MessageEvent) => {
  //       console.log("console at translation layer",e.data)
  //       switch (e.data.status) {
  //           case 'initiate':
  //               console.log('DOWNLOADING');
  //               break;
  //           case 'progress':
  //               console.log('LOADING');
  //               break;
  //           case 'update':
  //               console.log("output for aaaaa",e.data.output);
  //               break;
  //           case 'complete':
  //               console.log("DONE");
  //               break;
  //       }
  //   };

    // worker.current.addEventListener('message', onMessageReceived);

    // return () => worker.current!.removeEventListener('message', onMessageReceived);
// }, []);

// async function query() {
//   const data="hello"
// 	const response = await fetch(
// 		"https://api-inference.huggingface.co/models/facebook/m2m100_418M",
// 		{
// 			headers: { Authorization: "Bearer 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" },
// 			method: "POST",
// 			body: JSON.stringify(data),
// 		}
// 	);
// 	const result = await response.json();
// 	console.log(result);
// }


const fetchTranslation = async () => {
  const response = await axios({
    method: "post",
    url: "../utils/huggingface", 
    data: { text: textElement, lang: 'en-es' }, // Sending the selected language to the backend
    headers: { "Content-Type": "application/json" },
  });

  setTranslation(response.data.translation_text);
};



  function generateTranslation() {
    fetchTranslation()
    console.log("console at get translation function",messageId)
    console.log("console at get translation function",textElement)
    if (translating || toLanguage === 'Select language') {
        
        return;
    }

    setTranslating(true);
    // const te="hello"
    // const { t } = nextTranslate('es');
    // const translatedText = t('hello');
    // console.log(translatedText);

    // worker.current!.postMessage({
    //     text: "hello",
    //     src_lang: 'eng_Latn',
    //     tgt_lang: 'pan_Guru'
    // });
}
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className='overflow-visible'>
          <Button className='rounded-full h-4 w-6 aspect-square bg-transparent'>
            <Avatar className='relative w-6 h-4 bg-transparent' >
                <AvatarFallback>
                  <Languages className='h-4 w-4 bg-slate-600' />
                </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
  
        <DropdownMenuContent className='bg-white' align='end'>
          <div className='flex items-center justify-start gap-2 p-2'>
            <div className='flex flex-col space-y-0.5 leading-none'>
            {!translating && (<div className='flex flex-col gap-1 mb-4'>
                <p className='text-xs sm:text-sm font-medium text-slate-500 mr-auto'>To language</p>
                <div className='flex items-stretch gap-2 sm:gap-4' >
                    <select value={toLanguage} className='flex-1 outline-none w-full focus:outline-none bg-white duration-200 p-2  rounded' 
                    onChange={(e) => {
                      setToLanguage(e.target.value)
                    }}>

                        <option value={'Select language'}>Select language</option>
                        {Object.entries(LANGUAGES).map(([key, value]) => {
                            return (
                                <option key={key} value={value}>{key}</option>
                            )
                        })}

                    </select>
                    <button onClick ={generateTranslation}  className='specialBtn px-3 py-2 rounded-lg text-blue-400 hover:text-blue-600 duration-200'>Translate</button>
                </div>
            </div>)}
                </div>
            </div> 
          
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

export default Translation;
