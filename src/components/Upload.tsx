import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { storage, ref, uploadBytes, getDownloadURL } from '../lib/firebase';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, X, Film, Image as ImageIcon, Waves, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface UploadProps {
  token: string;
  onComplete: () => void;
}

export default function Upload({ token, onComplete }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [circleId, setCircleId] = useState('');
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading('Catching the wave...');

    try {
      const fileType = file.type.startsWith('video') ? 'video' : 'image';
      const storageRef = ref(storage, `snaps/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await api.post('/posts', {
        mediaUrl: downloadURL,
        mediaType: fileType,
        caption,
        circleId: circleId || null,
      }, token);

      toast.success('Wave created!', { id: toastId });
      onComplete();
    } catch (error) {
      console.error(error);
      toast.error('The wave crashed.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-ocean-mid rounded-2xl border border-ocean-neon shadow-[0_0_10px_rgba(100,255,218,0.2)]">
          <UploadIcon className="w-6 h-6 text-ocean-neon" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter uppercase">Create a <span className="text-ocean-neon">Wave</span></h2>
      </div>

      {!preview ? (
        <div {...getRootProps()} className={cn("h-96 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer", isDragActive ? 'border-ocean-neon bg-ocean-neon/5' : 'border-ocean-foam/10 hover:border-ocean-neon/50 hover:bg-ocean-foam/5')}>
          <input {...getInputProps()} />
          <div className="p-6 bg-ocean-mid rounded-full mb-4"><Waves className="w-12 h-12 text-ocean-foam/20" /></div>
          <p className="text-lg font-bold text-ocean-foam/60">Drop your snap here</p>
          <button className="mt-6 px-6 py-2 bg-ocean-light text-ocean-neon font-bold rounded-xl hover:bg-ocean-neon hover:text-ocean-deep transition-all">Select File</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative h-96 rounded-3xl overflow-hidden border border-ocean-neon/20 shadow-2xl">
            {file?.type.startsWith('video') ? <video src={preview} className="w-full h-full object-cover" controls /> : <img src={preview} alt="Preview" className="w-full h-full object-cover" />}
            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What's the story?" className="w-full bg-ocean-mid border border-ocean-foam/10 rounded-2xl p-4 text-ocean-foam focus:outline-none focus:border-ocean-neon transition-colors h-24 resize-none" />
            <button onClick={handleUpload} disabled={uploading} className="w-full flex items-center justify-center gap-3 bg-ocean-neon text-ocean-deep font-black py-4 rounded-2xl hover:bg-ocean-wave transition-all disabled:opacity-50 shadow-lg">
              {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-ocean-deep"></div> : <><Send className="w-5 h-5" />SEND INTO THE FLOW</>}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
