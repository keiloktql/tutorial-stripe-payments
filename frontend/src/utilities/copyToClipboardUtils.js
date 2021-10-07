import { toast } from "react-toastify";

export const handleCopyToClipboard = (copyText) => {
    navigator.clipboard.writeText(copyText);
    toast.success("Copied to clipboard!");
};