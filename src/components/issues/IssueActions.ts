"use client";

import { supabase } from '@/integrations/supabase/client';

export const uploadImages = async (issueId: string, userId: string, images: File[]): Promise<string[]> => {
  try {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const filePath = `${userId}/${issueId}/${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('issue-images')
        .upload(filePath, image);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('issue-images')
        .getPublicUrl(filePath);

      // Store image reference in database
      const { data, error } = await supabase
        .from('issue_images')
        .insert([{
          issue_id: issueId,
          image_url: publicUrlData.publicUrl,
          file_name: image.name,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error storing image:', error);
        throw error;
      }

      uploadedUrls.push(publicUrlData.publicUrl);
    }

    return uploadedUrls;
  } catch (error) {
    console.error('[uploadImages] Error:', error);
    throw error;
  }
};

export const deleteIssueImage = async (imageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('issue_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  } catch (error) {
    console.error('[deleteIssueImage] Error:', error);
    throw error;
  }
};