'use client'
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/navigation";

enum SentimentResult {
    POSITIVE,
    NEUTRAL,
    NEGATIVE,
    ALL
};

export default function Admin() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);
    // const userType = typeof window !== undefined ? localStorage.getItem('user') : null;

    const [selectedResult, setSelectedResult] = useState(SentimentResult.ALL);
    const [submissions, setSubmissions] = useState<string[][]>([]);
    const [isRowLoading, setIsRowLoading] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('user')
        setUser(savedUser);

        if (savedUser !== 'admin') {
            router.replace('/');
        }
    }, [router, user])

    const { isLoading, isError, data } = useQuery('sheets', () => fetch('/api/hello', { next: { revalidate: 30 } }).then(res => res.json()), {
        onSuccess(data) {
            setSubmissions(data);
        }
    })
    useEffect(() => {
        if (submissions.length > 0) {

        }
    }, [submissions])

    if (isLoading) {
        return <main className="h-screen flex justify-center items-center"><svg version="1.1" className='w-32 h-32' id="L9" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 100 100" enableBackground="new 0 0 0 0" xmlSpace="preserve">
            <path fill="#22b556" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    dur="1s"
                    from="0 50 50"
                    to="360 50 50"
                    repeatCount="indefinite" />
            </path>
        </svg>
        </main>
    }

    if (isError) {
        return <div>Error</div>
    }
    console.log(data);



    return <>
        <main className="flex justify-center flex-col">
            <div className="m-auto mt-7 w-32 lg:w-44">
                <select onChange={(e) => setSelectedResult(parseInt(e.target.value))} className=" bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ">
                    <option value={SentimentResult.ALL}>ALL</option>
                    <option value={SentimentResult.POSITIVE}>POSITIVE</option>
                    <option value={SentimentResult.NEUTRAL}>NEUTRAL</option>
                    <option value={SentimentResult.NEGATIVE}>NEGATIVE</option>
                </select>
            </div>

            <div className="h-8"></div>

            <div className="overflow-auto">
                <table className="m-auto text-sm text-left text-gray-500 border table-auto ">
                    <thead className=" text-gray-700 bg-blue-50 ">
                        <tr className=''>
                            {submissions[0].map((header: string, index: number) => {
                                return <th key={header} scope='col' className='break-words px-6 py-3 text-center'>{header}</th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.slice(1).map((row, i) => {

                            return <tr key={i} className="p-4 px-48 border">
                                {row.map((data, i) => {
                                    if (i === 5) {
                                        const sentiment: Array<{ label: string, score: number }> = JSON.parse(data);
                                        const content1 = `${sentiment[0].label.toUpperCase()}: ${sentiment[0].score.toFixed(3)}`
                                        const content2 = `${sentiment[1].label.toUpperCase()}: ${sentiment[1].score.toFixed(3)}`
                                        let content3 = `${sentiment[2]?.label.toUpperCase()}: ${sentiment[2]?.score.toFixed(3)}`
                                        content3 = content3.includes("undefined") ? "" : content3;
                                        return <td className="md:p-5" key={i}><span className="border border-blue-500 p-1 rounded-full">{content1}</span><br />{content2}<br /> {content3}</td>
                                    }
                                    return <td key={i} className="p-5">{data}</td>
                                })}
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>

        </main>

    </>;
}


