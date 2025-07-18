import { useEffect, useState } from "react";
import { FileText, Loader2, Plus, X } from "lucide-react";
import { API, handleApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";

export default function MyDocs({onClose, onSelect}) {

  const auth  = useAuth();
  const location = useLocation();
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState({
    fileType: "",
    fileUrl: "",
    fileId: "",
    fileName: "",
    summary: ""
  })
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
        if(!auth?.isLoggedIn){
            return;
        }
    
      const res = await handleApi(
        API.get("/docs", {
          headers: {
            Authorization: `Bearer ${auth?.authToken}`,
          },
          withCredentials: true
        })
      );

      if (res.error) {
        toast.error(res.error.message);
      }
      
      if (res.status == 200) {
        setDocs(res.data);
      }

      setLoading(false);
    };

    fetchDocs();
  }, [auth]);

  const handleSelection = (data)=> {
    setSelected((prev)=> {
        return {...prev, fileId:data._id, fileUrl: data.fileUrl, fileType: data.fileType, fileName:data.originalName, summary: data.summary}
    })
  }

  const confirmSelection = ()=> {
    if(selected.fileId != ""){
        onSelect && onSelect(selected);
        onClose && onClose()
    }else{
        toast.error("Select your document")
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-transparent flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Select Your Documents</h2>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
          </div>
        ) : docs?.length === 0 ? (
          <div className="flex flex-col justify-center items-center gap-3">
            <p className="font-bold text-center">No documents uploaded.</p>
             <Link to="/upload" state={{from: location.pathname}} className="border p-3 py-2 rounded bg-blue-400 text-white font-semibold"> Upoad Documents </Link>
          </div>
        ) : (
          <div className="flex flex-wrap wrap-normal gap-4">
            {docs?.map((doc) => (
              <div
                key={doc._id}
                className={`flex flex-col items-center p-2 rounded-md hover:shadow hover:bg-gray-200 hover:cursor-pointer ${doc._id === selected.fileId && "bg-gray-300"}`}
                title={`${doc.originalName}`}
                onClick={()=> handleSelection(doc)}
              >
                <FileText className="text-blue-600 mb-1" />
                <span className="text-sm text-center truncate max-w-[100px]">
                  {doc.originalName}
                </span>
              </div>
            ))}
            <Link className={`flex justify-center items-center px-5 rounded-md ${selected.fileId == "" ? "bg-gray-200": "bg-gray-200/50"}`}
            to={"/upload"}
            state={{from: location.pathname}}
            title="Upload new document"
            >
              <Plus cursor={"pointer"}/>
            </Link>
          </div>
        )}
        { selected?.fileId != "" &&
          <button className="w-full p-1 rounded-md bg-blue-500 text-white font-semibold mt-3"
          onClick={confirmSelection}>
            Confirm
          </button>
        }
      </div>
    </div>
  );
}
