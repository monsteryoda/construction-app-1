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

  console.log(`[uploadImages] Starting upload for activity ${activityId} with ${images.length} images`);

  for (const file of images) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${activityId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log(`[uploadImages] Uploading file: ${fileName}`);

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('activity-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error(`[uploadImages] Upload error for ${fileName}:`, uploadError);
      toast.error(`Failed to upload ${file.name}`);
      continue;
    }

    console.log(`[uploadImages] Upload successful:`, uploadData);

    const { data: publicUrlData } = supabase.storage
      .from('activity-images')
      .getPublicUrl(fileName);

    console.log(`[uploadImages] Public URL:`, publicUrlData.publicUrl);

    uploadedImages.push({ image_url: publicUrlData.publicUrl, file_name: file.name });
  }

  // Save image records to database
  if (uploadedImages.length > 0) {
    console.log(`[uploadImages] Saving ${uploadedImages.length} image records to database`);
    
    const imageRecords = uploadedImages.map((img) => ({
      activity_id: activityId,
      image_url: img.image_url,
      file_name: img.file_name,
    }));

    const { data: insertData, error } = await supabase.from('activity_images').insert(imageRecords).select();

    if (error) {
      console.error('[uploadImages] Error saving image records:', error);
      toast.error('Failed to save image records');
    } else {
      console.log('[uploadImages] Image records saved:', insertData);
    }
  }

  return uploadedImages.length;
};