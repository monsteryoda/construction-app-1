import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const deleteActivityImage = async (imageId: string, imageUrl: string) => {
  try {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts.slice(-2).join('/');

    await supabase.storage.from('activity-images').remove([fileName]);
    await supabase.from('activity_images').delete().eq('id', imageId);

    toast.success('Image deleted');
  } catch (error) {
    console.error('Error deleting image:', error);
    toast.error('Failed to delete image');
  }
};

export const deleteRemark = async (remarkId: string) => {
  try {
    const { error } = await supabase
      .from('activity_remarks')
      .delete()
      .eq('id', remarkId);

    if (error) throw error;
    toast.success('Remark deleted');
  } catch (error) {
    console.error('Error deleting remark:', error);
    toast.error('Failed to delete remark');
  }
};

export const uploadImages = async (activityId: string, userId: string, images: File[]) => {
  const uploadedImages: { image_url: string; file_name: string }[] = [];

  for (const file of images) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${activityId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('activity-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      continue;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('activity-images')
      .getPublicUrl(fileName);

    uploadedImages.push({ image_url: publicUrl, file_name: file.name });
  }

  if (uploadedImages.length > 0) {
    const { error } = await supabase.from('activity_images').insert(
      uploadedImages.map((img) => ({
        activity_id: activityId,
        image_url: img.image_url,
        file_name: img.file_name,
      }))
    );

    if (error) {
      console.error('Error saving image records:', error);
    }
  }

  return uploadedImages.length;
};