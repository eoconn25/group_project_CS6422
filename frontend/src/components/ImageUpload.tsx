// this holds the image upload component
import { useRef } from "react";

// Props for ImageUpload component
// expects one prop, onUpload takes the string which would be the image url, and return nothing if not provided
interface ImageUploadProps {
  onUpload: (imageUrl: string) => void;
}

// react functional component for image upload
// uses object destructuring to extract onUpload from props
export default function ImageUpload({ onUpload }: ImageUploadProps) {
  //ref to the hidden file input element
  //useRef tells typescript that reference will point to a input element of type file, but starts as null before element is rendered to open fiile dialog programatically from another component or button
  //inputRef will give ascces to the real HTML input element in the DOM
  const inputRef = useRef<HTMLInputElement>(null);

  //this is when a file is selected
  // ChangeEvent wrapper around the native event for type safety
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // get the first file from the input element of all selected files
    const file = e.target.files?.[0];
    if (file) {
      // URL.createObjectURL creates a temporary URL for the file object that the browser uses to preview files, doesnt upload the file to a server local only
      const url = URL.createObjectURL(file);
      //passes URL to parent component via the onUpload callback prop
      // parent can display, store in state, or send to a server
      onUpload(url);
    }
  };

  return (
    // hidden file input element
    <input
      // connects the ref to this input element so can access it programmatically
      ref={inputRef}
      // tells browser its a file upload input
      type="file"
      // only image files can be selected
      accept="image/*"
      // hidden from view, we will trigger it with a button elsewhere
      className="hidden"
      // when a file is selected, call handleFileChange
      onChange={handleFileChange}
    />
  );
}