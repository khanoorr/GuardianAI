"use client";

import { useState, useCallback, useRef, type ReactNode, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFileChange: (file: File | null) => void;
  accept: string;
  children?: ReactNode;
  className?: string;
}

export default function FileDropzone({ onFileChange, accept, children, className }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileChange(files[0]);
      }
    },
    [onFileChange]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileChange(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={cn(
        "group relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-primary hover:bg-primary/5",
        isDragging && "border-primary bg-primary/10 ring-2 ring-primary",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      {children || (
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground transition-colors group-hover:text-primary">
          <UploadCloud className="h-12 w-12" />
          <div className="text-center">
            <p className="font-semibold">Drag & drop your file here</p>
            <p className="text-sm">or click to browse</p>
            <p className="text-xs mt-2">({accept.split(',').map(ext => ext.trim()).join(' / ')})</p>
          </div>
        </div>
      )}
    </div>
  );
}
