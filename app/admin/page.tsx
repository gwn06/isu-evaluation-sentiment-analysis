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

const kSkipHeaderIndex = 1;
const kSentiment = 5;

export default function Admin() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);
    // const userType = typeof window !== undefined ? localStorage.getItem('user') : null;

    // const [selectedResult, setSelectedResult] = useState(SentimentResult.ALL);
    const [submissions, setSubmissions] = useState<string[][]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const submissionsPerPage = 10;
    // Logic for displaying submissions
    const indexOfLastSubmission = currentPage * submissionsPerPage;
    const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
    console.log(indexOfFirstSubmission);
    const currentSubmissions = indexOfFirstSubmission === 0 ? submissions.slice(kSkipHeaderIndex, indexOfLastSubmission) : submissions.slice(indexOfFirstSubmission, indexOfLastSubmission);

    // Logic for pagination
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(submissions.length / submissionsPerPage); i++) {
        pageNumbers.push(i);
    }

    const handleClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };


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
            // console.log(submissions);
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

    const totalSubmissions = submissions.length - 1;
    console.log(JSON.parse(submissions[10][5]));

    const y_pred: number[] = []

    const countSentiments = (data: string[][]) => {
        const counts = {
            positive: 0,
            negative: 0,
            neutral: 0
        };

        data.forEach((arr) => {
            let highestScore = -Infinity;
            let highestSentiment = "";

            const sentiment = JSON.parse(arr[5]);
            sentiment.forEach((obj: any) => {
                if (obj.score > highestScore) {
                    highestScore = obj.score;
                    highestSentiment = obj.label;
                }
            });

            if (highestSentiment.toLowerCase() === "positive") {
                y_pred.push(0);
                counts.positive++;
            } else if (highestSentiment.toLowerCase() === "negative") {
                y_pred.push(1);
                counts.negative++;
            } else if (highestSentiment.toLowerCase() === "neutral") {
                y_pred.push(2);
                counts.neutral++;
            }
        });

        console.log("y_pred: ", y_pred);

        return counts;
    }

    const sentimentCounts = countSentiments(submissions.slice(1, submissions.length));


    const sentimentData = [
        { label: 'Total', value: totalSubmissions, color: 'blue' },
        { label: 'Positive', value: sentimentCounts.positive, color: 'green' },
        { label: 'Negative', value: sentimentCounts.negative, color: 'red' },
        { label: 'Neutral', value: sentimentCounts.neutral, color: 'gray' },
    ];

    return <>
        <main className="flex justify-center flex-col">
            <div className="flex justify-center space-x-4 mt-8">
                {sentimentData.map((sentiment, index) => {
                    const textColor = "text-" + sentiment.color + "-500";
                    return (
                        <div key={index} className="bg-white rounded-lg shadow-lg p-6 m-2">
                            <h2 className={`text-xl font-semibold`}>{sentiment.label}</h2>
                            <p className={`text-2xl font-bold mt-2 ${textColor}`}>{sentiment.value}</p>
                        </div>
                    );
                })}
            </div>
            {/* <div className="m-auto mt-7 w-32 lg:w-44">
                <select onChange={(e) => setSelectedResult(parseInt(e.target.value))} className=" bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ">
                    <option value={SentimentResult.ALL}>ALL</option>
                    <option value={SentimentResult.POSITIVE}>POSITIVE</option>
                    <option value={SentimentResult.NEUTRAL}>NEUTRAL</option>
                    <option value={SentimentResult.NEGATIVE}>NEGATIVE</option>
                </select>
            </div> */}

            <div className="h-8"></div>

            <div className="overflow-auto">
                <table className="m-auto text-sm text-left text-gray-500 border ">
                    <thead className=" text-gray-700 bg-blue-50 ">
                        <tr className=''>
                            {submissions[0].map((header: string, index: number) => {
                                if (index === 4) {
                                    return <th key={index} scope='col' className='break-words px-6 py-3 w-60 text-center'>{header}</th>
                                }
                                return <th key={index} scope='col' className='break-words px-6 py-3  text-center'>{header}</th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {currentSubmissions.map((row, i) => {

                            // return <></>
                            return <tr key={i} className={`p-4 px-48 border ${i % 2 == 0 ? 'bg-gray-100' : 'bg-white'}`}>
                                {row.map((data, j) => {
                                    if (j === kSentiment) {
                                        const sentiment: Array<{ label: string, score: number }> = JSON.parse(data);
                                        const content1 = `${sentiment[0].label.toUpperCase()}: ${sentiment[0].score.toFixed(3)}`
                                        const content2 = `${sentiment[1].label.toUpperCase()}: ${sentiment[1].score.toFixed(3)}`
                                        let content3 = `${sentiment[2]?.label.toUpperCase()}: ${sentiment[2]?.score.toFixed(3)}`
                                        content3 = content3.includes("undefined") ? "" : content3;
                                        return <td className="md:p-5" key={j}><span className="border font-semibold border-blue-500 p-1 rounded-full">{content1}</span><br />{content2}<br /> {content3}</td>
                                    }
                                    return <td key={j} className="p-5">{data}</td>
                                })}
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
                {pageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        className={`mx-1 px-3 py-1 rounded-md ${pageNumber === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                            }`}
                        onClick={() => handleClick(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>
            <div className="mb-10"></div>
        </main>

    </>;
}


