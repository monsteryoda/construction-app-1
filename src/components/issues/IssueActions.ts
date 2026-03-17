"use client";

import { supabase } from '@/integrations/supabase/client';

export const uploadImages = async (issueId: string, userId: string, images: File[]): Promise<string[]> => {
  try {
    console.log('[uploadImages] Starting upload for issue:', issueId, 'with', images.length, 'images');
    const uploadedUrls: string[] = [];

    for (const image of images) {
      console.log('[uploadImages] Converting image to base64:', image.name);
      
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      console.log('[uploadImages] Base64 size:', base64.length);

      // Store image reference in database
      const { data, error } = await supabase
        .from('issue_images')
        .insert([{
          issue_id: issueId,
          image_url: base64,
          file_name: image.name,
        }])
        .select()
        .single();

      if (error) {
        console.error('[uploadImages] Database error:', error);
        throw new Error(`Failed to save image record: ${error.message}`);
      }

      uploadedUrls.push(base64);
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