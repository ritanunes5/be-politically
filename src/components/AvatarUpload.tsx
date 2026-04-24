import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, emitProfileUpdated } from '@/hooks/useProfile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const AvatarUpload = () => {
  const { user } = useAuth();
  const { profile, refresh } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const displayName =
    profile?.display_name ||
    (user?.user_metadata as { display_name?: string } | undefined)?.display_name ||
    user?.email?.split('@')[0] ||
    'Utilizador';
  const initials = displayName.slice(0, 2).toUpperCase();

  const uploadBlob = async (blob: Blob, ext: string) => {
    if (!user) return;
    setUploading(true);
    try {
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: blob.type || `image/${ext}` });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${pub.publicUrl}?v=${Date.now()}`;

      const { error: updErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);
      if (updErr) throw updErr;

      await refresh();
      emitProfileUpdated();
      toast.success('Foto de perfil atualizada');
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível atualizar a foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('O ficheiro tem de ser uma imagem.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('Imagem demasiado grande (máx. 5 MB).');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    await uploadBlob(file, ext);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const openCamera = async () => {
    setCameraError(null);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      // Wait a tick so the <video> element exists
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch (err) {
      console.error(err);
      setCameraError('Não foi possível aceder à câmara. Verifica as permissões.');
    }
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
    );
    if (!blob) {
      toast.error('Não foi possível capturar a foto.');
      return;
    }
    closeCamera();
    await uploadBlob(blob, 'jpg');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-border">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          PNG ou JPG, máx. 5 MB.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Carregar
          </Button>
          <Button variant="outline" size="sm" onClick={openCamera} disabled={uploading}>
            <Camera className="w-4 h-4 mr-2" />
            Câmara
          </Button>
        </div>
      </div>

      <Dialog
        open={cameraOpen}
        onOpenChange={(open) => {
          if (!open) closeCamera();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tirar foto</DialogTitle>
            <DialogDescription>
              Posiciona-te à frente da câmara e captura a tua foto.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg overflow-hidden bg-black aspect-square">
            {cameraError ? (
              <div className="w-full h-full flex items-center justify-center text-sm text-destructive-foreground bg-destructive/80 p-4 text-center">
                {cameraError}
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeCamera}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={capturePhoto} disabled={!!cameraError || uploading}>
              <Camera className="w-4 h-4 mr-2" />
              Capturar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvatarUpload;
