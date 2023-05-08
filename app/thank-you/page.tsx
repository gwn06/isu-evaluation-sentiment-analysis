import Image from "next/image";

export default function ThankYou() {
    return <>
        <main className="h-screen flex items-center justify-center flex-col">

            <div className="relative bottom-40 md:bottom-32">

                <Image className="" src={"/thanks.gif"} width={500} height={400} alt="TY"></Image>
                <div className="text-xl md:text-2xl relative bottom-24 text-center text-gray-600">Your submission has been received.</div>

            </div>
        </main>
    </>
}