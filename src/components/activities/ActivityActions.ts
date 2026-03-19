"use client";

import { supabase } from '@/integrations/supabase/client';

export const uploadImages = async (activityId: string, userId: string, files: File[]): Promise<number> => {
  let uploadedCount = 0;

  for (const file of files) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/activities/${activityId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('activity_images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('[uploadImages] Error uploading file:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('activity_images')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('activity_images')
        .insert([{
          activity_id: activityId,
          image_url: publicUrl,
          file_name: fileName,
        }]);

      if (insertError) {
        console.error('[uploadImages] Error inserting image record:', insertError);
        continue;
      }

      uploadedCount++;
    } catch (error) {
      console.error('[uploadImages] Error processing file:', error);
    }
  }

  return uploadedCount;
};

export const deleteRemark = async (remarkId: string): Promise<void> => {
  const { error } = await supabase
    .from('activity_remarks')
    .delete()
    .eq('id', remarkId);

  if (error) {
    throw error;
  }
};