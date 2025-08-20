import { useEffect, useMemo, useRef, useState } from "react";

export default function ImageUploader({ file, onFile, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file]
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const pick = () => inputRef.current?.click();

  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    onFile?.(f); 
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    onFile?.(f); 
  };

  return (
    <div
      className={`rounded-xl border ${
        dragOver ? "border-blue-400 bg-blue-50" : "border-black/10"
      } p-3`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />

      {file ? (
        <div className="flex items-center gap-3">
          <img
            src={previewUrl}
            alt="preview"
            className="w-16 h-16 rounded-full object-cover border border-black/10"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={pick}
              className="px-3 py-1.5 rounded-md border border-black/10 text-sm hover:bg-gray-50"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onClear?.()}
              className="px-3 py-1.5 rounded-md border border-black/10 text-sm hover:bg-gray-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          className="w-full h-24 rounded-lg border border-dashed border-black/10 text-sm text-gray-600 hover:bg-gray-50"
        >
          Click to choose or drag & drop an image
        </button>
      )}
    </div>
  );
}
