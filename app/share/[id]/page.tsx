"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { useParams } from "next/navigation";

export default function ContactPage() {
  const params = useParams();
  const id = params.id;
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className=" pt-24 pb-12 sm:pt-24 sm:pb-16 border-x section-container section-content-padding w-full  justify-center">
        <div className="flex justify-center  w-full">
          <div className="bg-gray-900 p-2 rounded-2xl shadow-2xl max-w-full">
            <div className="bg-white rounded-xl overflow-hidden">
              <iframe
                src={`/chat/${id}`}
                className="w-[355px] h-[647px] border-0 max-w-full"
                title={`Magical CX`}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          </div>
        </div>
      </main>

      <div className="bg-background dark">
        <Footer />
      </div>
    </div>
  );
}
