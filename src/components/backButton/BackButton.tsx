import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // or use your preferred icon library

const BackButton = ({ buttonText }: { buttonText: string }) => {
    const navigate = useNavigate();
    const { tableId } = useParams(); // So we can navigate back with the right tableId
    console.log("tableId", tableId);

    return (
        <div className="mb-4 flex items-center space-x-2">
            <button
                onClick={() => navigate(`/menu/${1}`)}
                className="flex items-center text-sm text-primary hover:underline"
            >
                <ArrowLeft className="mr-1 h-4 w-4" />
                {buttonText}
            </button>
        </div>
    )
}

export default BackButton
