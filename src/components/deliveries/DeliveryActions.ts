"use client";

import { supabase } from '@/integrations/supabase/client';

export const uploadImages = async (deliveryId: string, userId: string, files: File[]): Promise<number> => {
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
        .from('delivery_images')
        .insert([{
          delivery_id: deliveryId,
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

export const deleteDeliveryImage = async (imageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('delivery_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  } catch (error) {
    console.error('[deleteDeliveryImage] Error:', error);
    throw error;
  }
};