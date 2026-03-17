"use client";

import { supabase } from '@/integrations/supabase/client';

export const uploadImages = async (issueId: string, userId: string, images: File[]): Promise<string[]> => {
  try {
    console.log('[uploadImages] Starting upload for issue:', issueId, 'with', images.length, 'images');
    
    if (images.length === 0) {
      console.log('[uploadImages] No images to upload');
      return [];
    }

    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`[uploadImages] Processing image ${i + 1}/${images.length}:`, image.name, 'size:', image.size);
      
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log(`[uploadImages] Image ${i + 1} converted to base64, size:`, reader.result?.toString().length);
          resolve(reader.result as string);
        };
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(image);
      });

      // Store image reference in database
      console.log(`[uploadImages] Saving image ${i + 1} to database...`);
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
        console.error(`[uploadImages] Error saving image ${i + 1}:`, error);
        throw new Error(`Failed to save image ${i + 1}: ${error.message}`);
      }

      uploadedUrls.push(base64);
      console.log(`[uploadImages] Image ${i + 1} saved successfully`);
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