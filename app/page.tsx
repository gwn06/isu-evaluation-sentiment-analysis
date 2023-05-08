'use client'
import Image from 'next/image'
import { tableScale, questions } from './data/questionnaire'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation';

import { HfInference } from "@huggingface/inference";

const inference = new HfInference(process.env.HF_ACCESS_TOKEN);

export default function Home() {
  const router = useRouter();
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incompleteTableData, setIncompleteTableData] = useState({ error: false, itemNumber: -1 });

  useEffect(() => {

    sleep(1500).then(() => {
      setLoading(false);
    })
  }, [loading])

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const target = event.target;
    const tableAnswers: any = {}

    let itemNumber = 0;
    for (let i = 0; i <= 49; i++) {
      const checked = target[i + 2].checked;
      if (checked) {
        tableAnswers[itemNumber + 1] = { pos: (i + 1) - (itemNumber * 5) }
        itemNumber += 1;
      }
    }

    if (Object.values(tableAnswers).length < 10) {
      setIncompleteTableData(prevState => ({ error: true, itemNumber }));
      return;
    }
    setIncompleteTableData(prevState => ({ error: false, itemNumber: -1 }));

    const submission = { username: target.username.value.toUpperCase(), course: target.course.value.toUpperCase(), answers: tableAnswers, comment: target.comment.value, };
    console.log(submission);
    setIsSubmitting(true);
    fetch('/api/sheets', {
      method: 'POST', headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submission)
    }).then((res) => res.json()).then((res) => {
      if (res !== undefined) {
        console.log(res.stastus);

        router.replace('/thank-you');
      }
      setIsSubmitting(false);

    })

  }

  if (loading) {
    return (<main className='flex justify-center items-center text-5xl h-screen'>
      <Image src="/SA.gif" width={600} height={600} alt='sentiment analysis'></Image>
    </main>)
  }
  return (
    <main className="">
      <div className='h-8'></div>
      <section className='m-auto bg-white max-w-6xl rounded-md shadow-lg'>
        <div className='p-5 py-10 md:p-10 md:ml-10'>
          <h1 className='text-5xl font-semibold mb-2'>Faculty Evaluation</h1>
          <span className='text-xl text-gray-500'> Please take a moment to fill out this form</span>
        </div>
        <hr />

        <form onSubmit={handleSubmit}>
          <div className="w-96 pt-10 ml-5 md:ml-20">
            <label htmlFor="name" className="block mb-2 text-xl font-medium text-gray-900 dark:text-white">Name (Optional)</label>
            <input name='username' type="text" id="name" className="capitalize border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " />
          </div>

          <div className="mb-6 w-96 pt-10 ml-5 md:ml-20">
            <label htmlFor="course" className="block mb-2 text-xl font-medium text-gray-900 dark:text-white">Course <span className='text-red-500'>*</span></label>
            <input placeholder='BSCS' name='course' type="text" id="course" className="uppercase border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " required />
          </div>
          <QuestionnaireInputTable isMissingField={incompleteTableData} />

          <div className='h-8'></div>

          <div className='m-auto mx-5 md:mx-20 '>
            <label htmlFor="comment" className="block mb-2 text-xl font-medium text-gray-900 ">Please leave a comments/suggestions and recommendations.<span className="text-red-500">*</span></label>
            <textarea name='comment' required id="comment" rows={6} className="block p-2.5 w-full text-xl text-gray-900  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 " placeholder="Write your thoughts here..."></textarea>
          </div>

          <div className='h-8'></div>
          <div className='flex justify-center'>

            <button disabled={isSubmitting} type="submit" className=" disabled:bg-green-400 focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-xl px-48 md:px-20 py-4">
              {!isSubmitting ? "Submit" : <svg className='w-20 h-8' version="1.1" id="L4" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 100 100" enableBackground="new 0 0 0 0" xmlSpace="preserve">
                <circle fill="#fff" stroke="none" cx="6" cy="50" r="12">
                  <animate
                    attributeName="opacity"
                    dur="1s"
                    values="0;1;0"
                    repeatCount="indefinite"
                    begin="0.1" />
                </circle>
                <circle fill="#fff" stroke="none" cx="36" cy="50" r="12">
                  <animate
                    attributeName="opacity"
                    dur="1s"
                    values="0;1;0"
                    repeatCount="indefinite"
                    begin="0.2" />
                </circle>
                <circle fill="#fff" stroke="none" cx="66" cy="50" r="12">
                  <animate
                    attributeName="opacity"
                    dur="1s"
                    values="0;1;0"
                    repeatCount="indefinite"
                    begin="0.3" />
                </circle>
              </svg>}
            </button>
          </div>
          <div className='h-8'></div>
        </form>
      </section>

      <div className='h-8'></div>
    </main>
  )
}


function QuestionnaireInputTable({ isMissingField }: any) {
  return <div className="relative overflow-x-auto">
    <table className="m-auto text-xl text-left text-gray-500 border ">
      <thead className="text-sm md:text-base text-gray-700 bg-blue-50 ">
        <tr className='border'>
          <th scope="col" className="left-0 sticky px-2 py-3"> </th>
          {tableScale.map((scale, index) => {
            return <th key={scale} scope='col' className='break-words md:max-w-[10rem] px-6 py-3'>{scale}</th>
          })}
        </tr>
      </thead>
      <tbody>
        {questions.map((q, qIndex) => {
          let errorBorder = '';
          console.log(isMissingField.itemNumber);

          if (isMissingField.error && isMissingField.itemNumber === qIndex) {
            errorBorder = 'border-rose-500 border-4';
          }
          return <tr key={qIndex} className={`bg-white ${errorBorder}`}>
            <th scope="row" className={`${errorBorder} left-0 sticky border break-words md:max-w-[18rem] bg-blue-50 px-6 py-4 font-medium text-sm md:text-lg text-gray-900`}>
              {q}
            </th>
            {tableScale.map((scale, index) => {

              return <td key={index} className={`border pl-11 py-4`}>
                <div className="flex items-center">
                  <input type="radio" value={(index + 1).toString()} name={qIndex.toString()} className="ans w-8 h-8 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 " />
                </div>
              </td>
            })}
          </tr>
        })}
      </tbody>
    </table>
  </div>

}