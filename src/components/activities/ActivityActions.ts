"use client";

import { supabase } from '@/integrations/supabase/client';

export const uploadImages = async (activityId: string, userId: string, files: File[]): Promise<number> => {
  try {
    const imageUrls: string[] = [];

    for (const file of files) {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Store image URL in database
      const { data, error } = await supabase
        .from('activity_images')
        .insert([{
          activity_id: activityId,
          image_url: base64,
          file_name: file.name,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error storing image:', error);
        throw error;
      }

      imageUrls.push(base64);
    }

    return imageUrls.length;
  } catch (error) {
    console.error('[uploadImages] Error:', error);
    throw error;
  }
};

export const deleteRemark = async (remarkId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('activity_remarks')
      .delete()
      .eq('id', remarkId);

    if (error) throw error;
  } catch (error) {
    console.error('[deleteRemark] Error:', error);
    throw error;
  }
};