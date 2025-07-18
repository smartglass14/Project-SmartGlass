import { Clipboard, FileText, LoaderCircle } from "lucide-react";
import { useState, useEffect } from "react";
import MyDocs from "../components/MyDocs";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { handleApi, API } from "../services/api";

export default function SummaryPage() {
    const auth = useAuth();

    const [showDocs, setShowDocs] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState("");

  useEffect(()=> {
    const generateSummary = async()=> {
      setLoading(true);
      if(!selectedDoc){
        return toast("Please Select Document to generate Summary ")
      }

      if(selectedDoc?.summary && selectedDoc?.summary != ""){
        setSummary(selectedDoc.summary);
        toast.success("Already summarized this document once")
        setLoading(false)
        return;
      }

      const res = await handleApi(API.post("/summary", selectedDoc,{
        headers: {
          Authorization: `Bearer ${auth?.authToken}`,
        },
        withCredentials: true
        })
      );

      if(res.error){
        console.log(res.error.message);
      }
      if(res.status == 200){
        setSummary(res.data.summary);
      }

      setLoading(false);
    }
    generateSummary();
    
  }, [selectedDoc, auth]);

    const handleCopy = ()=>{
      navigator.clipboard.writeText(summary);
      toast.success("Copied to clipboard")
    }

  return (
    <>
    {
        showDocs && <MyDocs onClose={()=> setShowDocs(false)} onSelect={setSelectedDoc}/>
    }
    <div className="min-h-screen bg-white font-['Inter','Noto_Sans',sans-serif] text-[#121417]">
     
      <main className="px-4 sm:px-10 py-5 flex justify-center ">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col gap-2 p-4">
            <h1 className="text-2xl sm:text-[32px] font-bold">Document Summary</h1>
            <p className="text-sm text-[#677583]">
              Review the details of the uploaded document.
            </p>
          </div>

          { selectedDoc &&
          (<div className="flex items-center justify-between px-4 py-2 bg-white min-h-14 rounded-md">
           <div className="flex items-center gap-4">
              <div className="bg-[#f1f2f4] rounded-lg p-2">
                <FileText className="w-5 h-5 text-[#121417]" />
              </div>

              <p className="truncate text-base font-bold flex-1">
                {selectedDoc?.fileName}
              </p>
           </div>
            
            {summary &&
              <div className="flex justify-end pr-15" title="Copy to Clipboard"> <Clipboard cursor={"pointer"} onClick={handleCopy} /> </div> 
            }
          </div>)}

        { (selectedDoc && loading) &&
          <div className="mt-20 flex flex-col gap-3 justify-center items-center">
            <LoaderCircle className="animate-spin" size={"35px"}/>
            <p className="font-semibold">Generating Summary... </p>
          </div>
        }

        { summary && 
        (<div className="text-base px-4 pt-2 pb-6 bg-gray-100">
              {summary.split('\n').map((para, index) =>
                para.trim() && (
                  <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                    {para.trim()}
                  </p>
                )
              )}
          </div>)}

        </div>
      </main>
    </div>
    </>
  );
}
