"use client";

import { supabase } from '@/integrations/supabase/client';

export const uploadImages = async (issueId: string, userId: string, images: File[]): Promise<string[]> => {
  try {
    console.log('[uploadImages] Starting upload for issue:', issueId, 'with', images.length, 'images');
    const uploadedUrls: string[] = [];

    for (const image of images) {
      console.log('[uploadImages] Uploading image:', image.name);
      const fileExt = image.name.split('.').pop();
      const filePath = `${userId}/${issueId}/${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('issue-images')
        .upload(filePath, image);

      if (uploadError) {
        console.error('[uploadImages] Upload error:', uploadError);
        throw new Error(`Failed to upload ${image.name}: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('issue-images')
        .getPublicUrl(filePath);

      console.log('[uploadImages] Image uploaded:', publicUrlData.publicUrl);

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
        console.error('[uploadImages] Database error:', error);
        throw new Error(`Failed to save image record: ${error.message}`);
      }

      uploadedUrls.push(publicUrlData.publicUrl);
      console.log('[uploadImages] Image record saved successfully');
    }

    console.log('[uploadImages] All images uploaded successfully:', uploadedUrls.length);
    return uploadedUrls;
  } catch (error) {
    console.error('[uploadImages] Error:', error);
    throw error;
  }
};

export const deleteIssueImage = async (imageId: string): Promise<void> => {
  try {
    console.log('[deleteIssueImage] Deleting image:', imageId);
    const { error } = await supabase
      .from('issue_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('[deleteIssueImage] Error:', error);
      throw error;
    }
    console.log('[deleteIssueImage] Image deleted successfully');
  } catch (error) {
    console.error('[deleteIssueImage] Error:', error);
    throw error;
  }
};